# -*- coding: utf-8 -*-
from player.lib.base import BaseController, render
from mongokit import ObjectId
from player.lib.prostopleer import ProstoPleer
from pylons import request
import simplejson as json

import time

TOP = {
  "msk": {
    "nrj": "NRJ",
    "relaxfm": "Relax FM",
    "rockfm": "Rock FM",
    "europeplus": "Европа Плюс",
  },

  "spb": {
    "dfm": "DFM",
    "loveradio": "Love Radio",
    "maximum": "Maximum",
    "nasheradio": "Наше Радио",
    "piterfm": "Питер FM",
    "radiorecord": "Рекорд",
  }
}

class RadioController(BaseController):
    def parse(self):
        self.connection.player.drop_collection('radio')
        pp = ProstoPleer()
        for city, radios in TOP.items():
            for radio_code, radio_name in radios.items():
                radio_top = []
                try:
                    for song in pp.top(city, radio_code):
                        radio_top.append({ "artist": song["singer"], "title": song["song"] })

                    radio = self.connection.player.radio.Radio()
                    radio["code"] = unicode(radio_code)
                    radio["tracks"] = radio_top
                    radio.save()
                    time.sleep(3)
                except:
                    continue

        return "OK"

    def get_list(self):
        radio_list = []
        for city, radios in TOP.items():
            for radio_code, radio_name in radios.items():
                radio_list.append({ "id": radio_code, "name": radio_name })
        return json.dumps({ "status": "OK", "radios": radio_list })

    def get_radio(self):
        code = request.params.get("id")
        if not code:
            return json.dumps({ "status": "NeOK", "message": "No radio ID" })

        radio = self.connection.player.radio.find_one({ "code": code })
        return json.dumps({ "status": "OK", "tracks": list(radio["tracks"]) })
        