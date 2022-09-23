# -*- coding: utf-8 -*-
"""Create objects to send back to monitor requests."""

import time
import json

from flask_socketio import close_room, join_room

from .. import config

from .app import socketio
from .status import status
from .logutils import setup_worker_message_subscription

MONITOR_INTERVAL = 1.5

def compile_workers_monitor():
    message = {
        'status': status()
    }
    return message


def emit_workers_monitor_now(room=None):
    """Use this to send an updated monitor package immediately.

    Works inside of request context, so uses emit, not socketio.emit
    """
    try:
        message = compile_workers_monitor()
    except Exception as e:
        print("Error from monitoring thread %s" % e)
        socketio.emit('workers_monitor_error', {
            'error': 'Error while emitting workers monitor: %s' % e},
            namespace=config.SOCKET_NAMESPACE, room=room)
        raise
    else:
        socketio.emit('workers_monitor', message, namespace=config.SOCKET_NAMESPACE, room=room)


def close_room_fuzzy(room_to_close):
    if config.SOCKET_NAMESPACE in socketio.server.manager.rooms:
        for room_name_json in list(socketio.server.manager.rooms[config.SOCKET_NAMESPACE].keys()):
            if room_name_json is None or room_name_json.startswith("{") is False:
                continue
            room_name_dict = json.loads(room_name_json)
            if (room_name_dict['sessionid'] == room_to_close['sessionid'] and 
                room_name_dict['username'] == room_to_close['username']):
                close_room(room_name_json)


def close_room_same_monitor(room_to_close):
    if config.SOCKET_NAMESPACE in socketio.server.manager.rooms:
        for room_name_json in list(socketio.server.manager.rooms[config.SOCKET_NAMESPACE].keys()):
            if room_name_json is None or room_name_json.startswith("{") is False:
                continue
            room_name_dict = json.loads(room_name_json)
            if (room_name_dict['sessionid'] == room_to_close['sessionid'] and 
                room_name_dict['monitor'] == room_to_close['monitor'] and 
                room_name_dict['username'] == room_to_close['username']):
                close_room(room_name_json)


def close_sessions_rooms(session):
    """Remove session/username from corresponding rooms and close it."""
    username = session.get('username', None)
    sessionid = session.get('sessionid', None)

    if username and sessionid and config.SOCKET_NAMESPACE in socketio.server.manager.rooms:
        for room_name_json in list(socketio.server.manager.rooms[config.SOCKET_NAMESPACE].keys()):
            if room_name_json is None or room_name_json.startswith("{") is False:
                continue
            room_name_dict = json.loads(room_name_json)
            if (room_name_dict.get("monitor") is not None and
                room_name_dict.get("username") == username and
                room_name_dict.get("sessionid") == sessionid):
                close_room(room_name_json)


def send_pending_worker_messages(worker_message_subscription):
    """ Get socket messages that workers want to send """
    while True:
        message = worker_message_subscription.get_message()
        if message:
            if message["type"] == "message":
                try:
                    message_data = json.loads(message["data"])
                    room = message_data.get("room")
                    if room is None and message_data.get("username") is not None:
                        user_room = get_room_by_username(message_data.get("username"))
                        if user_room:
                            room = json.dumps(user_room)
                        else:
                            # Do not send this message. It was supposed to go to a specific user
                            # but that user is not listening in a room. So drop it and do not send it to everybody!
                            continue
                    socketio.emit(message_data["event"],
                                  {"message": message_data["data"]},
                                  room=room)
                except Exception as e:
                    print("Failed sending pending worker message: Error: %s\nmessage: %s" % (e, message))
        else:
            break

def get_rooms():
    rooms_dict = []
    if config.SOCKET_NAMESPACE not in socketio.server.manager.rooms:
        return rooms_dict
    for room in list(socketio.server.manager.rooms[config.SOCKET_NAMESPACE].keys()):
        if room is None or room.startswith("{") is False:
            continue
        rooms_dict.append(json.loads(room))

    return rooms_dict


def get_room_by_username(username):
    rooms = get_rooms()
    for room in rooms:
        if room["username"] == username:
            return room
    return None


def websocket_monitors():
    """Background monitor thread launched on server start.
    """

    # Should be set up only once
    worker_message_subscription = setup_worker_message_subscription()
    while True:
        send_pending_worker_messages(worker_message_subscription)

        if config.SOCKET_NAMESPACE in socketio.server.manager.rooms:
            for room in get_rooms():
                room_json = json.dumps(room)
                monitor = room['monitor']
                if monitor is None:
                    # Non bioinf related rooms can be ignored
                    continue
                signal = monitor + "_monitor"
                try:
                    if monitor == 'worker':
                        # for performance reasons only worker status, not batches
                        message = compile_workers_monitor()
                        signal = "workers_monitor"
                except Exception as e:
                    print("Error from monitoring thread %s" % e)
                    socketio.emit(
                        "%s_error" % signal,
                        {'error': 'Error while requesting monitor: %s' % e},
                        namespace=config.SOCKET_NAMESPACE,
                        room=room_json)
                    raise
                else:
                    socketio.emit(
                        signal,
                        message,
                        namespace=config.SOCKET_NAMESPACE,
                        room=room_json)
                    # Close unnecessary rooms
                    # NOTE: I do not close anymore, since we use the room to publish
                    # other messages, e.g. when we export files
                    """
                    if monitor == "overview_details":
                        if message["batch"]["date_finished"]:
                            if socketio.server.manager.rooms[config.SOCKET_NAMESPACE].get(room_json):
                                del socketio.server.manager.rooms[config.SOCKET_NAMESPACE][room_json]
                    """

        time.sleep(MONITOR_INTERVAL)
