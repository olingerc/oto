# -*- coding: utf-8 -*-

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, ARRAY
from sqlalchemy.dialects.postgresql import JSONB, UUID

Base = declarative_base()


class NmapScan(Base):
    """
-- public.nmapscan definition

-- Drop table

-- DROP TABLE public.nmapscan;

CREATE TABLE public.nmapscan (
	ipadress varchar(15) NOT NULL,
	state varchar(50) NULL,
	previous_state varchar(50) NULL,
	up_intervals _jsonb NULL,
	CONSTRAINT nmapscan_pk PRIMARY KEY (ipadress)
);
    """
    __tablename__ = 'nmapscan'
    ipadress = Column(String(15), primary_key=True)
    state = Column(String(50))
    previous_state = Column(String(50))
    up_intervals = ARRAY(JSONB)
    
    def as_dict(self):
        ids = ["id"]
        dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for id in ids:
            dict[id] = str(dict[id])
        return dict