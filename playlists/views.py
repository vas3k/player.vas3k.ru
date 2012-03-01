# -*- encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from playlists.models import Playlist, PlaylistTracks
from libs.util import render_as_json
import simplejson as json

@render_as_json
@login_required
def list(request):
    playlist_objects = Playlist.objects.filter(user=request.user)
    playlists = [pl.for_json() for pl in playlist_objects]
    return { "status": "OK", "count": len(playlists), "lists": playlists }

@render_as_json
@login_required
def new(request):
    name = request.POST.get("name")
    if not name:
        return { "status": "NeOK", "message": u"Не указано название плейлиста" }

    playlist = Playlist.objects.create(user=request.user, title=name)
    playlist.save()
    return { "status": "OK", "message": u"Плейлист создан" }

@render_as_json
@login_required
def remove(request):
    id = request.POST.get("id")
    if not id:
        return { "status": "NeOK", "message": u"No ID" }

    try:
        Playlist.objects.get(id=id).delete()
        return { "status": "OK", "message": u"Плейлист удален" }
    except:
        return { "status": "NeOK", "message": u"Ошибка удаления плейлиста" }

@render_as_json
@login_required
def add(request):
    id = request.POST.get("id")
    tracks = json.loads(request.POST.get("tracks"))
    if not id:
        return { "status": "NeOK", "message": u"No ID" }
    playlist = Playlist.objects.get(id=id)
    for track in tracks:
        track = PlaylistTracks.objects.create(playlist=playlist, track_id=track)
        track.save()

    return { "status": "OK", "message": u"Треки добавлены в плейлист" }


@render_as_json
@login_required
def get(request):
    id = request.POST.get("id")
    if not id:
        return { "status": "NeOK", "message": u"No ID" }

    track_objects = PlaylistTracks.objects.filter(playlist__id=id).order_by("track_position")[:199]
    track_list = [t.for_json() for t in track_objects]
    return { "status": "OK", "list": { "_id": id, "tracks": track_list }}

@render_as_json
@login_required
def delete(request):
    playlist_id = request.POST.get("playlist_id")
    track_id = request.POST.get("track_id")
    if not playlist_id or not track_id:
        return { "status": "NeOK", "message": u"No ID" }

    try:
        PlaylistTracks.objects.get(track_id=track_id, playlist__id=playlist_id).delete()
        return { "status": "OK", "message": u"Трек с ID %s удален" % track_id }
    except Exception, ex:
        return { "status": "NeOK", "message": u"Проблема с удалением из плейлиста: %s" % ex }