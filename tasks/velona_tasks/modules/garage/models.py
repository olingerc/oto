# -*- coding: utf-8 -*-

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID, ARRAY
from sqlalchemy.ext.mutable import Mutable, MutableDict

Base = declarative_base()


class GarageState(Base):
    """
    CREATE TABLE public.garage_state (
        state varchar(50) NULL
    )
    """
    __tablename__ = 'garage_state'
    state = Column(String(15), primary_key=True)
    
    def as_dict(self):
        ids = ["id"]
        dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for id in ids:
            dict[id] = str(dict[id])
        return dict