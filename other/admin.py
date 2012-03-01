# -*- encoding: utf-8 -*-
from django.contrib import admin
from models import *

class ListeningHistoryAdmin(admin.ModelAdmin):
    list_display = ('track_id', 'track_artist', 'track_title', 'time', 'user')

admin.site.register(ListeningHistory, ListeningHistoryAdmin)

class SearchesHistoryAdmin(admin.ModelAdmin):
    list_display = ('query', 'time', 'user')

admin.site.register(SearchesHistory, SearchesHistoryAdmin)