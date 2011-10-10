#*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Listening(Document):
    structure = {
        "user": ObjectId,
        "time": datetime.datetime,
        "track": {
            "title": unicode,
            "artist": unicode,
            "aid": unicode,
            "owner_id": unicode,
        },
    }
    default_values = { "time": datetime.datetime.now, }
    required_fields = ['user',]
    indexes = [{
        'fields': [ 'user', ],
        'unique': False,
    }]