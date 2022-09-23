# -*- coding: utf-8 -*-
"""Summary.
"""
import os
import shutil

from ..common.utils import iso_time_string
from .logutils import setup_task_logger, publish_worker_message
from .connections import connect_mongo
from .state import get_key, expire_key

logger = setup_task_logger("Core job")


def _all_files(path):
    all_files = []
    for r, d, f in os.walk(path):
        for file in f:
            all_files.append(os.path.join(r, file))

    return all_files


def copy_files(username=None, destination=None, action=None, files=None, root_replace=None, to_delete=None):
    connect_mongo()
    if to_delete is None:
        to_delete = []

    progress_message = {
        "destination": os.path.basename(destination),
        "message_type": action,
        "message_content": "start"
    }
    publish_worker_message("tasks_progress_message", progress_message, username=username)
    try:
        if os.path.exists(destination) is False:
            os.makedirs(destination)
        else:
            shutil.rmtree(destination)
        
        # get list of all files and subfules
        all_files = []

        for item in files:
            if os.path.isdir(item):
                all_files += _all_files(item)
            else:
                all_files.append(item)
        
        total = len(all_files)
        count = 0
        progress_message["message_content"] = "progress"
        cancelled = False
        for f in all_files:
            # Test if cancelled
            to_cancel = get_key("velona:cancel_export")
            if to_cancel and to_cancel.decode() == progress_message["destination"]:
                expire_key("velona:cancel_export")
                cancelled = True
                break

            # continue copying
            percent_done = 100 * (count / total)
            count+=1
            progress_message["progress"] = {
                "percent_done": percent_done,
                "total": total,
                "copying": count
            }
            if total > 100:
                if count % 10 == 0:
                    publish_worker_message("tasks_progress_message", progress_message, username=username)
            else:
                publish_worker_message("tasks_progress_message", progress_message, username=username)

            new_destination = destination + f.replace(root_replace, "")
            os.makedirs(os.path.dirname(new_destination), exist_ok=True)
            shutil.copy2(f, os.path.dirname(new_destination))
        
        if cancelled is False:
            progress_message["progress"] = None
            if action == "move":
                for f in to_delete:
                    if os.path.isdir(f):
                        shutil.rmtree(f)
                    else:
                        os.unlink(f)
                progress_message["moved"] = save_move(os.path.basename(destination), username, iso_time_string())

            progress_message["message_content"] = "success"
            publish_worker_message("tasks_progress_message", progress_message, username=username)
            open(os.path.join(destination, "ExportComplete.txt"), mode='a').close()
        else:
            progress_message["message_content"] = "cancelled"
            if os.path.exists(destination) is False:
                os.makedirs(destination)
            open(os.path.join(destination, "ExportCancelled.txt"), mode='a').close()

    except Exception as e:
        progress_message["message_content"] = "error"
        progress_message["error_message"] = str(e)
        publish_worker_message("tasks_progress_error", progress_message, username=username)
