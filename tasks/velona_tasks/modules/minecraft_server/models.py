# -*- coding: utf-8 -*-

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.mutable import Mutable, MutableDict

Base = declarative_base()


class MinecraftServerLastResult(Base):
    """
    CREATE TABLE public.minecraft_server_lastresult (
        state varchar(50) NULL
    );
    """
    __tablename__ = 'minecraft_server_lastresult'
    id = Column(String(15), primary_key=True)
    state = Column(String(50))
    
    def as_dict(self):
        ids = ["id"]
        dict = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        for id in ids:
            dict[id] = str(dict[id])
        return dict

