# -*- coding: utf-8 -*-
"""Create flask app.

I did not put this into __init__.py because I
do not want rq to call that code each time
a job is created by worker. A job does not need this.
Also, this allows workers to import things from
the velona_tasks module without causing strange
redis connection behaviour
"""

from flask import Flask
from flask_socketio import SocketIO
from flask_session import Session
from config import Config
from flask_jwt_extended import JWTManager
import redis

app = Flask(__name__)
app.config.from_object(Config)

# Manage Session, needed for shared userbames between http and websocket sessions
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS']  = redis.Redis(password=app.config['REDIS_PW'],
                                           host=app.config['REDIS_HOST'],
                                           port=app.config['REDIS_PORT'])
Session(app)
jwt = JWTManager(app)
socketio = SocketIO(app, path="taskssocket",
                    manage_session=False,
                    cors_allowed_origins=app.config.get("CORS_ALLOWED", []),
                    engineio_logger=False,
                    logger=False)
