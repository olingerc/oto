# -*- coding: utf-8 -*-
from collections import defaultdict
from operator import itemgetter
import pickle
import time
import zlib
import inspect
from os import path, walk
from importlib import import_module

from rq.connections import Connection
from rq.exceptions import DeserializationError
from rq import get_current_job
from rq.job import Job, NoSuchJobError
from rq.registry import FinishedJobRegistry, StartedJobRegistry, DeferredJobRegistry, FailedJobRegistry

from ..common.utils import random_string
from .connections import conn1
from .queues import available_queues

from .tasks import copy_files

KNOWN_TASK_FUNCTIONS = None

def _as_text(v):
    if v is None:
        return None

    # Default rq serailzer = pickle. Try that first
    try:
        v = pickle.loads(v)
    except:
        # not pickled data
        pass

    if isinstance(v, bytes):
        return v.decode('utf-8')
    elif isinstance(v, str):
        return v
    elif isinstance(v, dict):
        return v
    elif isinstance(v, list):
        return v
    else:
        raise ValueError('Unknown type %r' % type(v))


def _hello_rq(*args, **kwargs):
    job = get_current_job()
    print(args)
    print(kwargs)
    for _ in range(0, 100):
        job.meta["progress"] = _
        print("Progress %s" % _)
        job.save_meta()
        time.sleep(0.1)
        print("hallo")
    return "Said hallo"


def _known_task_functions():
    """
    Check in allo modules if there is a tasks.py file
    This file should contain methods meant to be called via rq
    """
    task_functions = {}

    # core
    task_functions["copy_files"] = copy_files

    # modules
    task_source_file_names = []
    module_root = path.dirname(path.dirname(path.realpath(__file__))) + "/modules"
    for directory in [x[0] for x in walk(module_root)]:
        potential_file = path.join(directory, "tasks.py")
        if path.exists(potential_file):
            task_source_file_names.append(potential_file)
    
    for source_file_name in task_source_file_names:
        tasks_module_name = path.basename(path.dirname(source_file_name)) + ".tasks"
        task_module = import_module('velona_tasks.modules.' + tasks_module_name)
        for key in dir(task_module):
            attribute = getattr(task_module, key)
            if inspect.isfunction(attribute):
                if inspect.getsourcefile(attribute) == source_file_name and not attribute.__name__.startswith("_"):
                    task_functions[attribute.__name__] = attribute
    
    return task_functions


def send_job_to_rq(func_string, job_def, *args, **kwargs):
    # Cache known functions
    global KNOWN_TASK_FUNCTIONS
    if KNOWN_TASK_FUNCTIONS is None:
        KNOWN_TASK_FUNCTIONS = _known_task_functions()

    func = KNOWN_TASK_FUNCTIONS.get(func_string, _hello_rq)
    jobid = func_string + "-" + random_string(6)
    meta = job_def.get("meta", {})
    description = job_def.get("description", str(func_string))

    ttl = job_def.get("ttl", None)  # how long to queue before cancelling
    timeout = job_def.get("timeout", 60 * 60 * 24 * 2)  # how long to permit running
    result_ttl = job_def.get("result_ttl", 60 * 60 * 24 * 3)  # default 3 days
    failure_ttl = job_def.get("failure_ttl", 60 * 60 * 24 * 30)  # how long to keep if failed

    q = available_queues.get(job_def.get("queue", "single"), None)
    if q is None:
        message = 'You did not provide a valid queue'
        raise Exception(message)

    # Only one scheduled job can be running at any given time
    if q.name == "scheduled" and _is_scheduled_job_running(func_string) is True:
        message = "Scheduled job %s is already running or queued. Will not enqueue again." % func_string
        raise Exception(message)

    try:
        with Connection(conn1):
            job = Job.create(func, 
                            ttl=ttl, meta=meta, timeout=timeout,
                            result_ttl=result_ttl, failure_ttl=failure_ttl,
                            description=description,
                            id=jobid,
                            args=args,
                            kwargs=kwargs)
            q.enqueue_job(job)
    except Exception as e:
        message = 'Error sending job to rq. Error type: %s' % e
        raise Exception(message)
    else:
        return job


def jobid_to_jobdict(jobid):
    try:
        job = Job.fetch(jobid, connection=conn1)
        return job_to_dict(job)
    except NoSuchJobError:
        return {"id": jobid, "exists": False}
    return job


