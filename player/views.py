# -*- encoding: utf-8 -*-
from django.shortcuts import redirect, render_to_response
from django.http import HttpResponse, HttpResponsePermanentRedirect
from django.contrib import auth
from django.contrib.auth.models import User
from django.core.cache import cache
from annoying.decorators import ajax_request, render_to
from other.models import ListeningHistory
from player.models import UserProfile, AccessTokens


def full(request):
    referer = request.META.get('HTTP_REFERER') or None
    if referer is not None and "/api/auth?api_key=6f557f2c836b0fff474c3b6cfcf0ccf4" in referer:
        return HttpResponse("<script>window.close()</script>")

    if not request.user.is_authenticated():
        cached_page = cache.get('login_form_page')
        if cached_page is None:
            cached_page = render_to_response("user/login_form.html")
            cache.set('login_form_page', cached_page)
        return cached_page

    cached_artists = cache.get("artists_top_user_%s" % request.user.id)
    if cached_artists is None:
        cached_artists = ListeningHistory.get_weighted_set(request.user)
        cache.set("artists_top_user_%s" % request.user.id, cached_artists)
    return render_to_response("new.html", {"ACCESS_TOKEN": AccessTokens.get_random_token(), "artists_top": cached_artists, "user": request.user})


@render_to('small.html')
def small(request):
    return {"ACCESS_TOKEN": AccessTokens.get_random_token()}


def small_redirect(request, track_id):
    return redirect("/small/#track:" + track_id)


def register(request):
    if request.method == "POST":
        # register
        username = request.POST['login']
        password = request.POST['password']

        if not username or not password:
            return render_to_response("user/error.html", {"message": u"Логин или пароль пуст"})

        try:
            user = User.objects.create_user(username, u"%s@none.ru" % username, password)
            user.is_active = True
            user.save()
            profile = UserProfile()
            profile.user = user
            profile.save()
            auth.login(request, auth.authenticate(username=username, password=password))
        except:
            return render_to_response("user/error.html", {"message": u"Пользователь с таким ником уже существует"})

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
            return render_to_response("user/error.html", {"message": u"Пароль не верен или такого пользователя не существует"})
    return HttpResponsePermanentRedirect("/")


def logout(request):
    auth.logout(request)
    return redirect("/")


@render_to('static/token_crawler.html')
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


@ajax_request
def bad_token(request):
    if request.method == "POST":
        token = request.POST.get("token")
        token_obj = AccessTokens.objects.get(token=token)
        token_obj.bad_times += 1
        token_obj.save()
    return {"new_token": AccessTokens.get_random_token()}
