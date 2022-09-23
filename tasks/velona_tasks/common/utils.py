# -*- coding: utf-8 -*-
"""Utility functions."""
from datetime import datetime
import random
import re
import string

"""

STRING METHODS

"""

def random_string(N):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))


def are_strings_in_string(error_string_list, string):
    upper_error_string_list = [x.upper() for x in error_string_list]
    upper_string = string.upper()
    """Used to find a list of strings within a long string."""
    for s in upper_error_string_list:
        if s in upper_string:
            return s
    return None


def safe_dict_key(key):
    rx = r'([^A-Za-z0-9_])'
    safe_key = re.sub(rx, '_', key)
    return safe_key


"""

COLLECTION AND DICT METHODS

"""

def find_in_collection(lst, key, value):
    for i, dic in enumerate(lst):
        if dic[key] == value:
            return dic
    return None


def index_in_collection(lst, key, value):
    for i, dict in enumerate(lst):
        if dict[key] == value:
            return i
    return -1


def merge_dicts(*dict_args):
    """Shallow dict merge.

    Given any number of dicts, shallow copy and merge into a new dict,
    precedence goes to key value pairs in latter dicts.
    http://stackoverflow.com/questions/38987/how-can-i-merge-two-python-dictionaries-in-a-single-expression
    """
    result = {}
    for dictionary in dict_args:
        result.update(dictionary)
    return result


"""

DATE METHODS

"""

def iso_time_string(date_only=False, only_digits=False, only_dashes=False):
    to_return = ""
    if date_only is False:
        to_return = datetime.strftime(datetime.now(), '%Y-%m-%d %H:%M:%S')
    else:
        to_return = datetime.strftime(datetime.now(), '%Y-%m-%d')
    if only_digits:
        to_return = to_return.replace("-", "")
        to_return = to_return.replace(" ", "")
        to_return = to_return.replace(":", "")
    if only_dashes:
        to_return = to_return.replace(" ", "-")
        to_return = to_return.replace(":", "-")
    return to_return

def iso_string_to_time(time_string):
    return datetime.strptime(time_string, '%Y-%m-%d %H:%M:%S')

def short_today_string():
    return datetime.strftime(datetime.now(), '%Y%m%d')
