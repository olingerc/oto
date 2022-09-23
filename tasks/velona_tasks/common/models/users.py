# -*- coding: utf-8 -*-
from mongoengine import (Document, StringField, ListField, IntField,
                         ReferenceField)

class GroupSchema(Document):
    """Group Document."""

    id = StringField(primary_key=True)
    title = StringField()

    meta = {
        'strict': False,  # ignore extra fields
        'collection': 'system_groups'
    }


class UserSchema(Document):
    """User Document."""

    id = StringField(primary_key=True)
    username = StringField()
    role = StringField()
    groups = ListField(ReferenceField(GroupSchema))
    privileges = ListField(StringField())
    tasksApiToken = StringField()

    meta = {
        'strict': False,  # ignore extra fields
        'collection': 'system_users'
    }