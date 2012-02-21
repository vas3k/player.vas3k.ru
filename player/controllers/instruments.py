# -*- coding: utf-8 -*-
import logging, datetime
from hashlib import md5
from turbomail import Message

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from player.lib.base import BaseController, render
from mongokit import ObjectId
import simplejson as json

log = logging.getLogger(__name__)

class InstrumentsController(BaseController):
    def ban_stat(self):
        period = request.params.get("period", 5)
        time_start = datetime.datetime.now() - datetime.timedelta(period)
        c.tracks = self.connection.player.banlist.find({ "time": { "$gte": time_start }})
        return render("/instruments/banlist.html")