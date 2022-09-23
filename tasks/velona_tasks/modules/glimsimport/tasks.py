# -*- coding: utf-8 -*-
"""Summary.
"""
import time

from ... import config
from ...core.connections import connect_mongo

def execute_glims_import(replace=False, which_part="all"):
    # Connect mongo only AFTER forking within the worker, as recommended by pymongo warnings
    connect_mongo()
    time.sleep(2)
    print("DONE")
    return "Import successful"
