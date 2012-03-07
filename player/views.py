# -*- encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render_to_response
from django.contrib import auth
from django.contrib.auth.models import User
from player.models import UserProfile, AccessTokens

def full(request):
    if not request.user.is_authenticated():
        return redirect("/login")
    return render_to_response("layout.html", { "ACCESS_TOKEN": AccessTokens.get_random_token() })

def small(request):
    return render_to_response("small.html", { "ACCESS_TOKEN": AccessTokens.get_random_token() })

def register(request):
    if request.method == "POST":
        # register
        username = request.POST['login']
        password = request.POST['password']

        if not username or not password:
            return render_to_response("user/error.html", { "message": u"Логин или пароль пуст" })

        try:
            user = User.objects.create_user(username, u"%s@none.ru" % username, password)
            user.is_active = True
            user.save()
            profile = UserProfile()
            profile.user = user
            profile.save()
            auth.login(request, auth.authenticate(username=username, password=password))
        except:
            return render_to_response("user/error.html", { "message": u"Пользователь с таким ником уже существует" })

        return redirect("/")
    else:
        return render_to_response("user/reg_form.html")

def login(request):
    if request.method == "POST":
        username = request.POST['login']
        password = request.POST['password']
        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect(request.GET.get("next", "/"))
        else:
            return render_to_response("user/error.html", { "message": u"Такого пользователя нет" })
    return render_to_response("user/login_form.html")

def logout(request):
    auth.logout(request)
    return redirect("/login/")

def faq(request):
    return render_to_response("static/faq.html")


from mongokit import *
from django.db import connection

@login_required
def migrate(request):
    id = request.GET.get("id")
    if not id:
        return render_to_response("static/migrate.html")


    # Нужные нам модельки
    class Playlists(Document):
        structure = {
            "userid": ObjectId,
            "name": unicode,
            "tracks": [],
        }
        required_fields = ['userid', 'name',]

    class Love(Document):
        structure = {
            "userid": ObjectId,
            "trackid": unicode,
        }
        required_fields = ['userid', 'trackid',]

    class Searches(Document):
        structure = {
            "userid": ObjectId,
            "name": unicode,
        }
        required_fields = ['userid', 'name']

    # Подключаемся
    con = Connection(
          host = "127.0.0.1",
          port = 27017
    )
    con.register([Playlists, Love, Searches])

    # Плейлисты
    from playlists.models import Playlist as Plmodel
    from playlists.models import PlaylistTracks as Pltrmodel
    playlists = con.player.playlists.find({ "userid": ObjectId(id) })
    for pl in playlists:
        try:
            playlist = Plmodel.objects.create(user=request.user, title=pl["name"])
            playlist.save()
            for tr in pl["tracks"]:
                try:
                    track = Pltrmodel.objects.create(playlist=playlist, track_id=tr)
                    track.save()
                except:
                    connection._rollback()
        except:
            pass

    # Поиски
    from searches.models import Searches as Semodel
    searches = con.player.searches.find({ "userid": ObjectId(id) })
    for se in searches:
        try:
            search = Semodel.objects.create(user=request.user, query=u"%s" % se["name"])
            search.save()
        except:
            connection._rollback()

    # Любимое
    from love.models import Love as Lovemodel
    loves = con.player.love.find({ "userid": ObjectId(id) })
    for lo in loves:
        try:
            love = Lovemodel.objects.create(user=request.user, track_id=lo["trackid"])
            love.save()
        except:
            connection._rollback()

    return redirect("/")