# -*- encoding: utf-8 -*-
from django.conf.urls.defaults import *

urlpatterns = patterns('love.views',
    (r'list$', 'list'),
    (r'remove$', 'remove'),
    (r'add$', 'add'),
)
