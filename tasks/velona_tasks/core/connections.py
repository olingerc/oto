# -*- coding: utf-8 -*-
"""Connections.

I want to have connection separate from app because
each job imports this and they do not need to create a
Flask app or socket each time

NOTE: These connections need to be set up before anything
It will not work !!!!!!
"""

from redis import Redis, ConnectionError

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from .. import config

# Postgres
engine = create_engine(config.POSTGRES_URI, echo=False, future=True, pool_pre_ping=True)
Pg_session = scoped_session(sessionmaker(bind=engine))

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
