# -*- coding: utf-8 -*-
"""Summary.
"""
from contextlib import contextmanager
from copy import copy
import json

from ...core.connections import Pg_session
from .models import NmapScanResults, KnownHosts, NmapScanLogs
from ...common.utils import iso_time_string, iso_string_to_time

from ... import config

RANGE = "192.168.178.21"
#RANGE = "192.168.178.20-130"


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


def _get_known_hosts_by_ip():
    known_by_ip = {}
    with session_scope() as session:
        docs = session.query(KnownHosts).all()
        for d in docs:
            known_by_ip[d.ipaddress] = {
                "mac": d.mac,
                "friendly_name": d.friendly_name,
                "notes": d.notes
            }
    return known_by_ip


def _scan():
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
        "ports": [{"protocol": "tcp", "portid": "21", "state": "closed", "reason": "conn-refused", "reason_ttl": "0", "service": {"name": "ftp", "method": "table", "conf": "3"}, "cpe": [], "scripts": []}, ...
        "hostname": [{"name": "HPCC808E.fritz.box", "type": "PTR"}],
        "macaddress": None,
        "state": {"state": "up", "reason": "syn-ack", "reason_ttl": "0"}},
    """
    import nmap3
    scan_results_by_ip = {}
    nmap = nmap3.Nmap()
    results = nmap.scan_top_ports(RANGE)
    for ip, details in results.items():
        if "state" in details:
            scan_results_by_ip[ip] = details

    return scan_results_by_ip


def _get_hostname(details):
    try:
        return details["hostname"][0]["name"]
    except:
        return None


def _empty_interval():
    _now = iso_time_string()
    return [ [_now, _now] ]


def _update_existing(existing_doc, ip, details):
    
    existing_intervals = existing_doc.intervals
    incoming_state = details["state"]["state"]
    
    # State change?
    if existing_doc.state != incoming_state:
        # Close the old state interval
        existing_intervals[existing_doc.state][-1][1] = iso_time_string()
        # Create the new state interval
        existing_intervals[incoming_state].append(_empty_interval())
        # Save old state and update doc
        existing_doc.previous_state = existing_doc.state
        existing_doc.state = existing_doc.incoming_state
    else:
        # elongate exisiting interval
        # take last interval and update end point to new value
        existing_intervals[incoming_state][-1][1] = iso_time_string()
        
    # Update jsonb by creating copy (since it is checked by reference)
    existing_doc.intervals = json.loads(json.dumps(existing_intervals))
    
    return json.loads(json.dumps(existing_intervals))


def execute_nmap_ha():
    
    known_by_ip = _get_known_hosts_by_ip()
    scanned_by_ip = _scan()
    
    with session_scope() as session:
        unknown_hosts = []
        for ip, details in scanned_by_ip.items():
    
            if ip in known_by_ip:
                doc = session.query(NmapScanResults).filter(NmapScanResults.ipaddress==ip).first()
                if doc is None:
                    state = details["state"]["state"]
                    # create first interval with only start
                    intervals = dict()
                    intervals[state] = _empty_interval()
                    new_ip = NmapScanResults(ipaddress=ip,
                                      state=state,
                                      previous_state=None,
                                      hostname=_get_hostname(details),
                                      intervals=intervals)
                    session.add(new_ip)
                else:
                    new_intervals = _update_existing(doc, ip, details)
                    print("INTERVALS", new_intervals)
                    print("OUTSIDE", doc.intervals)
                    session.query(NmapScanResults).filter(NmapScanResults.ipaddress==ip).update({NmapScanResults.iintervals: new_intervals})
                    session.commit()
            else:
                if details["state"]["state"] == "up":
                    unknown_hosts.append(ip)
        
        scan_doc = NmapScanLogs(scan_time=iso_time_string(), unknown_hosts=unknown_hosts)
        session.add(scan_doc)
    return "Scan finished"


def reset_scans():
    with session_scope() as session:
        session.query(NmapScanResults).delete()


def list_results():

    known_by_ip = {}
    with session_scope() as session:
        docs = session.query(KnownHosts).all()
        for d in docs:
            known_by_ip[d.ipaddress] = {
                "ip": d.ipaddress,
                "mac": d.mac,
                "friendly_name": d.friendly_name,
                "notes": d.notes
            }

        scans_by_ip = {}
        docs = session.query(NmapScanResults).all()
        for d in docs:
            scans_by_ip[d.ipaddress] = {
                "state": d.state,
                "previous_state": d.previous_state,
                "intervals": d.intervals
            }
        
        res = []
        for x in session.query(NmapScanLogs).order_by(NmapScanLogs.scan_time.desc()).limit(5).all():
            res.append({"scan_time": x.scan_time, "unknown_hosts": x.unknown_hosts})
    
    return {"known_hosts": list(known_by_ip.values()), "scans": scans_by_ip, "logs": list(reversed(res))}
