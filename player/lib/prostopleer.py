#!/usr/bin/python
# -*- coding: utf-8 -*-

import urllib, urllib2
import re

class ProstoPleer(object):
    def __init__(self):
        pass

    def _parse(self, page):
        raw_playlist = ""
        try:
            raw_playlist = re.search('<ol id="search-results".*>(.*?)</ol>', page).group()
        except:
            print("Наебнулся пока пытался получить список песен")

        raw_soungs = []
        try:
            raw_soungs = re.findall("<li(.*?)>", raw_playlist)
        except:
            print("Наебнулся пока парсил инфу о песнях из списка")

        soungs = []
        for raw_soung in raw_soungs:
            if (raw_soung == ""):
                continue
            try:
                duration = re.search('duration="(.*?)"', raw_soung).group(1)
                file_id  = re.search('file_id="(.*?)"', raw_soung).group(1)
                singer   = re.search('singer="(.*?)"', raw_soung).group(1)
                song     = re.search('song="(.*?)"', raw_soung).group(1)
                link     = re.search('link="(.*?)"', raw_soung).group(1)
                rate     = re.search('rate="(.*?)"', raw_soung).group(1)
                size     = re.search('size="(.*?)"', raw_soung).group(1)

                soungs.append({ "duration": unicode(duration),
                                "file_id": unicode(file_id),
                                "singer": unicode(singer),
                                "song": unicode(song),
                                "link": unicode(link),
                                "rate": unicode(rate),
                                "size": unicode(size)
                              })
            except:
                print("Наебнулся пока парсил песенку: ")
                print(raw_soung)

        return soungs

    def search(self, query):
        url = "http://prostopleer.com/search?q=%s" % urllib.quote_plus(query)
        page = urllib2.urlopen(url).read()
        return self._parse(page)

    def top(self, city, radio):
        if ((city != "msk") and (city != "spb")): return []
        #if radio not in TOP[city].keys(): return []
        url = "http://prostopleer.com/top/%s/%s" % (city, radio)
        page = urllib2.urlopen(url).read()
        return self._parse(page)

    def getmp3(self, file_id):
        response = urllib2.urlopen("http://prostopleer.com/download/%s" % file_id)
        return response.geturl()