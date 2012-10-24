# -*- encoding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns(
    'artistpages.views',
    (r'^$', 'list'),
    (r'^load/$', 'load_artist'),
    (r'^(?P<artist>.+)/', 'show'),
)
