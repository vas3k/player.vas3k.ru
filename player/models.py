# -*- encoding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from datetime import datetime

class UserProfile(models.Model):
    user = models.OneToOneField(User)

    vk_name = models.CharField(
        u"VK имя",
        max_length=100
    )

class AccessTokens(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    token = models.CharField(
        u"Токен",
        max_length=100
    )

    # TODO: user_id

    time = models.DateTimeField(
        u"Добавлен",
        auto_now_add=True
    )

    last_access_time = models.DateTimeField(
        u"Последний доступ",
        auto_now=True
    )

    class Meta:
        get_latest_by = 'last_access_time'
        ordering      = ('-id',)
        verbose_name  = u"токен"
        verbose_name_plural = u"токены"

    def __unicode__(self):
        return u"%s" % self.token

    @staticmethod
    def get_random_token():
        try:
            token = AccessTokens.objects.order_by('last_access_time')[0]
            token.last_access_time = datetime.now()
            token.save()
            return token.token
        except:
            return ""