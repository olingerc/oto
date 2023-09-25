# -*- coding: utf-8 -*-
"""Connections.

I want to have connection separate from app because
each job imports this and they do not need to create a
Flask app or socket each time

NOTE: These connections need to be set up before anything
It will not work !!!!!!
"""

from redis import Redis, ConnectionError

from .. import config


def connect_redis():
    conn1 = Redis(
        host=config.REDIS_HOST,
        port=config.REDIS_PORT,
        password=config.REDIS_PW)

    try:
        test = conn1.client_list()
        print(" * Redis Connection OK")
        return conn1
    except Exception as e:
        print(" * Redis Connection ERROR")
        print(" * Tried on %s port %s" % (
            config.REDIS_HOST,
            config.REDIS_PORT)
        )
        print(" * Exception during Redis connection: %s" % e)
        raise(e)


# Redis connection, needs to be set up here
conn1 = connect_redis()
