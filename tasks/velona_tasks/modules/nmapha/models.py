# -*- coding: utf-8 -*-

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID, ARRAY
from sqlalchemy.ext.mutable import Mutable, MutableDict

Base = declarative_base()


class NmapScanResults(Base):
    """
    CREATE TABLE public.nmap_scan_results (
        ipaddress varchar(15) NOT NULL,
        state varchar(50) NULL,
        previous_state varchar(50) NULL,
        hostname varchar(255) NULL,
        mac varchar(48) NULL,
        intervals jsonb NULL,
        CONSTRAINT nmap_scan_results_pk PRIMARY KEY (ipaddress)
    );
    """
    __tablename__ = 'nmap_scan_results'
    ipaddress = Column(String(15), primary_key=True)
    state = Column(String(50))
    previous_state = Column(String(50))
    hostname = Column(String(255))
    mac = Column(String(48))
    intervals =  Column(MutableDict.as_mutable(JSONB))
    
    def as_dict(self):
        ids = ["id"]
        dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for id in ids:
            dict[id] = str(dict[id])
        return dict


class KnownHosts(Base):
    """
    CREATE TABLE public.known_hosts (
        mac varchar(48) NOT NULL,
        ipaddress varchar(255) NULL,
        friendly_name varchar(100) NULL,
        notes varchar(255) NULL,
        CONSTRAINT known_hosts_pk PRIMARY KEY (mac)
    );
    CREATE INDEX known_hosts_ipaddress_idx ON public.known_hosts USING btree (ipaddress);
    """
    __tablename__ = 'known_hosts'
    mac = Column(String(48), primary_key=True)
    ipaddress = Column(String(255), index=True)
    friendly_name = Column(String(100))
    notes = Column(String(255))
    
    def as_dict(self):
        ids = ["id"]
        dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for id in ids:
            dict[id] = str(dict[id])
        return dict


class NmapScanLogs(Base):
    """
    CREATE TABLE public.nmap_scan_logs (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        scan_time varchar(24) NULL,
        unknown_hosts _varchar NULL,
        CONSTRAINT nmap_scan_logs_pk PRIMARY KEY (id)
    );
    """
    __tablename__ = 'nmap_scan_logs'
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    scan_time = Column(String(24))
    unknown_hosts = Column(ARRAY(String(15)))
    
    def as_dict(self):
        ids = ["id"]
        dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for id in ids:
            dict[id] = str(dict[id])
        return dict