# -*- encoding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns('playlists.views',
    (r'list$', 'list'),
    (r'new$', 'new'),
    (r'remove$', 'remove'),
    (r'add$', 'add'),
    (r'get$', 'get'),
    (r'delete$', 'delete'),
    (r'sorted', 'sorted')
)
