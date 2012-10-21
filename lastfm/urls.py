# -*- encoding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns(
    'lastfm.views',
    (r'callback$', 'callback'),
    (r'nowplaying$', 'nowplaying'),
    (r'scrobble$', 'scrobble'),
    (r'getrecommended$', 'getrecommended')
)
