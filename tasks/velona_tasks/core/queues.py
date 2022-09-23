# -*- coding: utf-8 -*-
"""Queues defs."""

from rq.queue import Queue
from rq.job import Job

# from .app import app
from .connections import conn1
from .. import config

queue_names = []
for _, qeues in config.WORKERS_BY_QUEUE_ON_HOST.items():
    for x in qeues.keys():
        queue_names.append(x)

available_queues = {x: Queue(x, connection=conn1, default_timeout=172800) for x in queue_names}

def clear_failed_queue():
    """Cache fq."""
    for _, q in available_queues.items():
        failed_job_ids = q.failed_job_registry.get_job_ids()
        for job_id in failed_job_ids:
            try:
                job = Job.fetch(job_id, connection=conn1)
                q.remove(job)
                job.delete()
            except:
                continue
