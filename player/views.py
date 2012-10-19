# -*- encoding: utf-8 -*-
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render_to_response
from django.contrib import auth
from django.contrib.auth.models import User
from django.core.cache import cache
from libs.util import render_as_json
from other.models import ListeningHistory
from player.models import UserProfile, AccessTokens

def full(request):
    if not request.user.is_authenticated():
        cached_page = cache.get('login_form_page')
        if cached_page is None:
            cached_page = render_to_response("user/login_form.html")
            cache.set('login_form_page', cached_page)
        return cached_page
        #return render_to_response("user/login_form.html")

    cached_artists = cache.get("artists_top_user_%s" % request.user.id)
    if cached_artists is None:
        cached_artists = ListeningHistory.get_weighted_set(request.user)
        cache.set("artists_top_user_%s" % request.user.id, cached_artists)
    #cached_artists = ListeningHistory.get_weighted_set()
    return render_to_response("new.html", { "ACCESS_TOKEN": AccessTokens.get_random_token(), "artists_top": cached_artists, "user": request.user })

def small(request):
    return render_to_response("small.html", { "ACCESS_TOKEN": AccessTokens.get_random_token() })

def small_redirect(request, track_id):
    return redirect("/small/#track:%s" % track_id)

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
            return render_to_response("user/error.html", { "message": u"Пароль не верен или такого пользователя не существует" })
    return render_to_response("user/login_form.html")

def logout(request):
    auth.logout(request)
    return redirect("/")

def add_token(request):
    if request.method == "POST":
        token = request.POST.get("token")
        user_id = request.POST.get("user_id")
        if token and user_id:
            try:
                token_obj = AccessTokens.objects.get(user_id=user_id)
                if not token_obj:
                    token_obj = AccessTokens.objects.create(user_id=user_id)
            except:
                token_obj = AccessTokens.objects.create(user_id=user_id)
            token_obj.token = token
            token_obj.save()
    return render_to_response("static/token_crawler.html")

@render_as_json
def bad_token(request):
    if request.method == "POST":
        token = request.POST.get("token")
        token_obj = AccessTokens.objects.get(token=token)
        token_obj.bad_times += 1
        token_obj.save()
    return { "new_token": AccessTokens.get_random_token() }

#from mongokit import *
#from django.db import connection
#
#@login_required
#def migrate(request):
#    id = request.GET.get("id")
#    if not id:
#        return render_to_response("static/migrate.html")
#
#
#    # Нужные нам модельки
#    class Playlists(Document):
#        structure = {
#            "userid": ObjectId,
#            "name": unicode,
#            "tracks": [],
#        }
#        required_fields = ['userid', 'name',]
#
#    class Love(Document):
#        structure = {
#            "userid": ObjectId,
#            "trackid": unicode,
#        }
#        required_fields = ['userid', 'trackid',]
#
#    class Searches(Document):
#        structure = {
#            "userid": ObjectId,
#            "name": unicode,
#        }
#        required_fields = ['userid', 'name']
#
#    # Подключаемся
#    con = Connection(
#          host = "127.0.0.1",
#          port = 27017
#    )
#    con.register([Playlists, Love, Searches])
#
#    # Плейлисты
#    from playlists.models import Playlist as Plmodel
#    from playlists.models import PlaylistTracks as Pltrmodel
#    playlists = con.player.playlists.find({ "userid": ObjectId(id) })
#    for pl in playlists:
#        try:
#            playlist = Plmodel.objects.create(user=request.user, title=pl["name"])
#            playlist.save()
#            for tr in pl["tracks"]:
#                try:
#                    track = Pltrmodel.objects.create(playlist=playlist, track_id=tr)
#                    track.save()
#                except:
#                    connection._rollback()
#        except:
#            pass
#
#    # Поиски
#    from searches.models import Searches as Semodel
#    searches = con.player.searches.find({ "userid": ObjectId(id) })
#    for se in searches:
#        try:
#            search = Semodel.objects.create(user=request.user, query=u"%s" % se["name"])
#            search.save()
#        except:
#            connection._rollback()
#
#    # Любимое
#    from love.models import Love as Lovemodel
#    loves = con.player.love.find({ "userid": ObjectId(id) })
#    for lo in loves:
#        try:
#            love = Lovemodel.objects.create(user=request.user, track_id=lo["trackid"])
#            love.save()
#        except:
#            connection._rollback()
#
#    return redirect("/")
