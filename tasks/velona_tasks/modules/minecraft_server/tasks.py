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
    
    from selenium import webdriver
    from webdriver_manager.firefox import GeckoDriverManager
    from selenium.webdriver.firefox.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver import FirefoxOptions
    
    last_status = _get_last_status()
    print(last_status)
    print("Got last status: {}".format(last_status))
    if last_status is None:
        return True
    
    # get minecraft status
    new_status = None
    ser = Service(GeckoDriverManager().install())
    options = FirefoxOptions()
    options.add_argument("--headless")
    driver = webdriver.Firefox(service=ser, options=options)
    driver.get('https://www.minecraftpinger.com/')

    serverAdress = driver.find_element(By.CLASS_NAME, "mantine-bz6miy")
    serverAdress.send_keys("krusa2411.aternos.me:25595")

    driver.find_element(By.CSS_SELECTOR, "button.mantine-ibtd8h").click()
    time.sleep(5)
    #INFO: If console prints "OFFLINE", the server is offline. If console prints "IP:", the server is online.
    res = driver.find_element(By.XPATH, "/html/body/div/main/main/div/div[4]/div/div/div/span").text
    
    if res is None:
        raise Exception("No Response")


    if "IP:" in res:
        new_status = res
    if res == "OFFLINE":
        new_status = "OFFLINE"
    else:
        raise Exception("Unknown response: {}".format(res))

    print("Got NEW status: " + new_status)
    if new_status != last_status:
        if new_status == "OFFLINE":
            _set_last_status("OFFLINE")
            send_message("OFFLINE")
        else:
            _set_last_status(new_status)
            send_message(new_status)
    
    return new_status
