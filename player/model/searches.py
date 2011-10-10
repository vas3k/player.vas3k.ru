#-*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Searches(Document):
    structure = {
        "userid": ObjectId,
        "name": unicode,
    }
    required_fields = ['userid', 'name']