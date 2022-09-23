# -*- coding: utf-8 -*-
"""Scheduler class module."""

from apscheduler.schedulers.background import BackgroundScheduler

from .logutils import setup_task_logger

logger = setup_task_logger("Scheduler")


class Scheduler(object):
    """Scheduler.

    This contains all functions that the scheduler can do
    Instance created in _init__.py
    """

    def __init__(self):
        # defaults
        job_defaults = {
            'coalesce': True,
            'max_instances': 1,
            'misfire_grace_time': 60
        }

        self._apscheduler = BackgroundScheduler(job_defaults=job_defaults)
        self._registered_services = {}

    def init_scheduler(self):
        self._apscheduler.start()

    def register_service(self, to_schedule_instance):
        """Used to activate scheduler funcs at init.

        self.scheduled_funcs:
        - type (type of scheduling, interval or manual)
        - seconds (if interval, seconds between launches)
        - func (name of function)
        - schedule_on_start (for interval, true or false) first run is x seconds from regitering
        - run_on_start (for interval, true or false) run immediately
        - args (list of args expected, optional)

        """

        self._registered_services[to_schedule_instance.name] = {
            "instance": to_schedule_instance,
            "jobs": []
        }
        self._launch_scheduled_funcs(to_schedule_instance, on_boot=True)

    #
    # Internal functions
    #

    def _launch_scheduled_funcs(self, service_instance, on_boot=False):
        logger.info("Registering scheduled functions")
        for scheduled_func in service_instance.scheduled_funcs:
            if ((scheduled_func.get('schedule_on_start', False) is True and on_boot is True) or
                    on_boot is False):

                if scheduled_func['type'] == 'interval':
                    self._registered_services[service_instance.name]['jobs'].append(
                        self._apscheduler.add_job(
                            getattr(service_instance, scheduled_func['func']),
                            args=scheduled_func.get("args", None),
                            kwargs=scheduled_func.get("kwargs", None),
                            trigger='interval',
                            seconds=scheduled_func['seconds'],
                            jitter=scheduled_func.get('jitter'),
                        )
                    )

                if scheduled_func['type'] == 'time':
                    for time in scheduled_func['times']:
                        self._registered_services[service_instance.name]['jobs'].append(
                            self._apscheduler.add_job(
                                getattr(service_instance, scheduled_func['func']),
                                args=scheduled_func.get("args", None),
                                kwargs=scheduled_func.get("kwargs", None),
                                trigger='cron',
                                hour=time.split(':')[0],
                                minute=time.split(':')[1]
                            )
                        )

                if scheduled_func.get('run_on_start', False) is True:
                    logger.info("Function %s asked to be run on start" % (scheduled_func['func']))
                    self._apscheduler.add_job(
                        getattr(service_instance, scheduled_func['func'])
                    )
