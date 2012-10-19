# -*- encoding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User

class ListeningHistory(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    user = models.ForeignKey(
        User,
        verbose_name=u'Юзер',
        related_name="listening_user"
    )

    time = models.DateTimeField(
        u'Когда',
        auto_now_add=True
    )

    track_artist = models.CharField(
        u"Исполнитель",
        max_length=100
    )

    track_title = models.CharField(
        u"Название",
        max_length=100
    )

    track_id = models.CharField(
        u"ID трека",
        max_length=20
    )

    def for_json(self):
        return "%s" % self.track_id

    def __unicode__(self):
        return u"Юзер %s слушал %s" % (self.user, self.track_title)

    class Meta:
        get_latest_by = 'time'
        ordering      = ('-id',)
        verbose_name  = u"история прослушиваний"
        verbose_name_plural = u"история прослушиваний"

    @staticmethod
    def get_weighted_set():
        group_query = "select count(*) as cnt, track_artist from (select track_artist from other_listeninghistory order by id desc limit 15000) as top group by track_artist order by cnt desc limit 150;"

        from django.db import connection
        cursor = connection.cursor()
        cursor.execute(group_query)

        row = cursor.fetchone()
        weighted_set = []
        max = row[0]
        while row:
            weighted_set.append((row[0] * 100 / max, row[1], row[0]))
            row = cursor.fetchone()

        return weighted_set

class SearchesHistory(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    user = models.ForeignKey(
        User,
        verbose_name=u'Юзер',
        related_name="savedsearch_user"
    )

    time = models.DateTimeField(
        u'Когда',
        auto_now_add=True
    )

    query = models.CharField(
        u"Запрос",
        max_length=200
    )

    def for_json(self):
        return { "name": "%s" % self.query, "date": self.time.strftime("%d.%m.%Y %H:%M") }

    def __unicode__(self):
        return u"Поиск %s" % self.query

    class Meta:
        get_latest_by = 'time'
        ordering      = ('-id',)
        verbose_name  = u"история поисков"
        verbose_name_plural = u"история поисков"



