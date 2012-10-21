# -*- encoding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User


class Playlist(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    user = models.ForeignKey(
        User,
        verbose_name=u'Юзер',
        related_name="playlist_user"
    )

    time = models.DateTimeField(
        u'Когда',
        auto_now_add=True
    )

    title = models.CharField(
        u"Название",
        max_length=100
    )

    count = models.PositiveIntegerField(
        u"Количество треков",
        default=0
    )

    class Meta:
        get_latest_by = 'time'
        ordering = ('-id',)
        verbose_name = u"плейлист"
        verbose_name_plural = u"плейлисты"

    def __unicode__(self):
        return u"Плейлист %s" % self.title

    def count_playlist_tracks(self):
        return PlaylistTracks.objects.filter(playlist=self).count()

    def for_json(self):
        return {"_id": self.id, "name": self.title, "track_count": self.count, "userid": self.user.id}


class PlaylistTracks(models.Model):
    id = models.AutoField(
        '#',
        primary_key=True
    )

    playlist = models.ForeignKey(
        Playlist,
        verbose_name=u"Плейлист",
        related_name="playlist_track"
    )

    time = models.DateTimeField(
        u'Когда',
        auto_now_add=True
    )

    track_id = models.CharField(
        u"ID трека",
        max_length=60
    )

    track_position = models.PositiveIntegerField(
        u"Положение в плейлисте",
        default=0,
    )

    class Meta:
        get_latest_by = 'time'
        ordering = ('-id',)
        verbose_name = u"трек плейлиста"
        verbose_name_plural = u"треки плейлиста"

    def __unicode__(self):
        return u"Трек %s" % self.track_id

    def for_json(self):
        return "%s" % self.track_id

    def save_without_recount(self, *args, **kwargs):
        super(PlaylistTracks, self).save(*args, **kwargs)

    def save(self, *args, **kwargs):
        self.playlist.count = self.playlist.count_playlist_tracks()
        self.playlist.save()
        self.track_position = self.playlist.count
        super(PlaylistTracks, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.playlist.count = self.playlist.count_playlist_tracks()
        self.playlist.save()
        super(PlaylistTracks, self).delete(*args, **kwargs)
