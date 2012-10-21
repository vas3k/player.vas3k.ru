# -*- encoding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns(
    'searches.views',
    (r'list$', 'list'),
    (r'add$', 'new'),  # TODO: fix url
    (r'remove$', 'remove'),
)
