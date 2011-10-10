#-*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Love(Document):
    structure = {
        "userid": ObjectId,
        "trackid": unicode,
    }
    required_fields = ['userid', 'trackid',]