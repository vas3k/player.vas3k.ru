# -*- encoding: utf-8 -*-
from django.contrib import admin
from models import *

class AccessTokensAdmin(admin.ModelAdmin):
    list_display = ('token', 'user_id', 'bad_times', 'time', 'last_access_time')

admin.site.register(AccessTokens, AccessTokensAdmin)