# -*- coding: utf-8 -*-
"""Utility functions."""
from datetime import timedelta
import os
import time
from shutil import rmtree
from functools import update_wrapper
import json
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.utils import COMMASPACE, formatdate

from flask import make_response, request, current_app  # noqa: E402

from .. import config

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    """For crossdomain http requests.

    http://flask.pocoo.org/snippets/56/
    Changes: origin is always a list to allow
    setting multiple origins. If multiple allowed
    only return the one in the request origin.
    otherwise client might complain about "multiple allowed"
    """
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, str):
        headers = ', '.join(x.upper() for x in headers)
    if isinstance(origin, str):
        origin = [origin]
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            try:
                if request.headers['origin'] in origin:
                    # It could be that I defined multiple allowed origins
                    h['Access-Control-Allow-Origin'] = request.headers['origin']
            except:
                # avoid key error from werkzeug if no HTTP_ORIGIN
                pass
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


class Timer(object):
    """Use to time functions."""

    def __init__(self):
        self.start = time.time()

    def stop(self, time_only=False):
        if time_only:
            return time.time() - self.start
        else:
            return "{:.2f} s".format(time.time() - self.start)


def send_email(recipients, title, body, attachments=[]):
    """
    Send an email internally.

    recipients should be a set
    """
    msg = MIMEMultipart()
    msg['From'] = "VELONA-noreply@device.etat.lu"
    msg['To'] = COMMASPACE.join(recipients)
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = title
    msg.attach(MIMEText(body, 'plain', _charset="utf-8"))

    if len(attachments) > 0:
        for att in attachments:
            with open(att, "rb") as f:
                part = MIMEApplication(
                    f.read(),
                    Name=os.path.basename(f)
                )
                part['Content-Disposition'] = 'attachment; filename="%s"' % os.path.basename(att)
                msg.attach(part)

    # Send the message via our own SMTP server.
    # LNS wants: No auth with port 25
    # Send the message via local SMTP server.
    with smtplib.SMTP(config.LNSSMTP) as s:
        s.send_message(msg)


def human_readable_bytes(size):
    suffixes = ['b', 'Kb', 'Mb', 'Gb', 'Tb']
    suffixIndex = 0
    while size > 1024:
        suffixIndex += 1  # increment the index of the suffix
        size = size / 1024.0  # apply the division
    return "{0:.2f} {1}".format(size, suffixes[suffixIndex])


def human_readable_duration(size):
    suffixes = ['s', 'm', 'h']
    suffixIndex = 0
    while size > 60:
        suffixIndex += 1  # increment the index of the suffix
        size = size / 60.0  # apply the division
    return "{0:.2f} {1}".format(size, suffixes[suffixIndex])


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)