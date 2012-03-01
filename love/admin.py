# -*- encoding: utf-8 -*-
from django.contrib import admin
from models import *

class LoveAdmin(admin.ModelAdmin):
    list_display = ('track_id', 'user', 'time', 'track_position')

admin.site.register(Love, LoveAdmin)