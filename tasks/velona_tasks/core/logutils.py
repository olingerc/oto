# -*- coding: utf-8 -*-
"""Logging releated."""

import json
import logging
import os
import sys

from .connections import conn1
from .. import config

""" Logger
PROD
Everything goes to GELF, noth tasks api and workers

DEV
Everything goes to STDOUT.
docker sends worker output to GELF (cf workers.py)

Graylog gets all docker output
This logger can be used for specific logs.
I could use stdout and let it get caught by docker output but like this I get
more info about context

This function works on tasks server but also within worker!

"""
_loggers = {}

def setup_task_logger(module_name):
    global _loggers
    if module_name in _loggers:
        return _loggers.get(module_name)

    # Create logger
    logger = logging.getLogger(module_name)
    logger.setLevel(logging.DEBUG)

    stdout_handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    stdout_handler.setFormatter(formatter)
    logger.addHandler(stdout_handler)

    _loggers[module_name] = logger

    return logger


"""
Sending messages from worker to tasks via redis PUBSUB
"""
def setup_worker_message_subscription():
    conn1_pubsub = conn1.pubsub()
    conn1_pubsub.subscribe("worker_socket_messages")
    return conn1_pubsub


def publish_worker_message(event, data, room=None, username=None):
    message = dict(event=event, data=data, room=room, username=username)
    conn1.publish("worker_socket_messages", json.dumps(message))
