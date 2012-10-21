# -*- encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from playlists.models import Playlist, PlaylistTracks
from annoying.decorators import ajax_request
import simplejson as json


@ajax_request
@login_required
def list(request):
    playlist_objects = Playlist.objects.filter(user=request.user).order_by("-id")
    playlists = [pl.for_json() for pl in playlist_objects]
    return {"status": "OK", "count": len(playlists), "lists": playlists}


@ajax_request
@login_required
def new(request):
    name = request.POST.get("name")
    if not name:
        return {"status": "NeOK", "message": u"Не указано название плейлиста"}

    playlist = Playlist.objects.create(user=request.user, title=name)
    playlist.save()
    return {"status": "OK", "message": u"Плейлист создан"}


@ajax_request
@login_required
def remove(request):
    id = request.POST.get("id")
    if not id:
        return {"status": "NeOK", "message": u"No ID"}

    try:
        Playlist.objects.get(id=id).delete()
        return {"status": "OK", "message": u"Плейлист удален"}
    except:
        return {"status": "NeOK", "message": u"Ошибка удаления плейлиста"}


@ajax_request
@login_required
def add(request):
    id = request.POST.get("id")
    tracks = json.loads(request.POST.get("tracks"))
    if not id:
        return {"status": "NeOK", "message": u"No ID"}

    playlist = Playlist.objects.get(id=id)
    if playlist.count >= 150:
        return {"status": "NeOK", "message": u"Достигнут предел в 150 треков. Создайте новый плейлист или удалите треки из этого"}

    for track in tracks:
        if PlaylistTracks.objects.filter(playlist=playlist, track_id=track).count() == 0:
            track = PlaylistTracks.objects.create(playlist=playlist, track_id=track)
            track.save()
            if track.track_position >= 150:
                return {"status": "NeOK", "message": u"Некоторые треки не были добавлены потому что достигнут предел в 150 треков. Удалите что-нибудь или перенесите в другой плейлист"}

    return {"status": "OK", "message": u"Треки добавлены в плейлист"}


@ajax_request
@login_required
def get(request):
    id = request.POST.get("id")
    if not id:
        return {"status": "NeOK", "message": u"No ID"}

    playlist = Playlist.objects.get(id=id)
    track_objects = PlaylistTracks.objects.filter(playlist__id=id).order_by("track_position")[:150]
    track_list = [t.for_json() for t in track_objects]
    return {"status": "OK", "list": {"_id": id, "tracks": track_list, "title": playlist.title}}


@ajax_request
@login_required
def delete(request):
    playlist_id = request.POST.get("playlist_id")
    track_id = request.POST.get("track_id")
    if not playlist_id or not track_id:
        return {"status": "NeOK", "message": u"No ID"}

    try:
        PlaylistTracks.objects.filter(track_id=track_id, playlist__id=playlist_id).delete()
        return {"status": "OK", "message": u"Трек с ID %s удален" % track_id}
    except Exception, ex:
        return {"status": "NeOK", "message": u"Проблема с удалением из плейлиста: " + ex}


@ajax_request
@login_required
def sorted(request):
    playlist_id = request.POST.get("id")
    sorted_ids = json.loads(request.POST.get("sorted"))
    if not playlist_id:
        return {"status": "NeOK", "message": u"Не задан ID плейлиста"}
    if not sorted_ids:
        return {"status": "NeOK", "message": u"Список пуст"}

    try:
        for position, track_id in enumerate(sorted_ids):
            track = PlaylistTracks.objects.get(playlist__id=playlist_id, track_id=track_id)
            if track:
                track.track_position = position
                track.save_without_recount()

        return {"status": "OK", "message": u"Плейлист успешно сохранен"}
    except Exception, ex:
        return {"status": "NeOK", "message": ex}
