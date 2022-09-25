# -*- coding: utf-8 -*-
from .. import config
from ..core.job import send_job_to_rq

TWO_WEEKS = 2 * 7 * 24 * 60 * 60
ONE_HOUR = 60 * 60


class ToSchedule(object):
    """Summary.
                # EXAMPLE
                {
                    "type": "interval",
                    "seconds": 10,
                    # "jitter": 10,
                    "func": "send_job_to_rq",
                    "args": [
                        # func_string
                        "say_hallo",
                        # job_def
                        {"queue": "scheduled", "result_ttl": 300, "ttl": 10},
                        # MORE ARGS HERE
                        "a",
                        "b"
                    ],
                    "schedule_on_start": True,
                    "run_on_start": False
                },
    """
    def __init__(self):
        self.name = "scheduled_funcs"
        self.send_job_to_rq = send_job_to_rq
        self.scheduled_funcs = [
            {
                "type": "interval",
                "seconds": 8,
                "func": "send_job_to_rq",
                "args": [
                    "execute_glims_import",
                    {"queue": "scheduled", "result_ttl": TWO_WEEKS, "ttl": ONE_HOUR * 2, "meta": {"username": "system"}}
                ],
                "kwargs": {"replace": False, "which_part": "covid"},
                "schedule_on_start": False, #config.SCHEDULE_ON_START,
                "run_on_start": False
            }

        ]
