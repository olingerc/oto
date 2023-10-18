# -*- coding: utf-8 -*-
"""Service specific routes.

To launch a function of the service, use the 'manual' route of the core
scheduler

"""
import os
from sys import exc_info
import traceback

from flask import jsonify, make_response, request
from flask_jwt_extended import jwt_required, get_jwt

from ...core.app import app
from ...core.utils import crossdomain
from ...core.job import send_job_to_rq, job_to_dict

from .tasks import get_state

TWO_WEEKS = 2 * 7 * 24 * 60 * 60


"""
To be run on worker
"""
@app.route('/tasksapi/garage/state', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def state_route():
    state = get_state()
    try:
        return jsonify(state), 200
    except Exception as e:
        return jsonify(message="%s" % e), 500