# -*- coding: utf-8 -*-
"""Deifintion of web socket routes."""
import json
import os
from sys import exc_info
import time
import traceback
from uuid import uuid4

from flask import request, session
from flask_socketio import emit, join_room, disconnect

from .app import app, socketio
from .logutils import setup_task_logger
from .workers import kill_worker_gently, default_workers, cancel_all_workers
from .monitor import close_sessions_rooms, emit_workers_monitor_now, emit_queued_monitor_now


logger = setup_task_logger("Tasks core")


"""

Websocket connection handling

"""


@socketio.on('connect', namespace=app.config['SOCKET_NAMESPACE'])
def on_connect():
    """On connect.

    A user gets a session id and the username is stored in the session
    """
    username = request.args.get('username', None)
    groupId = request.args.get('groupId', None)
    if not username:
        emit(
            'connect',
            {'message': 'Please provide a valid username'})
        disconnect()
    else:
        session['sessionid'] = str(uuid4())
        session['username'] = username
        session['groupId'] = groupId

        # Always join a room by default
        room_name = {"sessionid": session['sessionid'], "username": username, "monitor": None}
        room_name_json = json.dumps(room_name)
        join_room(room_name_json)
        session['current_room'] = room_name_json


@socketio.on('disconnect', namespace=app.config['SOCKET_NAMESPACE'])
def on_disconnect():
    """On disconnect.

    Close all associated rooms of that session
    """
    close_sessions_rooms(session)
    session['current_room'] = None


@socketio.on_error_default  # handles all namespaces without an explicit error handler
def default_error_handler(e):
    logger.error("Uncaught error", exc_info=True)
    print('********** Error caught by websocket *************')
    print("   Request info and arguments: ")
    print("   %s" % request.event["message"])  # "my error event"
    type, value, tb = exc_info()
    print('%s: %s' % (e, traceback.format_exc()))
    try:
        if 'args' in request.event:
            print("   %s" % request.event["args"] or "???")    # (data,)
    except:
        pass


"""

Dashboard interactions

"""
@socketio.on('request_worker_monitor_disconnect', namespace=app.config['SOCKET_NAMESPACE'])
def worker_monitor_disconnect():
    """On worker monitor disconnect.

    Close websocket room for that session
    Catches client disconnects (prepared) and browser closes
    """
    close_sessions_rooms(session)
    session['current_room'] = None


@socketio.on('request_worker_monitor', namespace=app.config['SOCKET_NAMESPACE'])
def request_worker_monitor():
    """Cf request_pipelines_monitor."""
    sessionid = session.get('sessionid', None)
    username = session.get('username', None)

    if sessionid and username:
        room_name = {"sessionid": sessionid, "username": username, "monitor": "worker"}
        room_name_json = json.dumps(room_name)
        join_room(room_name_json)
        session['current_room'] = room_name_json
        emit_workers_monitor_now(room=room_name_json)


@socketio.on('request_queued_monitor', namespace=app.config['SOCKET_NAMESPACE'])
def request_queued_monitor():
    """Cf request_pipelines_monitor."""
    sessionid = session.get('sessionid', None)
    username = session.get('username', None)

    if sessionid and username:
        room_name = {"sessionid": sessionid, "username": username, "monitor": "queued"}
        room_name_json = json.dumps(room_name)
        join_room(room_name_json)
        session['current_room'] = room_name_json
        emit_queued_monitor_now(room=room_name_json)


@socketio.on('default_workers', namespace=app.config['SOCKET_NAMESPACE'])
def default_workers_signal():
    room = session.get("current_room")
    try:
        default_workers()
    except Exception as e:
        logger.error("Error %s while starting default workers" % e, exc_info=True)
    finally:
        emit_workers_monitor_now(room=room)


@socketio.on('cancel_worker', namespace=app.config['SOCKET_NAMESPACE'])
def cancel_worker(message):
    room = session.get("current_room")
    worker_name = message.get('worker_name')
    try:
        kill_worker_gently(worker_name)
    except Exception as e:
        logger.error("Error %s while canceling worker: %s" % (e, worker_name), exc_info=True)
    finally:
        emit_workers_monitor_now(room=room)


@socketio.on('cancel_all_workers', namespace=app.config['SOCKET_NAMESPACE'])
def cancel_all_workers_route():
    room = session.get("current_room")
    try:
        cancel_all_workers()
    except Exception as e:
        logger.error("Error %s while canceling workers" % (e), exc_info=True)
    finally:
        emit_workers_monitor_now(room=room)