def job_to_dict(job):
    if job is None:
        return None
    _id = job.id
    try:
        job_args = job.args  # not in to_dict
        # I had deleted pipelines raising Deserialization errors because Mongo could no longer find them
    except DeserializationError:
        job_args = None
    try:
        job_kwargs = job.kwargs
    except DeserializationError:
        job_kwargs = None
    job = job.to_dict(include_meta=True)
    job['id'] = _id
    job['status'] = _as_text(job['status'])  # to avoid bytes non json seriazable errors
    job['data'] = None  # to avoid non json seriazable errors
    job['args'] = job_args
    job['kwargs'] = job_kwargs

    if "meta" in job:
        try:
            job["meta"] = _as_text(job["meta"])
        except Exception as e:
            # job["meta"] = job["meta"].decode("cp437") # this is an old encoding which can do everything
            job["meta"] = "Failed to serialize meta %s" % e

    if "result" in job:
        if job["description"] == "ngssync_parse":
            job["result"] = "no job result info provided"
        try:
            job["result"] = _as_text(job["result"])
        except Exception as e:
            job["result"] = "Failed to serialize result %s" % e

    raw_exc_info = job.get('exc_info')
    if raw_exc_info:
        try:
            job['exc_info'] = _as_text(zlib.decompress(raw_exc_info))
        except zlib.error:
            # Fallback to uncompressed string
            try:
                job['exc_info'] = _as_text(raw_exc_info)
            except:
                pass
    return job


def get_failed_jobs(first=None, rows=None):
    jobs = []
    for _, q in available_queues.items():
        jobs += [jobid_to_jobdict(job_id) 
                for job_id in q.failed_job_registry.get_job_ids()]
    jobs = [x for x in jobs if x.get("exists", True)]
    jobs = sorted(jobs, key=itemgetter('created_at'), reverse=True)
    if first and rows:
        data = jobs[first:first + rows]
    else:
        data = jobs

    return {
        "total": len(jobs),
        "queues": list(available_queues.keys()),
        "data": data
    }


def _is_scheduled_job_running(func_string):
    """
    Make unique: Check if running or alraedy queued before sending to rq
    """
    queue = available_queues.get("scheduled")
    scheduled_job_ids = queue.get_job_ids() + StartedJobRegistry(queue=queue).get_job_ids()
    for jobid in scheduled_job_ids:
        if jobid.startswith(func_string):
            return True
    return False


def get_specific_running_scheduled_job(func_string):
    """
    Since jobs are unique, there can only be one running of a given type.
    """
    queue = available_queues.get("scheduled")
    scheduled_running_jobids = StartedJobRegistry(queue=queue).get_job_ids()
    for jobid in scheduled_running_jobids:
        if jobid.startswith(func_string):
            return jobid_to_jobdict(jobid)
    return None


def get_jobs_from_queues_by_description(queues, limit=3):
    rq_queues = []
    for q in queues:
        rq_queues.append(available_queues.get(q))

    jobids = []
    limiter = defaultdict(int)

    for rqueue in rq_queues:

        # no limit necessary because expected number is very small
        for jobid in rqueue.get_job_ids():
            jobids.append(jobid)
        for jobid in StartedJobRegistry(queue=rqueue).get_job_ids():
            jobids.append(jobid)
        for jobid in DeferredJobRegistry(queue=rqueue).get_job_ids():
            jobids.append(jobid)
        for jobid in FailedJobRegistry(queue=rqueue).get_job_ids():
            jobids.append(jobid)

        # for finished, only get last x for each type
        for jobid in reversed(FinishedJobRegistry(queue=rqueue).get_job_ids()):
            limiter[jobid[0:-7]] += 1
            if limiter[jobid[0:-7]] <= limit:
                jobids.append(jobid)
    
    # fetch jobs from redis
    jobs = [job_to_dict(x) for x in Job.fetch_many(jobids, conn1) if x is not None]

    # by func_string
    categorized = defaultdict(list)
    for job in jobs:
        categorized[job["description"]].append(job)
    
    # Sorting by category is faster than sorting all jobs together. 
    # NOTE: is sorting by time even necessary? Is it not ordered in redis already?
    categorized_sorted = {}
    for category, jobs in categorized.items():
        categorized_sorted[category] = sorted(jobs, key=itemgetter('created_at'), reverse=True)[0:limit]

    return categorized_sorted
 

def get_queued_jobs():
    by_queue = {}
    for name, q in available_queues.items():
        by_queue[name] = [job_to_dict(x) for x in q.get_jobs() if x is not None]
    
    return by_queue
