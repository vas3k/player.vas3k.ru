# -*- encoding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns(
    'radio.views',
    (r'parse_stations$', 'update_stations'),
    (r'parse$', 'update'),
    (r'get_radio$', 'get_radio'),
    (r'get_list$', 'get_list')
)
