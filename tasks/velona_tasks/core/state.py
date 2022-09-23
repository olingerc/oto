# -*- coding: utf-8 -*-
from mongoengine import (Document, DictField, IntField)

from .connections import conn1 as r
from .logutils import setup_task_logger

logger = setup_task_logger("Tasks core")


"""
Mongo document state (long term)
"""

class TasksStateSchema(Document):
    """ Model to contain persistent states of jobs """

    statetid = IntField(unique=True) # we just want one document
    state = DictField(unique=True)

    meta = {
        'collection': 'tasks_state'
    }


def get_state():
    state_document = TasksStateSchema.objects(statetid=1).first()
    if not state_document:
        state_document = TasksStateSchema(statetid=1)
    return state_document.state or {}


def store_state(param, value):
    state_document = TasksStateSchema.objects(statetid=1).first()
    if not state_document:
        state_document = TasksStateSchema(statetid=1)


    current_sate = state_document.state or {}
    current_sate[param] = value
    state_document.state = current_sate

    state_document.save()


"""
Redis state (short term)
"""
def get_key(key):
    value = r.get(key)
    return value

def set_key(key, value):
    r.mset({key: value})

def add_to_list(key, value):
    return r.lpush(key, value)

def is_string_in_list(key, value):
    for x in r.lrange(key, 0, -1):
        if x.decode() == str(value):
            return True
    return False

def remove_from_list(key, value):
    r.lrem(key, value, 0)

def expire_key(key):
    r.expire(key, 0)
