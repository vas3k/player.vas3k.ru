# -*- encoding: utf-8 -*-
from django.db import models


class Radio(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    city = models.CharField(
        u"Город",
        max_length=50
    )

    name = models.CharField(
        u"Название радио",
        max_length=100
    )

    code = models.CharField(
        u"Код радиостанции",
        max_length=50,
        unique=True
    )

    def for_json(self):
        return {"id": self.code, "name": self.name}

    def __unicode__(self):
        return u"Радио: %s" % self.name

    class Meta:
        get_latest_by = 'id'
        ordering = ('-id',)
        verbose_name = u"радио"
        verbose_name_plural = u"радио"


class RadioTracks(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    radio = models.ForeignKey(
        Radio,
        verbose_name=u"Радио",
        related_name="playlist_track"
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

    def for_json(self):
        return {"title": self.track_title, "artist": self.track_artist}

    def __unicode__(self):
        return u"Трек для радио: %s - %s" % (self.track_artist, self.track_title)

    class Meta:
        get_latest_by = 'id'
        ordering = ('-id',)
        verbose_name = u"трек"
        verbose_name_plural = u"треки"
