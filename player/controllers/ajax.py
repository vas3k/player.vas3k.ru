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
        actions = ["list", "new", "remove", "add", "get", "delete", "sort"]
        if pl_action not in actions:
            return json.dumps({ "status": "NeOK", "message": u"Bad action '%s'" % pl_action })

        if not self.userid:
            return json.dumps({ "status": "NeOK", "message": u"Bad userid '%s" %self.userid })

        try:
            if pl_action == "list":
                lists = self.connection.player.playlists.find({ "userid": ObjectId(self.userid) })
                pl = []
                count = 0
                for list in lists:
                    list["_id"] = unicode(list["_id"])
                    list["userid"] = unicode(list["userid"])
                    del list["tracks"]
                    pl.append(list)
                    count += 1
                return json.dumps({ "status": "OK", "count": count, "lists": pl })

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
                tracks = json.loads(request.params.get("tracks"))
                if not id:
                    return json.dumps({ "status": "NeOK", "message": u"No ID" })
                self.connection.player.playlists.update({ "_id": ObjectId(id) }, { "$pushAll": { "tracks": tracks }})
                return json.dumps({ "status": "OK", "message": u"Tracks added" })

            if pl_action == "get":
                id = request.params.get("id")
                if not id:
                    return json.dumps({ "status": "NeOK", "message": u"No ID" })
                list = self.connection.player.playlists.find_one({ "_id": ObjectId(id) })
                list["_id"] = unicode(list["_id"])
                list["userid"] = unicode(list["userid"])
                return json.dumps({ "status": "OK", "list": list })

            if pl_action == "delete":
                playlist_id = request.params.get("playlist_id")
                track_id = request.params.get("track_id")
                if not playlist_id or not track_id:
                    return json.dumps({ "status": "NeOK", "message": u"No ID" })
                self.connection.player.playlists.update({ "_id": ObjectId(playlist_id) }, { "$pull": { "tracks": track_id }})
                return json.dumps({ "status": "OK", "message": u"Tracks removed %s" % track_id })

            if pl_action == "sort":
                id = request.params.get("id")
                tracks = json.loads(request.params.get("tracks"))
                if not id:
                    return json.dumps({ "status": "NeOK", "message": u"No ID" })
                self.connection.player.playlist.update({ "_id": ObjectId(id) }, { "$set": { "tracks": tracks}})
                return json.dumps({ "status": "OK", "message": u"Tracks saved" })
        except Exception, e:
            return json.dumps({ "status": "NeOK", "message": e })            


    def searches(self, se_action):
        actions = ["add", "remove", "list"]
        if se_action not in actions:
            return json.dumps({ "status": "NeOK", "message": u"Bad action '%s'" % se_action })

        if not self.userid:
            return json.dumps({ "status": "NeOK", "message": u"Bad userid '%s" %self.userid })

        try:
            if se_action == "add":
                name = request.params.get("name", "")
                search = self.connection.player.searches.Searches()
                search["userid"] = ObjectId(self.userid)
                search["name"] = unicode(name)
                search.save()
                return json.dumps({ "status": "OK", "message": u"Search saved" })

            if se_action == "remove":
                id = request.params.get("id")
                self.connection.player.searches.remove({ "_id": ObjectId(id) })
                return json.dumps({ "status": "OK", "message": u"Search removed" })

            if se_action == "list":
                lists = self.connection.player.searches.find({ "userid": ObjectId(self.userid) })
                pl = []
                count = 0
                for list in lists:
                    list["_id"] = unicode(list["_id"])
                    list["userid"] = unicode(list["userid"])
                    pl.append(list)
                    count += 1
                return json.dumps({ "status": "OK", "count": count, "lists": pl })
        except Exception, e:
            return json.dumps({ "status": "NeOK", "message": e })


    def love(self, l_action):
        actions = ["add", "remove", "list"]
        if l_action not in actions:
            return json.dumps({ "status": "NeOK", "message": u"Bad action '%s'" % l_action })

        if not self.userid:
            return json.dumps({ "status": "NeOK", "message": u"Bad userid '%s" %self.userid })

        try:
            if l_action == "add":
                id = request.params.get("id", "")
                owner = request.params.get("owner", "")
                search = self.connection.player.love.Love()
                search["userid"] = ObjectId(self.userid)
                search["trackid"] = unicode("%s_%s" % (owner, id))
                search.save()
                return json.dumps({ "status": "OK", "message": u"Fall in love" })

            if l_action == "remove":
                id = request.params.get("id")
                self.connection.player.love.remove({ "trackid": id, "userid": ObjectId(self.userid) })
                return json.dumps({ "status": "OK", "message": u"Fall out love" })

            if l_action == "list":
                lists = self.connection.player.love.find({ "userid": ObjectId(self.userid) })
                pl = []
                count = 0
                for list in lists:
                    pl.append(list["trackid"])
                    count += 1
                return json.dumps({ "status": "OK", "count": count, "tracks": pl })
        except Exception, e:
            return json.dumps({ "status": "NeOK", "message": e })

    def nowlistening(self):
        track_id = request.params.get("id", "")

        if not self.userid:
            return json.dumps({ "status": "NeOK", "message": u"Bad userid '%s" %self.userid })
            
        if not track_id:
            return json.dumps({ "status": "NeOK", "message": u"Bad trackid: %s" % track_id })

        try:
            self.connection.player.listening.update({ "userid": ObjectId(self.userid) }, { "$inc": { "tracks.%s" % track_id: 1 }})
            return json.dumps({ "status": "OK", "message": u"Track %s sended to FBI" % track_id })
        except Exception, e:
            return json.dumps({ "status": "NeOK", "message": e })






