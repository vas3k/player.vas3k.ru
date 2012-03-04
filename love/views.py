# -*- encoding: utf-8 -*-
import simplejson as json
from django.contrib.auth.decorators import login_required
from libs.util import render_as_json
from love.models import Love

@render_as_json
@login_required
def list(request):
    track_objects = Love.objects.filter(user=request.user).order_by("track_position")[:199]
    love = [s.for_json() for s in track_objects]
    return { "status": "OK", "count": len(love), "tracks": love }

@render_as_json
@login_required
def add(request):
    tracks = json.loads(request.POST.get("tracks"))
    if not tracks:
        return { "status": "NeOK", "message": u"Список треков пуст" }

    for track_id in tracks:
        track_love = Love.objects.create(user=request.user, track_id=track_id)
        track_love.save()

    return json.dumps({ "status": "OK", "message": u"Трек добавлен в любимые" })

@render_as_json
@login_required
def remove(request):
    id = request.POST.get("id")
    if not id:
        return { "status": "NeOK", "message": u"No ID" }

    try:
        Love.objects.get(track_id=id).delete()
        return { "status": "OK", "message": u"Трек удален из любимых" }
    except:
        return { "status": "NeOk", "message": u"Трека с таким ID нет" }

@render_as_json
@login_required
def sorted(request):
    sorted_ids = json.loads(request.POST.get("sorted"))
    if not sorted_ids:
        return { "status": "NeOK", "message": u"Список пуст" }

    try:
        for position, track_id in enumerate(sorted_ids):
            track = Love.objects.get(user=request.user, track_id=track_id)
            if track:
                track.track_position = position
                track.save_without_recount()

        return { "status": "OK", "message": u"Любимое успешно сохранено" }
    except Exception, ex:
        return { "status": "NeOK", "message": "%s" % ex }
