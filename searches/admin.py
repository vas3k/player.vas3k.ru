# -*- encoding: utf-8 -*-
from django.contrib import admin
from models import *

class SearchesAdmin(admin.ModelAdmin):
    list_display = ('query', 'user', 'time')

admin.site.register(Searches, SearchesAdmin)