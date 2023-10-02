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

TWO_WEEKS = 2 * 7 * 24 * 60 * 60


"""
To be run on worker
"""
@app.route('/tasksapi/nmapha/scan', methods=['POST', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required()
def nmap_ha_route():
    user = get_jwt()
    client_username = user.get('username', None)

    request_json = request.get_json()
    func_string = "execute_nmap_ha"
    job_def = {"queue": "scheduled", "result_ttl": TWO_WEEKS, "ttl": 60*60*2, "meta": {"username": client_username}}
    kwargs = {}

    try:
        job_instance = send_job_to_rq(func_string, job_def, **kwargs)
        job_dict = job_to_dict(job_instance)
        return jsonify(job=job_dict), 200
    except Exception as e:
        if os.environ.get("FLASK_ENV", "development") == 'development':
            type, value, tb = exc_info()
            print(traceback.format_exc())
        return jsonify(message="%s" % e), 500
