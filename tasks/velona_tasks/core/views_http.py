# -*- coding: utf-8 -*-
"""Routes for http requests."""
import json
import os
from sys import exc_info
import traceback

from flask import request, jsonify, session
from flask_jwt_extended import jwt_required, get_jwt

from .app import app
from .job import (send_job_to_rq, job_to_dict, get_failed_jobs, get_jobs_from_queues_by_description,
                 jobid_to_jobdict)
from .logutils import setup_task_logger
from .queues import clear_failed_queue
from .status import status
from .state import get_state
from .utils import crossdomain
from .workers import kill_worker_evil, add_new_worker
from ..common.users import get_system_group


logger = setup_task_logger("Tasks core")

@app.route('/tasksapi/version', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def version():
    return jsonify(message="no version"), 200

@app.route('/tasksapi/login', methods=['POST', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def login():
    # We do an http login to initialize the websocket session
    # the aim is that http and ws sessions are shared
    # not doing a http session first will create strange results
    # Storage of username and groupid handled in on_connect of websocket
    return jsonify(message="ok"), 200


@app.route('/tasksapi/state', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required()
def get_state_route():
    user = get_jwt()
    client_username = user.get('username', None)

    try:
        return jsonify(get_state()), 200
    except Exception as e:
        if os.environ.get("FLASK_ENV", "development") == 'development':
            type, value, tb = exc_info()
            print(traceback.format_exc())
        return jsonify(message="%s" % e), 500


@app.route('/tasksapi/status', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def status_route():
    """
    curl --noproxy "*" http://tasks:5500/tasksapi/status
    """
    stat = status(simple=True)
    return json.dumps(stat), 200


@app.route('/tasksapi/status_detailed', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def status_detail_route():
    """
    curl --noproxy "*" http://tasks:5500/tasksapi/status
    """
    stat = status(simple=False)
    return json.dumps(stat), 200


@app.route('/', defaults={'path': ''}, methods=['GET', 'OPTIONS'])
@app.route('/<path:path>')
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def catch_all(path):
    return '/%s is not configured' % path, 404


@app.route('/tasksapi/add_worker', methods=['POST', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required()
def add_worker():
    """Add a worker.
    """
    user = get_jwt()
    request_json = request.get_json()

    username = user.get('username', None)
    if username is None:
        logger.error("Worker add: no username in access token")
        return jsonify(message='Please provide a username in the acess token'), 500

    queue = request_json['queue']

    # TODO: should be regulated by config
    if os.environ.get("FLASK_ENV", "development") == 'development':
        host = "dev_docker_host"
    elif os.environ.get("FLASK_ENV", "development") == 'staging':
        host = "lns1-bioinf02"
    else:
        host = "lns1-velonaworker01"
        if queue == "tso" or queue == "esimport" or queue == "esimport_launcher":
            host = "lns1-singular01"

    try:
        add_new_worker([queue], host)
    except Exception as e:
        message = "Error %s while adding worker: %s" % (e, queue)
        logger.error(message, exc_info=True)
        type, value, tb = exc_info()
        print(traceback.format_exc())
        return jsonify(message=message), 500
    else:
        # no use calling satus, here because dopcher has been created but not yet registered in redis
        # status looks in redis !
        return jsonify(message="ok"), 200


@app.route('/tasksapi/kill_worker', methods=['POST', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required()
def kill_worker():
    """Delete a worker.
    """
    user = get_jwt()
    request_json = request.get_json()

    username = user.get('username', None)
    if username is None:
        logger.error("Worker kill: no username in access token")
        return jsonify(message='Please provide a username in the acess token'), 500

    worker_name = request_json['worker_name']

    try:
        kill_worker_evil(worker_name)
    except Exception as e:
        message = "Error %s while killing worker: %s" % (e, worker_name)
        logger.error(message, exc_info=True)
        return jsonify(message=message), 500
    else:
        return jsonify(status=status(simple=False)), 200


@app.route('/tasksapi/startjob', methods=['POST', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required(optional=True)
def start_job():
    user = get_jwt()
    client_username = user.get('username', "system")

    request_json = request.get_json()
    launch_requests = request_json.get('requests')

    # Correct client or token. Continue
    # also sched uses this route, that is why jwt is optional
    request_json = request.get_json()
    func_string = request_json.get("func_string", "")
    job_def = request_json.get("job_def", {})
    if "meta" in job_def:
        job_def["meta"]["username"] = job_def["meta"].get("username", None) or client_username # do not overwrite
    else:
        job_def["meta"] = {"username": client_username}
    kwargs = request_json.get("kwargs", {})

    job_instance = send_job_to_rq(func_string, job_def, **kwargs)
    job_dict = job_to_dict(job_instance)

    return jsonify(job=job_dict), 200


@app.route('/tasksapi/get_failed_jobs', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required()
def load_jobs():
    first = request.args.get("first")
    rows = request.args.get("rows")
    if first:
        first = int(first)
        rows = int(rows)
    
    try:
        res = get_failed_jobs(first, rows)
        return jsonify(res), 200
    except Exception as e:
        logger.error("Failed loading jobs", exc_info=True)
        if os.environ.get("FLASK_ENV", "development") == 'development':
            type, value, tb = exc_info()
            print(traceback.format_exc())
        return jsonify(message="%s" % e), 500


@app.route('/tasksapi/getjob', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required()
def get_job_route():
    jobid = request.args.get("jobid")
   
    try:
        res = jobid_to_jobdict(jobid)
        return jsonify(res), 200
    except Exception as e:
        logger.error("Failed loading job", exc_info=True)
        if os.environ.get("FLASK_ENV", "development") == 'development':
            type, value, tb = exc_info()
            print(traceback.format_exc())
        return jsonify(message="%s" % e), 500


@app.route('/tasksapi/get_scheduled_jobs', methods=['GET', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
@jwt_required()
def get_scheduled_jobs_route():
    try:
        res = get_jobs_from_queues_by_description(["scheduled", "copy"])
        return jsonify(res), 200
    except Exception as e:
        logger.error("Failed loading scheduled jobs", exc_info=True)
        if os.environ.get("FLASK_ENV", "development") == 'development':
            type, value, tb = exc_info()
            print(traceback.format_exc())
        return jsonify(message="%s" % e), 500


@app.route('/tasksapi/clear_failed', methods=['POST', 'OPTIONS'])
@crossdomain(origin=app.config['CORS_ALLOWED'], headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def clear_failed():
    try:
        clear_failed_queue()
        return jsonify(message="ok"), 200
    except Exception as e:
        logger.error("Failed clearing failed jobs", exc_info=True)
        if os.environ.get("FLASK_ENV", "development") == 'development':
            type, value, tb = exc_info()
            print(traceback.format_exc())
        return jsonify(message="%s" % e), 500


"""
@app.route('/test', methods=['OPTIONS', 'POST'])
@crossdomain(origin=allowed, headers=['Content-Type', 'Access-Control-Allow-Origin', 'X-XSRF-TOKEN'])
def test():
    return 'cross domain test succeeded', 200
"""
