# -*- encoding: utf-8 -*-
from django.http import HttpResponsePermanentRedirect, HttpResponse
from django.conf import settings
import urllib2
from django.shortcuts import get_object_or_404, redirect
import simplejson as json
from annoying.decorators import render_to
from django.contrib.auth.decorators import login_required
from artistpages.models import Pages, Albums, Tracks, Similar
from django.template.defaultfilters import slugify
from player.models import AccessTokens

@login_required
def load_artist(request):
    if request.user.id != 1:
        return HttpResponsePermanentRedirect("/")

    artist = request.GET.get("artist")
    if not artist:
        return HttpResponsePermanentRedirect("/")

    artist = urllib2.quote(artist.encode("utf-8"))

    artist_query = "http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&format=json&lang=ru&autocorrect=1&api_key=%s&artist=%s" % (settings.LASTFM_KEY, artist)
    data = urllib2.urlopen(artist_query).read()
    data_json = json.loads(data)

    slug = slugify(data_json["artist"]["name"])
    if not slug:
        slug = data_json["artist"]["name"]

    artist_page = Pages.objects.create(
        title = data_json["artist"]["name"],
        slug = slug,
        description = data_json["artist"]["bio"]["summary"],
        big_image = data_json["artist"]["image"][3]["#text"]
    )

    albums_query = "http://ws.audioscrobbler.com/2.0/?method=artist.getTopAlbums&format=json&lang=ru&autocorrect=1&api_key=%s&artist=%s" % (settings.LASTFM_KEY, artist)
    data = urllib2.urlopen(albums_query).read()
    data_json = json.loads(data)

    for num, album in enumerate(data_json["topalbums"]["album"]):
        if num > 16: break
        Albums.objects.create(
            artist = artist_page,
            title = album["name"],
            cover = album["image"][3]["#text"]
        )

    tracks_query = "http://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&format=json&lang=ru&autocorrect=1&api_key=%s&artist=%s" % (settings.LASTFM_KEY, artist)
    data = urllib2.urlopen(tracks_query).read()
    data_json = json.loads(data)

    for num, track in enumerate(data_json["toptracks"]["track"]):
        if num > 20: break
        Tracks.objects.create(
            artist = artist_page,
            title = track["name"]
        )

    similar_query = "http://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&format=json&lang=ru&autocorrect=1&api_key=%s&artist=%s" % (settings.LASTFM_KEY, artist)
    data = urllib2.urlopen(similar_query).read()
    data_json = json.loads(data)

    for num, artist in enumerate(data_json["similarartists"]["artist"]):
        if num > 10: break
        Similar.objects.create(
            artist = artist_page,
            title = artist["name"],
            cover = artist["image"][0]["#text"]
        )

    return redirect("/listen/%s/" % slug)

@render_to("artists/artist.html")
def show(request, artist):
    artist_page = get_object_or_404(Pages, slug=artist)
    albums = Albums.objects.filter(artist=artist_page).order_by("-id")
    tracks = Tracks.objects.filter(artist=artist_page).order_by("-id")
    similar = Similar.objects.filter(artist=artist_page).order_by("-id")

    return {
        "artist": artist_page,
        "albums": albums,
        "tracks": tracks,
        "similar": similar,
        "ACCESS_TOKEN": AccessTokens.get_random_token()
    }

@render_to("artists/list.html")
def list(request):
    return {
        "artists": Pages.objects.order_by("-id")
    }