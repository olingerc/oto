# -*- coding: utf-8 -*-
"""
External worker script to create workers.

Use this to start workers

Uses same codebase but only part of it. Avoid using "app", use config instead
"""
import os
import sys
import socket

# Import rq from my local fork
# sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'rq')) # TODO: remove this completely? it was predocker

from rq import Connection, Worker  # noqa: E402
from velona_tasks.core.connections import conn1  # noqa: E402

"""
Queues should be comma separated list.

e.g. python launch_worker.py scheduled
"""

listen = ['scheduled']  # default
log = 'stdout'  # or logfile
if len(sys.argv) > 1:
    listen = [x.strip() for x in sys.argv[1].split(',')]
    container_name = socket.gethostname()
    worker_name = container_name
    os.environ["WORKER_NAME"] = worker_name
else:
    worker_name = os.environ.get("WORKER_NAME", None)
if __name__ == '__main__':
    with Connection(connection=conn1):
        w = Worker(listen, name=worker_name)
        w.log_result_lifespan = False
        w.log_job_description  = False
        w.work()
