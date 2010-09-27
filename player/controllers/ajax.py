# -*- coding: utf-8 -*-
import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from player.lib.base import BaseController, render

log = logging.getLogger(__name__)
from mongokit import ObjectId

import simplejson as json

class AjaxController(BaseController):

    def index(self):
        return json.dumps({ "status": "OK", "message": u"Hello world? @_@" })


    def playlist(self, pl_action):
        actions = ["list", "new", "remove", "add", "delete"]
        if pl_action not in actions:
            return json.dumps({ "status": "NeOK", "message": u"Bad action '%s'" % pl_action })

        if not self.userid:
            return json.dumps({ "status": "NeOK", "message": u"Bad userid '%s" %self.userid })

        if pl_action == "list":
            lists = self.connection.playes.playlists.find({ "userid": ObjectId(self.userid) })
            pl = []
            for list in lists:
                pl.append(list)
            return json.dumps({ "status": "OK", "lists": pl })

        if pl_action == "new":
            name = request.params.get("name")
            if not name:
                return json.dumps({ "status": "NeOK", "message": u"No name" })

            playlist = self.connection.player.playlists.Playlists()
            playlist["userid"] = ObjectId(self.userid)
            playlist["name"] = name
            playlist["tracks"] = []
            playlist.save()
            return json.dumps({ "status": "OK", "message": u"Playlist created" })

        if pl_action == "remove":
            id = request.params.get("id")
            if not id:
                return json.dumps({ "status": "NeOK", "message": u"No ID" })

            self.connection.player.playlists.remove({ "_id": ObjectId(id) })            
            return json.dumps({ "status": "OK", "message": u"Playlist removed" })

        if pl_action == "add":
            id = request.params.get("id")
            if not id:
                return json.dumps({ "status": "NeOK", "message": u"No ID" })
            # TODO: Get list
            # TODO: Add to playlist
            return json.dumps({ "status": "OK", "message": u"Tracks added" })

        if pl_action == "delete":
            id = request.params.get("id")
            if not id:
                return json.dumps({ "status": "NeOK", "message": u"No ID" })
            # TODO: Delete
            return json.dumps({ "status": "OK", "message": u"Tracks removed" })

