#-*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Radio(Document):
    structure = {
        "code": unicode,
        "tracks": [],
    }
    required_fields = ['code',]