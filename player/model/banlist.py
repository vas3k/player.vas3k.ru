#*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Banlist(Document):
    structure = {
        "trackid": unicode,
        "userid": ObjectId,
        "trackname": unicode,
        "username": unicode,
        "engine": unicode,
        "ip": unicode,
        "time": datetime.datetime,
    }
    default_values = { "time": datetime.datetime.now, }
    required_fields = ["trackid", "engine", "userid"]
    indexes = [{
        'fields': [ "trackid", ],
        'unique': True,
    },
    {
        "fields": [ "time", ],
        "unique": False
    }]