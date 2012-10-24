# -*- encoding: utf-8 -*-
from django.db import models

class Pages(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    time = models.DateTimeField(
        u'Когда',
        auto_now_add=True
    )

    slug = models.SlugField(
        u"Slug"
    )

    title = models.CharField(
        u"Название исполнителя",
        max_length=100
    )

    description = models.TextField(
        u"Биография"
    )

    big_image = models.CharField(
        u"Картинка",
        max_length=100
    )

    class Meta:
        get_latest_by = 'id'
        ordering = ('-id',)
        verbose_name = u"страница исполнителя"
        verbose_name_plural = u"страницы исполнителя"

    def __unicode__(self):
        return u"%s" % self.title


class Albums(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    artist = models.ForeignKey(
        Pages,
        verbose_name=u"Исполнитель",
        related_name="artist_album"
    )

    title = models.CharField(
        u"Название исполнителя",
        max_length=100
    )

    cover = models.CharField(
        u"Картинка",
        max_length=100
    )

    class Meta:
        get_latest_by = 'id'
        ordering = ('-id',)
        verbose_name = u"альбом исполнителя"
        verbose_name_plural = u"альбомы исполнителя"

    def __unicode__(self):
        return u"%s" % self.title


class Tracks(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    artist = models.ForeignKey(
        Pages,
        verbose_name=u"Исполнитель",
        related_name="artist_track"
    )

    title = models.CharField(
        u"Название исполнителя",
        max_length=100
    )

    class Meta:
        get_latest_by = 'id'
        ordering = ('-id',)
        verbose_name = u"трек исполнителя"
        verbose_name_plural = u"треки исполнителя"

    def __unicode__(self):
        return u"%s" % self.title

class Similar(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    artist = models.ForeignKey(
        Pages,
        verbose_name=u"Исполнитель",
        related_name="artist_similar"
    )

    title = models.CharField(
        u"Название исполнителя",
        max_length=100
    )

    cover = models.CharField(
        u"Картинка",
        max_length=100
    )

    class Meta:
        get_latest_by = 'id'
        ordering = ('-id',)
        verbose_name = u"похожий исполнитель"
        verbose_name_plural = u"похожие исполнители"

    def __unicode__(self):
        return u"%s" % self.title
