# -*- encoding: utf-8 -*-
import time
from django.http import HttpResponse
from annoying.decorators import ajax_request
from libs.prostopleer import ProstoPleer
from radio.models import Radio, RadioTracks


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


def update_stations(request):
    Radio.objects.all().delete()
    for city, radios in TOP.items():
        for radio_code, radio_name in radios.items():
            Radio.objects.get_or_create(city=city, code=radio_code, name=radio_name)


def update(request):
    RadioTracks.objects.all().delete()

    pp = ProstoPleer()
    radios = Radio.objects.all()
    for radio in radios:
        try:
            for song in pp.top(radio.city, radio.code):
                track = RadioTracks.objects.create(radio=radio, track_artist=song["singer"], track_title=song["song"])
                track.save()
            time.sleep(2)
        except:
            continue

    return HttpResponse("OK")


@ajax_request
def get_radio(request):
    code = request.GET.get("id")
    if not code:
        return {"status": "NeOK", "message": u"Не указан код радио"}
    track_objects = RadioTracks.objects.filter(radio__code=code).order_by("id")
    tracks = [t.for_json() for t in track_objects]
    return {"status": "OK", "tracks": tracks}


@ajax_request
def get_list(request):
    radio_objects = Radio.objects.all()
    radios = [r.for_json() for r in radio_objects]
    return {"status": "OK", "radios": radios}
