# -*- coding: utf-8 -*-
"""
Main script.

The server starts a websocket listener but also
a parallel greenlet that sends monitoring data to whomever
is connected

use -m to not automatically start workers in development mode

use -p xxx to select port (currently either -m OR -p xxx, not both)
"""

import eventlet
eventlet.monkey_patch()
import threading

import os  # noqa: E402
import sys  # noqa: E402

from velona_tasks.core.app import app, socketio  # noqa: E402
from velona_tasks.core.workers import default_workers, remove_all_worker_containers, cancel_all_workers  # noqa: F401
from velona_tasks.core.connections import connect_mongo  # noqa: E402
from velona_tasks.core.monitor import websocket_monitors  # noqa: E402

# Scheduler
from velona_tasks.core.Scheduler import Scheduler  # noqa: E402

# Core views
import velona_tasks.core.views_http  # noqa: E402
import velona_tasks.core.views_websocket  # noqa: F401

# Schedule functions of modules
from velona_tasks.modules.ToSchedule import ToSchedule

# Register views of plugins
import velona_tasks.modules.glimsimport.routes_http  # noqa: E402

# Core
def init_scheduler():
    scheduler = Scheduler()
    scheduler.init_scheduler()
    to_schedule_instance = ToSchedule()
    scheduler.register_service(to_schedule_instance)


def init_workers():
    cancel_all_workers()
    remove_all_worker_containers()
    default_workers()

# Start app
if __name__ == '__main__':

    # Mongo connection
    connect_mongo()

    port = app.config['PORT']
    exclude_patterns = []
    if len(sys.argv) > 1:
        if sys.argv[1] == '-p':
            port = int(sys.argv[2])
    try:
        if os.environ.get("FLASK_ENV", "development") in ['production', 'staging']:

            env = os.environ.get("FLASK_ENV").upper()
            print('** {} **'.format(env))
            print("** Will launch on port %s **" % port)
            sys.stdout.flush()

            init_scheduler()
            try:
                thread = threading.Thread(target=init_workers)
                thread.start()
            except Exception as e:
                print("Error %s while starting default workers" % e)

            # Hand socket to monitor since it works outside of context
            eventlet.spawn(websocket_monitors)
        else:
                print("WERKZEUG IS ", os.environ.get("WERKZEUG_RUN_MAIN"))
                if os.environ.get("WERKZEUG_RUN_MAIN") is not None:
                    # In debug mode, this would be run twice
                    # http://stackoverflow.com/questions/9449101/how-to-stop-flask-from-initialising-twice-in-debug-mode

                    print('** DEVELOPMENT **')
                    print("** Will launch on port %s **" % port)

                    init_scheduler()

                    # Hand socket to monitor since it works outside of context
                    eventlet.spawn(websocket_monitors)

    except Exception as e:
        print("Error during monitor greenlet start: %s" % e)
        raise(e)

    try:
        socketio.run(app, host=app.config['LISTEN_ON'],
                     debug=app.config["DEBUG"], port=port,
                     log_output=False)
    except Exception as e:
        print("Error during websocket start: %s" % e)

        raise(e)
