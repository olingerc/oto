# -*- coding: utf-8 -*-
"""Summary.
"""
from contextlib import contextmanager
import time

from ...core.connections import Pg_session
from sqlalchemy import select
from .models import NmapScan

from ... import config


@contextmanager
def session_scope():
    session = Pg_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def execute_nmap_ha():
    
    """
    Example
    "192.168.178.39": {
        "osmatch": {},
        "ports": [],
        "hostname": [],
        "macaddress": None,
        "state": {"state": "down", "reason": "no-response", "reason_ttl": "0"}},

    "192.168.178.24": {
        "osmatch": {},
        "ports": [
            {"protocol": "tcp", "portid": "21", "state": "closed", "reason": "conn-refused", "reason_ttl": "0", "service": {"name": "ftp", "method": "table", "conf": "3"}, "cpe": [], "scripts": []}, 
            {"protocol": "tcp", "portid": "22", "state": "closed", "reason": "conn-refused", "reason_ttl": "0", "service": {"name": "ssh", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "23", "state": "closed", "reason": "conn-refused", "reason_ttl": "0", "service": {"name": "telnet", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "25", "state": "closed", "reason": "conn-refused", "reason_ttl": "0", "service": {"name": "smtp", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "80", "state": "open", "reason": "syn-ack", "reason_ttl": "0", "service": {"name": "http", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "110", "state": "closed", "reason": "conn-refused", "reason_ttl": "0", "service": {"name": "pop3", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "139", "state": "open", "reason": "syn-ack", "reason_ttl": "0", "service": {"name": "netbios-ssn", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "443", "state": "open", "reason": "syn-ack", "reason_ttl": "0", "service": {"name": "https", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "445", "state": "open", "reason": "syn-ack", "reason_ttl": "0", "service": {"name": "microsoft-ds", "method": "table", "conf": "3"}, "cpe": [], "scripts": []},
            {"protocol": "tcp", "portid": "3389", "state": "closed", "reason": "conn-refused", "reason_ttl": "0", "service": {"name": "ms-wbt-server", "method": "table", "conf": "3"}, "cpe": [], "scripts": []}],
        "hostname": [{"name": "HPCC808E.fritz.box", "type": "PTR"}],\
        "macaddress": None,
        "state": {"state": "up", "reason": "syn-ack", "reason_ttl": "0"}},
    """
    
    import nmap3

    session = Pg_session()
    by_ip_db = {}
    with session_scope() as session:
        docs = session.query(NmapScan).all()
        for d in docs:
            by_ip_db[d["ipadress"]] = d["state"]

        nmap = nmap3.Nmap()
        results = nmap.scan_top_ports("192.168.178.20-130")
        for ip, details in results.items():
            if "state" in details:
                print(ip, details["state"]["state"])
                if ip not in by_ip_db:
                    new_ip = NmapScan(ipadress=ip, state=details["state"]["state"])
                    session.add(new_ip)

    return "Scan finished"
