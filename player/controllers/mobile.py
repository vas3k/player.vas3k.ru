# -*- coding: utf-8 -*-
import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from player.lib.base import BaseController, render

log = logging.getLogger(__name__)

class MobileController(BaseController):

    def index(self):
        # Return a rendered template
        #return render('/mobile.mako')
        # or, return a string
        return u"Мобильная версия отключена"
        #return render("mobile/layout.html")

    def menu(self):
        return u"Мобильная версия отключена"
        #return render("mobile/home.html")
