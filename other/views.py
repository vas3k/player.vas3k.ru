# -*- encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from other.models import ListeningHistory, SearchesHistory
from libs.util import render_as_json

@login_required
@render_as_json
def get_listening_history(request):
    try:
        track_objects = ListeningHistory.objects.filter(user=request.user).order_by("-id")[:150]
        tracks = [t.for_json() for t in track_objects]
        return { "status": "OK", "count": len(tracks), "tracks": tracks }
    except Exception, e:
        return { "status": "NeOK", "message": str(e) }

@login_required
@render_as_json
def add_to_searches_history(request):
    query = request.POST.get("query")
    if not query:
        return { "status": "NeOK", "message": u"Поисковый запрос пуст" }
    search = SearchesHistory.objects.create(user=request.user, query=query)
    search.save()
    return { "status": "NeOK", "message": u"Поиск добавлен" }

@login_required
@render_as_json
def get_searches_history(request):
    search_objects = SearchesHistory.objects.filter(user=request.user).order_by("-id")[:5]
    searches = [s.for_json() for s in search_objects]
    return { "status": "OK", "count": len(searches), "lists": searches }

