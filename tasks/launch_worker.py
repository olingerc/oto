# -*- coding: utf-8 -*-
"""
External worker script to create workers.

Use this to start workers

Uses same codebase but only part of it. Avoid using "app", use config instead
"""
import os
import sys
import traceback

# Import rq from my local fork
# sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'rq')) # TODO: remove this completely? it was predocker

from rq import Connection, Worker  # noqa: E402
from velona_tasks.core.connections import conn1  # noqa: E402

"""
Queues should be comma separated list.

e.g. python launch_worker.py single,long
"""

listen = ['single']  # default
log = 'stdout'  # or logfile
if len(sys.argv) > 1:
    listen = [x.strip() for x in sys.argv[1].split(',')]

# Set up connections that every worker will need
# It is less perfroamnt if you connect at the beginning of each job. 
if os.environ.get("WORKER_NAME_SUFFIX", None):
    # This is only on dev machine in order to be able to do scale > 1
    # the worker name needs to include the container name, since it it used to 
    # stop containers from tasks api
    # In prod, the tasks api defines the container name itself on docker container creation
    # but in dev it is docker-compose and there is no way to have dymanic names in the docker-compose file in case scale > 1
    container_name = os.popen("basename $(cat /proc/1/cpuset)").read().strip()  ## this contains the docker container name!
    worker_name = container_name + "---" + os.environ.get("WORKER_NAME_SUFFIX", None)
    os.environ["WORKER_NAME"] = worker_name
else:
    worker_name = os.environ.get("WORKER_NAME", None)
if __name__ == '__main__':
    with Connection(connection=conn1):
        w = Worker(listen, name=worker_name)
        w.log_result_lifespan = False
        w.log_job_description  = False
        w.work()
