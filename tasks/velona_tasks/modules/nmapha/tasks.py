# -*- coding: utf-8 -*-
"""Summary.
"""
import time

from ...core.connections import Pg_session

from ... import config

def execute_nmap_ha():
    
    session = Pg_session()
    import nmap3
    time.sleep(2)
    print(session)
    print("DONE")
    
    nmap = nmap3.Nmap()
    results = nmap.scan_top_ports("192.168.178.20-130")
    print(results)

    return "Import successful"
