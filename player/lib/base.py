# -*- coding: utf-8 -*-
"""The base Controller API

Provides the BaseController class for subclassing.
"""
from pylons.controllers import WSGIController
from pylons.templating import render_jinja2 as render
from pylons import config, tmpl_context as c, response, request
from pylons.controllers.util import redirect

from hashlib import md5

class BaseController(WSGIController):
    connection = config['pylons.app_globals'].connection

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        self.userid = request.cookies.get("userid", "")
        self.userhash = request.cookies.get("userhash", "")
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        return WSGIController.__call__(self, environ, start_response)
