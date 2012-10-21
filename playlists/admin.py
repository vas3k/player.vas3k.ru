# -*- encoding: utf-8 -*-
from django.contrib import admin
from models import *


class PlaylistsAdmin(admin.ModelAdmin):
    list_display = ('title', 'count', 'user', 'time')

admin.site.register(Playlist, PlaylistsAdmin)


class PlaylistTracksAdmin(admin.ModelAdmin):
    list_display = ('track_id', 'playlist', 'time', 'track_position')

admin.site.register(PlaylistTracks, PlaylistTracksAdmin)
