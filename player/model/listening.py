#*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Listening(Document):
    structure = {
        "userid": ObjectId,
        "tracks": [],
    }
    required_fields = ['userid',]