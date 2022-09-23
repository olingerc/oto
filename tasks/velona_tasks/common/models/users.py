# -*- coding: utf-8 -*-
from mongoengine import (Document, StringField, ListField)

class UserSchema(Document):
    """User Document."""

    id = StringField(primary_key=True)
    username = StringField()
    role = StringField()
    privileges = ListField(StringField())

    meta = {
        'strict': False,  # ignore extra fields
        'collection': 'system_users'
    }