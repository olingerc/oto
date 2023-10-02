# -*- coding: utf-8 -*-
"""Summary.
"""
import time

from ...core.connections import Pg_session

from ... import config

def execute_nmap_ha():
    
    session = Pg_session()
    time.sleep(2)
    print(session)
    print("DONE")
    a = 1/0
    return "Import successful"
