# -*- coding: utf-8 -*-
import logging
from hashlib import md5

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from player.lib.base import BaseController, render

log = logging.getLogger(__name__)

class MainController(BaseController):

    def index(self):
        # Return a rendered template
        #return render('/main.mako')
        # or, return a string
        return render('/layout.html')

    def register(self):
        if request.method == "POST":
            # register
            try:
                login = request.params.get("login", "")
                password = request.params.get("password", "")
            except:
                c.message = u"Ошибка при получении данных с формы"
                return render("/user/error.html")
            try:
                if not login: raise Exception(u"Логин пуст")
                if not password: raise Exception(u"Пароль пуст")
            except Exception, e:
                c.message = e
                return render("/user/error.html")
            user = self.connection.player.users.Users()
            user["login"] = login
            user["password"] = unicode(md5(password).hexdigest())
            user.save()
            from random import randint
            hash = md5(str(randint(1, 9999))).hexdigest()
            self.connection.player.users.update({ "login": login }, { "$set": {
                "hash": hash
            }})
            response.set_cookie("userhash", hash, max_age=3600000)
            response.set_cookie("userid", user["_id"], max_age=3600000)
            redirect("/")
        else:
            # show form
            return render("/user/reg_form.html")

    def login(self):
        if request.method == "POST":
            # login
            try:
                login = request.params.get("login", "")
                password = request.params.get("password", "")
            except:
                c.message = u"Ошибка при получении данных с формы"
                return render("/user/error.html")
            try:
                if not login: raise Exception(u"Логин пуст")
                if not password: raise Exception(u"Пароль пуст")
            except Exception, e:
                c.message = e
                return render("/user/error.html")

            try:
                user = self.connection.player.users.find_one({ "login": login })
                if not user: raise Exception(u"Юзера с таким логином нет")
                if user["password"] != md5(password).hexdigest(): raise Exception(u"Пароль не тот :(")
                from random import randint
                hash = md5(str(randint(1, 9999))).hexdigest()
                self.connection.player.users.update({ "login": login }, { "$set": {
                    "hash": hash
                }})
                response.set_cookie("userhash", hash, max_age=3600000)
                response.set_cookie("userid", user["_id"], max_age=3600000)
            except Exception, e:
                c.message = e
                return render("/user/error.html")

            redirect("/")
        else:
            # show form
            return render("/user/login_form.html")

    def logout(self):
        response.set_cookie("userhash", "", max_age=0)
        response.set_cookie("userid", "", max_age=0)
        redirect("/")

    def faq(self):
        return render("/static/faq.html")

