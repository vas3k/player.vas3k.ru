# -*- encoding: utf-8 -*-
import urllib2
import time
import simplejson as json
from hashlib import md5
from lxml import etree
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render_to_response
from annoying.decorators import ajax_request

SESSION_LIFECYCLE = 365 * 24 * 60 * 60

def handshake(lastfm_login, lastfm_session):
    # теперь пожмем ручки
    nowtime = str(int(time.time()))
    handtoken = md5(settings.LASTFM_SECRET + str(nowtime)).hexdigest()
    handget = 'hs=true&p=1.2.1&c=tst&v=1.0&u=' + lastfm_login + '&t=' + str(nowtime) + '&a=' + handtoken + '&api_key=' + settings.LASTFM_KEY + '&sk=' + lastfm_session
    answer = urllib2.urlopen("http://post.audioscrobbler.com/?%s" % handget).read()
    session = answer.split("\n")[1]
    return session


def callback(request):
    token = request.GET.get("token", "")
    if not token:
        return HttpResponse("Bad hash")

    # получим себе key
    api_sig = md5('api_key' + settings.LASTFM_KEY + 'methodauth.getSessiontoken' + token + settings.LASTFM_SECRET).hexdigest()
    get = 'method=auth.getSession&format=json&api_key=' + settings.LASTFM_KEY + '&token=' + token + '&api_sig=' + api_sig

    try:
        answer = urllib2.urlopen("http://ws.audioscrobbler.com/2.0/?%s" % get).read().replace("\n", "")
        answer_json = json.loads(answer)
        lastfm_login = answer_json["session"]["name"]
        lastfm_session = answer_json["session"]["key"]
        session = handshake(lastfm_login, lastfm_session)
    except:
        return render_to_response("static/lastfmnotok.html")

    # и куки не забудем
    response = render_to_response("static/lastfmok.html")
    response.set_cookie("lastfm_session", session, max_age=SESSION_LIFECYCLE)
    response.set_cookie("lastfm_session_key", lastfm_session, max_age=SESSION_LIFECYCLE)
    response.set_cookie("lastfm_login", lastfm_login, max_age=SESSION_LIFECYCLE)

    return response


def nowplaying(request):
    lastfm_session = request.COOKIES.get("lastfm_session", "")
    lastfm_session_key = request.COOKIES.get("lastfm_session_key", "")
    lastfm_login = request.COOKIES.get("lastfm_login", "")
    artist = urllib2.quote(request.POST.get("artist", "Unknown Artist").encode("utf-8", "ignore").replace("&#39;", "\'"))
    duration = urllib2.quote(request.POST.get("duration_ms", "360").encode("utf-8", "ignore"))
    song = urllib2.quote(request.POST.get("title", "Track 1").encode("utf-8", "ignore").replace("&#39;", "\'"))

    url = "http://post2.audioscrobbler.com:80/np_1.2"
    req = urllib2.Request(url, u's=' + lastfm_session + '&a=' + artist + '&t=' + song + '&b=&l=' + duration + '&n=&m=')
    response = HttpResponse()
    try:
        data = urllib2.urlopen(req).read().strip()
        if data == "BADSESSION":
            lastfm_session = handshake(lastfm_login, lastfm_session_key)
            response.set_cookie("lastfm_session", lastfm_session, max_age=SESSION_LIFECYCLE)
            req = urllib2.Request(url, u's=' + lastfm_session + '&a=' + artist + '&t=' + song + '&b=&l=' + duration + '&n=&m=')
            data = urllib2.urlopen(req).read().strip()
            ans = "%s %s" % (data, "SECOND")
        else:
            ans = "%s %s" % (data, "FIRST")
        response.content = "%s %s" % (lastfm_session, ans)
    except:
        response.content = "FAIL"
    return HttpResponse(response)


def scrobble(request):
    nowtime = str(int(time.time()))
    lastfm_session = request.COOKIES.get("lastfm_session", "")
    lastfm_session_key = request.COOKIES.get("lastfm_session_key", "")
    lastfm_login = request.COOKIES.get("lastfm_login", "")
    artist = urllib2.quote(request.POST.get("artist", "Unknown Artist").encode("utf-8", "ignore").replace("&#39;", "\'"))
    duration = urllib2.quote(request.POST.get("duration_ms", "360").encode("utf-8", "ignore"))
    song = urllib2.quote(request.POST.get("title", "Track 1").encode("utf-8", "ignore").replace("&#39;", "\'"))

    url = "http://post2.audioscrobbler.com:80/protocol_1.2"
    req = urllib2.Request(url, u's=' + lastfm_session + '&a[0]=' + artist + '&t[0]=' + song + '&i[0]=' + str(nowtime) + '&o[0]=P&r[0]=&l[0]=' + duration + '&b[0]=&n[0]=&m[0]=')
    response = HttpResponse()
    try:
        data = urllib2.urlopen(req).read().strip()
        if data == "BADSESSION":
            lastfm_session = handshake(lastfm_login, lastfm_session_key)
            response.set_cookie("lastfm_session", lastfm_session, max_age=SESSION_LIFECYCLE)
            req = urllib2.Request(url, u's=' + lastfm_session + '&a[0]=' + artist + '&t[0]=' + song + '&i[0]=' + str(nowtime) + '&o[0]=P&r[0]=&l[0]=' + duration + '&b[0]=&n[0]=&m[0]=')
            data = urllib2.urlopen(req).read().strip()
            ans = "%s %s" % (data, "SECOND")
        else:
            ans = "%s %s" % (data, "FIRST")
        response.content = "%s %s" % (lastfm_session, ans)
    except:
        response.content = "FAIL"
    return response


@ajax_request
def getrecommended(request):
    lastfm_session_key = request.COOKIES.get("lastfm_session_key", "")
    try:
        api_sig = md5(u"api_key%smethoduser.getRecommendedArtistssk%s%s" % (settings.LASTFM_KEY, lastfm_session_key, settings.LASTFM_SECRET)).hexdigest()
        url = u"http://ws.audioscrobbler.com/2.0/?api_key=%s&method=user.getRecommendedArtists&sk=%s&api_sig=%s" % (settings.LASTFM_KEY, lastfm_session_key, api_sig)
        tree = etree.fromstring(urllib2.urlopen(url).read())
        if not tree:
            raise Exception(u"No info")
        tree = tree.find("recommendations")
        recommendations = []
        for artist in tree.findall("artist"):
            recommendations.append({"name": artist.find("name").text, "cover": artist.findall("image")[0].text, "cover_big": artist.findall("image")[3].text})
        return {"status": "OK", "artists": recommendations}
    except Exception, e:
        return {"status": "NeOK", "message": "Fail! %s" % e}
