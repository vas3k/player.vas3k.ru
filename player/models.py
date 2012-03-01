# -*- encoding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User)

    vk_name = models.CharField(
        u"VK имя",
        max_length=100
    )

class SearchHistory(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    user = models.ForeignKey(
        User,
        verbose_name=u'Юзер',
        related_name="search_history_user"
    )

    time = models.DateTimeField(
        u'Когда',
        auto_now_add=True
    )

    query = models.CharField(
        u"Запрос",
        max_length=200
    )

    def __unicode__(self):
        return u"Юзер %s искал: %s" % (self.user, self.query)

    class Meta:
        get_latest_by = 'time'
        ordering      = ('-id',)
        verbose_name  = u"история поисков"
        verbose_name_plural = u"история поисков"

