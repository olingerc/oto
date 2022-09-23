# -*- coding: utf-8 -*-
"""Connections.

I want to have connection separate from app because
each job imports this and they do not need to create a
Flask app or socket each time

NOTE: These connections need to be set up before anything
Do not try to create a connect_mongo() or connect_redis() and run them in server.py
It will not work !!!!!!
"""

from redis import Redis, ConnectionError
from mongoengine import connect

from .. import config



def connect_mongo():
    """Connect mongo_db.

    This allows mongoengine to be used throughout the app without having an
    instance floating around.
    """
    try:
        connect(config.MONGODB_DB, host=config.MONGODB_HOST,
                username=config.MONGODB_USER, password=config.MONGODB_PW,
                connect=False,
                authentication_source="velona")
        """print(" * Connecting to mongo ...")
        print(" * Test actual connection. Should get Batch or None, but not fail: ", BatchSchema.objects.first())
        print(" * Successfully connected to mongodb db %s on %s" % (
            config.MONGODB_DB,
            config.MONGODB_HOST)
        )"""
        # test actually getting an object
        # _ = BatchSchema.objects.first()
    except Exception as e:
        print(" * Exception during MongoDB connection: %s" % e)
        raise(e)


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
