# -*- coding: utf-8 -*-
from rq import Worker
from rq.job import NoSuchJobError

from .connections import conn1


def status(simple=False):
    result = {}
    workers = Worker.all(connection=conn1)

    result['w'] = []
    if simple is True:
        for worker in workers:
            result['w'].append(getattr(worker, 'name', 'blupp'))
    else:
        """
        # registered queues
        queue_names = []
        for worker in workers:
            queue_names += worker.queue_names()

        # Disitinct (does not preserve order)
        queue_names = list(set(queue_names))
        
        result['q'] = queue_names
        """

        # Individual workers
        worker_pids = []
        for worker in workers:
            this_worker = {
                "name": worker.name,
                "queues": worker.queue_names(),
                "status": worker.get_state()
            }
            if worker.shutdown_requested_date:
                this_worker['warm_shutdown_requested'] = True
            try:
                currentjob = worker.get_current_job()
            except NoSuchJobError:
                currentjob = None
            if currentjob:
                _id = currentjob.id
                currentjob = currentjob.to_dict()
                currentjob['id'] = _id
                currentjob['status'] = str(currentjob['status'])  # to avoid bytes non json seriazable errors
                currentjob['meta'] = None  # to avoid non json seriazable errors
                currentjob['data'] = None  # to avoid non json seriazable errors
                this_worker['currentjob'] = currentjob

            result['w'].append(this_worker)

    return result
