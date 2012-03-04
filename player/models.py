# -*- encoding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User)

    vk_name = models.CharField(
        u"VK имя",
        max_length=100
    )