# -*- coding: utf-8 -*-

"""Workers.

TODO: check that during task deletion: os.kill works! ALso see with pkill
TODO: if I force kill a worker, tasks remain as running. maybe monitor should check this? Beause rq can't
"""

import os
import signal
from time import sleep

import docker
from dotenv.main import dotenv_values
from rq import Worker

from .. import config
from ..common.utils import random_string

from .logutils import setup_task_logger
from .connections import conn1

_docker_client = {}  # cache docker client
logger = setup_task_logger("Tasks core")


def _get_docker(host):
    """
    Create a cached server instance.
    Host needs to be configure in the .ssh/config file (ssh_config is copied there during tasks docker build)

    For socket connection when supervisor gets python3 support:
    https://stackoverflow.com/questions/11729159/use-python-xmlrpclib-with-unix-domain-sockets
    """
    global _docker_client
    if host not in _docker_client:
        try:
            logger.info("Trying to connect to ssh host %s" % host)
            _docker_client[host] = docker.DockerClient(base_url="ssh://" + host)
            logger.info("Connected to docker host on %s" % (host))
        except Exception as e:
            logger.error("Failed connecting to docker client on ssh host %s. Check ssh config file." % host)
            logger.error(e, exc_info=True)
            raise Exception(e)

    return _docker_client[host]

def _run_worker_docker(queues, worker_name, host):
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "worker", ".env." + os.environ.get("FLASK_ENV", "development"))
    env_dict = dotenv_values(env_path)
    env_dict["QUEUES"] = ",".join(queues)
    env_dict["FLASK_ENV"] = os.environ.get("FLASK_ENV", "development")
    env_dict["WORKER_NAME"] = worker_name

    # -------- HANDLE SECRETS PASSWORDS START ---------
    # Velona host has passwords via secrets files /run/secrets/... as created by docker-compose
    # but worker has no secrets since directly started via docker
    # until I have k8s, I push from tasks to worker environment
    # certificates are injected into /run/secrets after container creation below
    env_dict["REDIS_PW"] = config.REDIS_PW
    env_dict["FLASK_SECRET"] = config.FLASK_SECRET
    # -------- HANDLE SECRETS PASSWORDS END ---------

    # NOTE: prefix oto_ since created by docker-compose
    volumes = {
    }
    privileged = False
    extra_hosts = {}

    if os.environ.get("FLASK_ENV", "development") == 'development':
        volumes["oto_tasks_source"] = {"bind": "/home/oto/app/velona_tasks", "mode": "rw"}
        extra_hosts["host.docker.internal"] = "host-gateway"  # WSL2 does not set host.docker.internal by default

    d = _get_docker(host)
    try:
        worker_image = config.WORKER_IMAGE_TAG
        container = d.containers.run(
            worker_image,
            #auto_remove=True, # NOTE: comment this to get to logs if container does not start. use docker ps -a
            detach=True,
            environment=env_dict,
            name=worker_name.split("---")[0],
            volumes=volumes,
            extra_hosts=extra_hosts,
            privileged=privileged
            )
        logger.info("Docker image %s started" % (worker_image))
    except docker.errors.ImageNotFound:
        raise Exception("Image %s not built yet" % worker_image)
    except Exception as e:
       logger.error("Failed running container: %s" % e, exc_info=True)
       raise e

    # -------- HANDLE SECRETS CERTIFICATES START ---------
    # NOTE: Remove when switching workers to K8s with correct secrets

    # OTO host has passwords via secrets files /run/secrets/... as created by docker-compose
    # but worker has no secrets since directly started via docker
    # until I have k8s, I inject manually into the same location as expected by config
    secrets_to_inject = [
        "SSH_KEY_DOCKER_HOST"
    ]
    try:
        container.exec_run("mkdir /run/secrets", user="root")
        for secret_file in secrets_to_inject:
            with open("/run/secrets/" + secret_file, 'r') as f:
                secret_content = f.read().strip()
                container.exec_run("sh -c \"echo '{0}' > {1}\"".format(secret_content, "/run/secrets/" + secret_file), user="root")
    except Exception as e:
       logger.error("Failed injecting secrets: %s" % e, exc_info=True)
       raise e
    # -------- HANDLE SECRETS CERTIFICATES END ---------

def add_new_worker(queues, host):
    """Add a new worker.

    In my setup, each worker can only have one queue

    return None for no error and string if error
    """
    logger.info("Starting worker docker on queues %s on host %s" % (queues, host))
    _run_worker_docker(queues, "oto_worker_%s---%s" % (random_string(4), host), host)


def remove_all_worker_containers():
    hosts = config.WORKERS_BY_QUEUE_ON_HOST.keys()
    for host in hosts:
        d = _get_docker(host)
        # Get current containers and cancel them
        existing = d.containers.list()
        for container in existing:
            print("remove_all_worker_containers", container.name)
            if container.name.startswith("oto_worker"):
                logger.debug('Removing worker container %s' % container.name)
                container.remove(force=True)

def cancel_all_workers():
    # Only stop those that are idle and have not yet been asked to stop 
    already_cancelled = []
    for w in Worker.all(connection=conn1):
        host = w.name.split("---")[-1]
        if w.shutdown_requested_date is not None:
            already_cancelled.append(int(w.name.split('#')[0]))
        elif w.state == "busy":
            kill_worker_gently(w.name, host)
        else:
            kill_worker_evil(w.name, host)


def default_workers():
    # Get configured qs and start them
    for host, queues in config.WORKERS_BY_QUEUE_ON_HOST.items():
        for q, number in queues.items():
            for _ in range(0, number):
                try:
                    add_new_worker([q], host)
                except:
                    logger.error("Could not start worker on %s during default worker startup" % host)


def kill_worker_gently(worker_name, host=None):
    if host is None:
        host = worker_name.split("---")[-1]
    container_name = worker_name.split("---")[0]
    d = _get_docker(host)
    try:
        container = d.containers.get(container_name)
        container.kill(signal.SIGTERM)
    except OSError:
        logger.info('(kill soft). Container %s does not exist' % container_name)
    except Exception as e:
        logger.error("Error canceling worker: %s" % e, exc_info=True)
        raise e


def kill_container(container_name, host):
    if host is None:
        host = container_name.split("---")[-1]
    d = _get_docker(host)
    try:
        container = d.containers.get(container_name)
        container.kill()
    except OSError:
        logger.info('(kill evil). Container %s does not exist' % container_name)
    except Exception as e:
        logger.error("Error killing docker container: %s" % e, exc_info=True)
        raise e

def kill_worker_evil(worker_name, host=None):
    # get worker from rq and current_job
    current_job = None
    worker_instance = None
    for w in Worker.all(connection=conn1):
        if w.name == worker_name:
            worker_instance = w
            break
    try:
        current_job = worker_instance.get_current_job()
        current_job.refresh()
    except Exception as e:
        pass

    # Kill worker
    container_name = worker_name.split("---")[0]
    host = worker_name.split("---")[1]
    kill_container(container_name, host)

    if worker_instance:
        w.register_death()
        return worker_instance.queue_names()
    else:
        return None
