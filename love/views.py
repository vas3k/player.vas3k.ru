# -*- encoding: utf-8 -*-
import simplejson as json
from django.contrib.auth.decorators import login_required
from annoying.decorators import ajax_request
from love.models import Love


@ajax_request
@login_required
def list(request):
    track_objects = Love.objects.filter(user=request.user).order_by("track_position")[:150]
    love = [s.for_json() for s in track_objects]
    return {"status": "OK", "count": len(love), "tracks": love}


@ajax_request
@login_required
def add(request):
    tracks = json.loads(request.POST.get("tracks"))
    if not tracks:
        return {"status": "NeOK", "message": u"Список треков пуст"}

    count = Love.objects.filter(user=request.user).count()
    if count >= 150:
        return {"status": "NeOK", "message": u"Достигнут предел в 150 треков. Удалите что-нибудь или перенесите в плейлист"}

    for track_id in tracks:
        track_love = Love.objects.create(user=request.user, track_id=track_id)
        track_love.save()
        if track_love.track_position >= 150:
            return {"status": "NeOK", "message": u"Некоторые треки не были добавлены потому что достигнут предел в 150 треков. Удалите что-нибудь или перенесите в плейлист"}

    return json.dumps({"status": "OK", "message": u"Трек добавлен в любимые"})


@ajax_request
@login_required
def remove(request):
    id = request.POST.get("id")
    if not id:
        return {"status": "NeOK", "message": u"No ID"}

    try:
        Love.objects.get(track_id=id).delete()
        return {"status": "OK", "message": u"Трек удален из любимых"}
    except:
        return {"status": "NeOk", "message": u"Трека с таким ID нет"}


@ajax_request
@login_required
def sorted(request):
    sorted_ids = json.loads(request.POST.get("sorted"))
    if not sorted_ids:
        return {"status": "NeOK", "message": u"Список пуст"}

    try:
        for position, track_id in enumerate(sorted_ids):
            track = Love.objects.get(user=request.user, track_id=track_id)
            if track:
                track.track_position = position
                track.save_without_recount()

        return {"status": "OK", "message": u"Любимое успешно сохранено"}
    except Exception, ex:
        return {"status": "NeOK", "message": ex}
