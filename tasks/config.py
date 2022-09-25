# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


class Config(object):
    """Application settings."""

    # APP
    LISTEN_ON = os.getenv("LISTEN_ON")
    PORT = os.getenv("PORT")

    # JWT
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = ""
    JWT_IDENTITY_CLAIM = "username"
    JWT_ACCESS_TOKEN_EXPIRES = False
    try:
        with open('/run/secrets/WEBTOKEN_SECRET', 'r') as f:
            JWT_SECRET_KEY = f.read().strip()
    except:
        JWT_SECRET_KEY = os.getenv("WEBTOKEN_SECRET")
    # tokens are generated by Node backend. 
        
    # FLASK
    SOCKET_NAMESPACE = "/"  # DO NOT CHANGE
    DEBUG = os.getenv("DEBUG") == "TRUE"
    try:
        with open('/run/secrets/FLASK_SECRET', 'r') as f:
            FLASK_SECRET = f.read().strip()
    except:
        FLASK_SECRET = os.getenv("FLASK_SECRET")
    TRAP_BAD_REQUEST_ERRORS = True

    # CORS ROUTES
    # during devel, it's coming from webpack devel server on 8080
    CORS_ALLOWED = os.getenv("CORS_ALLOWED", "").split(",")

    # MONGODB
    MONGODB_DB = os.getenv("MONGODB_DB")
    MONGODB_HOST = os.getenv("MONGODB_HOST")
    try:
        with open('/run/secrets/MONGODB_USER', 'r') as f:
            MONGODB_USER = f.read().strip()
    except:
        MONGODB_USER = os.getenv("MONGODB_USER")
    try:
        with open('/run/secrets/MONGODB_PW', 'r') as f:
            MONGODB_PW = f.read().strip()
    except:
        MONGODB_PW = os.getenv("MONGODB_PW")

    # REDIS
    REDIS_HOST = os.getenv("REDIS_HOST")
    REDIS_PORT = os.getenv("REDIS_PORT")
    try:
        with open('/run/secrets/REDIS_PW', 'r') as f:
            REDIS_PW = f.read().strip()
    except:
        REDIS_PW = os.getenv("REDIS_PW")

    WORKER_SETUP = os.getenv("WORKER_SETUP")
    WORKER_IMAGE_TAG = os.getenv("WORKER_IMAGE_TAG")

    # Fixed
    """
    Queues and threads per queue
    """
    # loded by BaseTask
    THREADS = {
        "single": {
            "DEV": 1,
            "PROD": 1
        }
    }

    """
    Workers
    Number of default workers by queue and worker (worker host names as defined in .ssh/config)
    """
    WORKERS_BY_QUEUE = {
        "DEV": {
            "dev_docker_host": {
                "single": 1,
                "scheduled": 1
            }
        },
        "PROD": {
            "kitchenpi": {
                "single": 2,
                "scheduled": 1
            }
        }
    }
    # Gather threads by queue on this host
    THERADS_BY_QUEUE_ON_HOST = {}
    for queue, hosts in THREADS.items():
        THERADS_BY_QUEUE_ON_HOST[queue] = hosts[WORKER_SETUP.upper()]

    WORKERS_BY_QUEUE_ON_HOST = WORKERS_BY_QUEUE[WORKER_SETUP.upper()]

    SCHEDULE_ON_START = os.getenv("SCHEDULE_ON_START")  == "TRUE"
    try:
        COPY_ALL_INTERVAL = int(os.getenv("COPY_ALL_INTERVAL"))
    except:
        COPY_ALL_INTERVAL = 300
    