# -*- coding: utf-8 -*-
import logging, urllib, re, time
from urllib2 import Request, urlopen
from hashlib import md5

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from player.lib.base import BaseController, render
from mongokit import ObjectId

log = logging.getLogger(__name__)

class LastfmController(BaseController):
    API_KEY = "6f557f2c836b0fff474c3b6cfcf0ccf4"
    API_SECRET_KEY = "7fb1e8f80db62587b190910fef20379c"

    def index(self):
        # Return a rendered template
        #return render('/lastfm.mako')
        # or, return a string
        return 'Hello World'

    def callback(self):
        token = request.params.get("token", "")
        if not token: return "bad hash"
        if not self.userid: return "bad userid"

        # получим себе key
        api_sig = md5('api_key' + self.API_KEY + 'methodauth.getSessiontoken' + token + self.API_SECRET_KEY).hexdigest()
        get = 'method=auth.getSession&api_key=' + self.API_KEY + '&token=' + token + '&api_sig=' + api_sig
        answer = urllib.urlopen("http://ws.audioscrobbler.com/2.0/?%s" % get).read().replace("\n", "")
        lastfm_login = re.search("<name>(.*?)</name>", answer).group(1)
        lastfm_session =  re.search("<key>(.*?)</key>", answer).group(1)

        # теперь пожмем ручки
        nowtime = int(time.time())
        handtoken = md5(self.API_SECRET_KEY + str(nowtime)).hexdigest()
        handget = 'hs=true&p=1.2.1&c=tst&v=1.0&u=' + lastfm_login + '&t=' + str(nowtime) + '&a=' + handtoken + '&api_key=' + self.API_KEY + '&sk=' + lastfm_session
        answer = urllib.urlopen("http://post.audioscrobbler.com/?%s" % handget).read()
        session =  answer.split("\n")[1]

        # и куки не забудем
        response.set_cookie("lastfm_session", session, max_age=36000000)

        # сохраняем все в БД
        self.connection.player.users.update({ "hash": self.userhash }, { "$set": {
            "lastfm": {
                "login": lastfm_login,
                "token": token,
                "session": session
            }
        }})
        return 'OK'

    def scrobble(self):
        nowtime = int(time.time())
        lastfm_session = request.cookies.get("lastfm_session", "")
        artist = urllib.quote(request.params.get("artist", "Unknown Artist").encode("utf-8", "ignore"))
        duration = urllib.quote(request.params.get("duration", "360").encode("utf-8", "ignore"))
        song = urllib.quote(request.params.get("title", "Track 1").encode("utf-8", "ignore"))
        url = "http://post2.audioscrobbler.com:80/protocol_1.2"
        req = Request(url, u's=' + lastfm_session + '&a[0]=' + artist + '&t[0]=' + song + '&i[0]=' + str(nowtime) + '&o[0]=P&r[0]=&l[0]=' + duration + '&b[0]=&n[0]=&m[0]=')
        data = urlopen(req)
        return data
        
        