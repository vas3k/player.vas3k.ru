# -*- encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from libs.util import render_as_json
from searches.models import Searches

@render_as_json
@login_required
def list(request):
    search_objects = Searches.objects.filter(user=request.user)
    searches = [s.for_json() for s in search_objects]
    return { "status": "OK", "count": len(searches), "lists": searches }

@render_as_json
@login_required
def new(request):
    name = request.POST.get("name", "")
    if not name:
        return { "status": "NeOK", "message": u"Нельзя сохранять пустой запрос" }

    search = Searches.objects.create(user=request.user, query=name)
    search.save()
    return { "status": "OK", "message": u"Поиск сохранен" }

@render_as_json
@login_required
def remove(request):
    id = request.POST.get("id")
    if not id:
        return { "status": "NeOK", "message": u"No ID" }

    Searches.objects.get(id=id).delete()
    return { "status": "OK", "message": u"Поиск удален" }