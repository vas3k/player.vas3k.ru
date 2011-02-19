# -*- coding: utf-8 -*-
import logging, urllib, re, time
from urllib2 import Request, urlopen
from hashlib import md5

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from player.lib.base import BaseController, render
from mongokit import ObjectId  
import simplejson as json

log = logging.getLogger(__name__)

class LastfmController(BaseController):
    API_KEY = "6f557f2c836b0fff474c3b6cfcf0ccf4"
    API_SECRET_KEY = "7fb1e8f80db62587b190910fef20379c"

    def index(self):
        # Return a rendered template
        #return render('/lastfm.mako')
        # or, return a string
        return 'Hello World'

    def handshake(self, lastfm_login, lastfm_session):
        # теперь пожмем ручки
        nowtime = str(int(time.time()))
        handtoken = md5(self.API_SECRET_KEY + str(nowtime)).hexdigest()
        handget = 'hs=true&p=1.2.1&c=tst&v=1.0&u=' + lastfm_login + '&t=' + str(nowtime) + '&a=' + handtoken + '&api_key=' + self.API_KEY + '&sk=' + lastfm_session
        answer = urllib.urlopen("http://post.audioscrobbler.com/?%s" % handget).read()
        session =  answer.split("\n")[1]
        return session

    def callback(self):
        token = request.params.get("token", "")
        if not token: return "bad hash"

        # получим себе key
        api_sig = md5('api_key' + self.API_KEY + 'methodauth.getSessiontoken' + token + self.API_SECRET_KEY).hexdigest()
        get = 'method=auth.getSession&api_key=' + self.API_KEY + '&token=' + token + '&api_sig=' + api_sig
        answer = urllib.urlopen("http://ws.audioscrobbler.com/2.0/?%s" % get).read().replace("\n", "")
        lastfm_login = re.search("<name>(.*?)</name>", answer).group(1)
        lastfm_session =  re.search("<key>(.*?)</key>", answer).group(1)

        session = self.handshake(lastfm_login, lastfm_session)

        # и куки не забудем
        response.set_cookie("lastfm_session", session, max_age=36000000)
        response.set_cookie("lastfm_session_key", lastfm_session, max_age=36000000)
        response.set_cookie("lastfm_login", lastfm_login, max_age=36000000)

        return render("/static/lastfmok.html")

    def nowplaying(self):
        nowtime = int(time.time())
        lastfm_session = request.cookies.get("lastfm_session", "")
        lastfm_session_key = request.cookies.get("lastfm_session_key", "")
        lastfm_login = request.cookies.get("lastfm_login", "")
        artist = urllib.quote(request.params.get("artist", "Unknown Artist").encode("utf-8", "ignore"))
        duration = urllib.quote(request.params.get("duration", "360").encode("utf-8", "ignore"))
        song = urllib.quote(request.params.get("title", "Track 1").encode("utf-8", "ignore"))
        #return song

        #api_sig = md5(unicode(ur'api_key' + self.API_KEY + 'artist' + artist + 'methodtrack.updateNowPlaying' + 'sk' + lastfm_session_key + 'track' + song + self.API_SECRET_KEY, "utf-8")).hexdigest()
        #url = 'http://ws.audioscrobbler.com/2.0/'
        #req = Request(url, unicode(ur'method=track.updateNowPlaying&api_key=%s&artist=%s&track=%s&api_sig=%s&sk=%s' % (self.API_KEY, urllib.quote(artist), urllib.quote(song), api_sig, lastfm_session_key, "utf-8")))
        #try:
        #    data = urlopen(req).read()
        #    return song
        #    return data
        #except Exception, e:
        #    return song
        #    session = self.handshake(lastfm_login, lastfm_session_key)
        #    response.set_cookie("lastfm_session", session, max_age=36000000)
        #    return "FAIL" + e.message + " :::: " + url + u'?method=track.updateNowPlaying&api_key=%s&artist=%s&track=%s&api_sig=%s&sk=%s' % (self.API_KEY, artist, song, api_sig, lastfm_session_key)

        url = "http://post2.audioscrobbler.com:80/np_1.2"
        req = Request(url, u's=' + lastfm_session + '&a=' + artist + '&t=' + song + '&b=&l=' + duration + '&n=&m=')
        try:
            data = urlopen(req).read().strip()
            if data == "BADSESSION":
                lastfm_session = self.handshake(lastfm_login, lastfm_session_key)
                response.set_cookie("lastfm_session", lastfm_session, max_age=36000000)
                req = Request(url, u's=' + lastfm_session + '&a=' + artist + '&t=' + song + '&b=&l=' + duration + '&n=&m=')
                data = urlopen(req).read().strip()
                ans = "%s %s" % (data, "SECOND")
            else:
                ans = "%s %s" % (data, "FIRST")
            return "%s %s" % (lastfm_session, ans)
        except:
            return "FAIL"

    def scrobble(self):
        nowtime = str(int(time.time()))
        lastfm_session = request.cookies.get("lastfm_session", "")
        lastfm_session_key = request.cookies.get("lastfm_session_key", "")
        lastfm_login = request.cookies.get("lastfm_login", "")
        artist = urllib.quote(request.params.get("artist", "Unknown Artist").encode("utf-8", "ignore"))
        duration = urllib.quote(request.params.get("duration", "360").encode("utf-8", "ignore"))
        song = urllib.quote(request.params.get("title", "Track 1").encode("utf-8", "ignore"))

        #api_sig = md5(u'api_key' + self.API_KEY + 'artist' + artist + 'methodtrack.scrobble' + 'sk' + lastfm_session_key + 'timestamp' + nowtime + 'track' + song + self.API_SECRET_KEY).hexdigest()
        #url = 'http://ws.audioscrobbler.com/2.0/'
        #req = Request(url, u'method=track.scrobble&api_key=%s&artist=%s&track=%s&api_sig=%s&sk=%s&timestamp=%s' % (self.API_KEY, urllib.quote(artist), urllib.quote(song), api_sig, lastfm_session_key, nowtime))
        #try:
        #    data = urlopen(req).read()
        #    return data
        #except Exception, e:
        #    session = self.handshake(lastfm_login, lastfm_session_key)
        #    response.set_cookie("lastfm_session", session, max_age=36000000)
        #    return "FAIL" + e.message + " :::: " + url + u'?method=track.scrobble&api_key=%s&artist=%s&track=%s&api_sig=%s&sk=%s&timestamp=%s' % (self.API_KEY, artist, song, api_sig, lastfm_session_key, nowtime)


        url = "http://post2.audioscrobbler.com:80/protocol_1.2"
        req = Request(url, u's=' + lastfm_session + '&a[0]=' + artist + '&t[0]=' + song + '&i[0]=' + str(nowtime) + '&o[0]=P&r[0]=&l[0]=' + duration + '&b[0]=&n[0]=&m[0]=')
        try:
            data = urlopen(req).read().strip()
            if data == "BADSESSION":
                lastfm_session = self.handshake(lastfm_login, lastfm_session_key)
                response.set_cookie("lastfm_session", lastfm_session, max_age=36000000)
                req = Request(url, u's=' + lastfm_session + '&a[0]=' + artist + '&t[0]=' + song + '&i[0]=' + str(nowtime) + '&o[0]=P&r[0]=&l[0]=' + duration + '&b[0]=&n[0]=&m[0]=')
                data = urlopen(req).read().strip()
                ans = "%s %s" % (data, "SECOND")
            else:
                ans = "%s %s" % (data, "FIRST")
            return "%s %s" % (lastfm_session, ans)
        except:
            return "FAIL"

    def getartistinfo(self):
        from lxml import etree

        try:
            track = json.loads(request.params.get("track").encode("utf-8", "ignore"))#.encode("utf-8", "ignore")
            artist = track["artist"].encode("utf-8", "ignore")
        except:
            return json.dumps({ "status": "NeOK", "message": "Fail! No track" })

        try:
            lst = self.connection.player.listening.Listening()
            lst["user"] = ObjectId(self.userid)
            lst["track"]["title"] = unicode(track["title"])
            lst["track"]["artist"] = unicode(track["artist"])
            lst["track"]["aid"] = unicode(track["aid"])
            lst["track"]["owner_id"] = unicode(track["owner_id"])
            lst.save()
        except Exception, e:
            return json.dumps({ "status": "NeOK", "message": "Fail! Save fail %s" % e })

        try:
            if not artist: raise Exception(u"No artist")
            url = u"http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&lang=ru&autocorrect=1&api_key=%s&artist=%s" % (self.API_KEY, urllib.quote(artist))
            tree = etree.fromstring(urllib.urlopen(url).read())
            if not tree: raise Exception(u"No info")
            tree = tree.find("artist")
            answer = {
                "name": tree.find("name").text,
                "url": tree.find("url").text,
                "image": [img.text for img in tree.findall("image")],
                "similar": [art.find("name").text for art in tree.find("similar").findall("artist")],
                "bio": tree.find("bio").find("summary").text
            }
            return json.dumps({ "status": "OK", "artist": answer })
        except Exception, e:
            return json.dumps({ "status": "NeOK", "message": "Fail!" })
        
        