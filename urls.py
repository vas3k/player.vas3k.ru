# -*- encoding: utf-8 -*-
from django.conf.urls.defaults import patterns, include, url
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'Player.views.home', name='home'),
    # url(r'^Player/', include('Player.foo.urls')),

    (r'^$', 'player.views.full'),
    (r'^small/$', 'player.views.small'),
    (r'small/track/(?P<track_id>.*)/', 'player.views.small_redirect'),
    (r'^register/$', 'player.views.register'),
    (r'^login/$', 'player.views.login'),
    (r'^logout/$', 'player.views.logout'),
#    (r'^migrate/$', 'player.views.migrate'),

    (r'^nowlistening$', 'other.views.get_listening_history'),
    (r'^ajax/nowlistening$', 'other.views.get_listening_history'),
    (r'^ajax/add_to_nowlistening$', 'other.views.add_to_listening_history'),

    (r'^ajax/playlist/', include('playlists.urls')),
    (r'^ajax/searches/', include('searches.urls')),
    (r'^ajax/love/', include('love.urls')),
    (r'^ajax/searchhistory/add/', 'other.views.add_to_searches_history'),
    (r'^ajax/searchhistory/list', 'other.views.get_searches_history'),

    (r'^lastfm/', include('lastfm.urls')),
    (r'^radio/', include('radio.urls')),
    (r'^add_token', 'player.views.add_token'),

    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
)

# если у нас тест-сервер, сделаем вот так, на боевом nginx,
# конечно же, все делается через location
if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^new/(.*)$', 'django.views.static.serve',
             { 'document_root': settings.MEDIA_ROOT + "/new", 'show_indexes': True }),
        (r'^css/(.*)$', 'django.views.static.serve',
             { 'document_root': settings.MEDIA_ROOT + "/css", 'show_indexes': True }),
        (r'^images/(.*)$', 'django.views.static.serve',
            { 'document_root': settings.MEDIA_ROOT + "/images", 'show_indexes': True }),
        (r'^js/(.*)$', 'django.views.static.serve',
            { 'document_root': settings.MEDIA_ROOT + "/js", 'show_indexes': True }),
        (r'^swf/(.*)$', 'django.views.static.serve',
            { 'document_root': settings.MEDIA_ROOT + "/swf", 'show_indexes': True }),
    )