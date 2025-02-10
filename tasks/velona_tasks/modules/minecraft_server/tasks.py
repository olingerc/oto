# -*- coding: utf-8 -*-
"""Summary.
"""
from contextlib import contextmanager
from copy import copy
import json

from ...core.connections import Pg_session
from ...common.utils import iso_time_string

from .models import MinecraftServerLastResult
from .telegram import send_message

import time

from ... import config


@contextmanager
def _session_scope():
    session = Pg_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def _get_last_status():
    
    with _session_scope() as session:
        doc = session.query(MinecraftServerLastResult).first()
        if doc:
            return doc.state
        else:
            return None

def _set_last_status(state):
    
    with _session_scope() as session:
        doc = session.query(MinecraftServerLastResult).first()
        doc.state = state

def check_server_status():
    
    from mcstatus import JavaServer
    
    last_status = _get_last_status()
    print(last_status)
    print("Got last status: {}".format(last_status))
    # Falsafe. if db has no entry, do not continue
    if last_status is None:
        return True
    
    # get minecraft status
    print("Trying to get status:")

    # Get status from server
    MAX_RETRY = 3
    retry_count = 0
    while retry_count < MAX_RETRY: 
        try:
            server = JavaServer.lookup("krusa2411.aternos.me:25595")
            status = server.status()
            players_online = status.players.online
            print(f"Got players: {status.players}")

            if str(players_online) != last_status:
                _set_last_status(str(players_online))
                send_message(f"Players online: {players_online}")
        
            message = {
                "last_status": last_status,
                "new_status": str(players_online)
            }            
            return json.dumps(message, indent=3)
        except Exception as e:
            time.sleep(3)
            retry_count += 1
            print(f"Try: {retry_count}")
            if retry_count >= MAX_RETRY:
                print("Could not get satus")
                print(e)
                error_message = str(e)
                if len(error_message) > 500:
                    error_message = error_message[0:500]
                
                _set_last_status(f"Error {error_message}")
                send_message(error_message)
                raise e
