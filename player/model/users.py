#-*- coding: utf-8 -*-
from mongokit import Document, ObjectId
import datetime

class Users(Document):
    structure = {
        'login': unicode,
        'password': unicode,
        'hash': unicode,
        'vk_name': unicode,
        'lastfm' : {
            'login': unicode,
            'token' : unicode,
            'session' : unicode,
        },
        'playlists': [],
        'params': {
            'active': int,
        }
    }
    required_fields = [ 'login', 'password' ]
    default_values = { 'params.active': 0, }