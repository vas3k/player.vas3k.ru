#-*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Playlists(Document):
    structure = {
        "userid": ObjectId,
        "name": unicode,
        "tracks": [],
    }
    required_fields = ['userid', 'name',]