from mongoengine import DoesNotExist

from .models.users import UserSchema, GroupSchema


def get_user(username):
    try:
        return UserSchema.objects.get(username=username)
    except Exception as e:
        raise(e)


def get_user_by_token(token):
    try:
        return UserSchema.objects.get(tasksApiToken=token)
    except Exception as e:
        raise(e)


def get_system_group():
    try:
        group = GroupSchema.objects.get(title="System")
        return group
    except DoesNotExist:
        raise Exception("Could not find SYSTEM group")
    except Exception as e:
        raise(e)
