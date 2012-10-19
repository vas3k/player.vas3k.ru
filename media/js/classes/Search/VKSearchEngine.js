function VKSearchEngine(controller, activateCallback) {
    AbstractSearchEngine.call(this); // copy methods
    this.controller = controller;
    this.now_offset = 0;
    this.id = 0;
    this.is_activated = false;
    this.access_token = $("#access_token").html();

    VK.init({
        apiId: 1934554,
        nameTransportPath: "http://player.vas3k.ru/js/xd_receiver.html"
    });

    var _this = this;
    VK.Auth.getLoginStatus(function (r) {
        if (r.session) {
            _this.is_activated = true;
            _this.id = r.session["mid"];
        } else {
            _this.is_activated = false;
            _this.id = 0;
        }
        if (activateCallback) activateCallback(_this);
    });
}

extend(VKSearchEngine, AbstractSearchEngine);

VKSearchEngine.prototype.activate = function() {
    // Если требуется какая-то авторизация для использования
    // поиска, то она делается тут
    var _this = this;
    VK.Auth.login(function () {
            _this.is_activated = true;
            location.reload();
        }, VK.access.FRIENDS | VK.access.AUDIO
    );
    return true;
};

VKSearchEngine.prototype.sendBadToken = function() {
    var _this = this;
    $.ajax({
        url: "/ajax/report_bad_token/",
        type: "POST",
        data: { "token": _this.access_token },
        dataType: "json",
        success: function(data) {
            if (data.new_token) {
                _this.access_token = data.new_token;
            }
        },
        error: function () {}
    });
};

VKSearchEngine.prototype.filter = function(track) {
    // Применить фильтры к переданному треку и вернуть
    for (var i = 0; i < this.pidoffka.length; i++) {
        track.artist = track.artist.replace(new RegExp(this.pidoffka[i], 'g'), "");
        track.title = track.title.replace(new RegExp(this.pidoffka[i], 'g'), "");
    }
    
    track.artist = track.artist.replace(new RegExp("(http://[^ ]+)", 'g'), "");
    track.title = track.title.replace(new RegExp("(http://[^ ]+)", 'g'), "");

    track.artist = track.artist.replace(new RegExp("(id[0-9]+)", 'g'), "");
    track.title = track.title.replace(new RegExp("(id[0-9]+)", 'g'), "");

    track.artist = track.artist.replace(new RegExp("&#39;", 'g'), "'");
    track.title = track.title.replace(new RegExp("&#39;", 'g'), "'");

    track.artist = track.artist.trim().substring(0, 70);
    track.title = track.title.trim().substring(0, 100);
    
    return track;
};

VKSearchEngine.prototype.getTrackFromResponse = function(r) {
    var track = new Track();
    track.owner_id = r.owner_id;
    track.aid = r.aid;
    track.id = track.owner_id + '_' + track.aid;
    track.url = r.url;
    track.artist = r.artist;
    track.title = r.title;
    track.lyrics_id = r.lyrics_id;
    track.duration_ms = r.duration;
    track.duration = timeFormat(r.duration * 1000);
    track = this.filter(track);
    return track;
};

VKSearchEngine.prototype.search = function(query, offset, count, successCallback) {
    // Вернуть список треков - результат поиска
    var results = [];
    var _this = this;
    offset = offset || 0;
    count = count || 200;
    query = query.replace(new RegExp("<",'g'), "").replace(new RegExp(">",'g'), "");

    $.ajax({
        url: "https://api.vkontakte.ru/method/audio.search?q="+query+"&offset="+offset+"&count="+count+"&access_token="+this.access_token+"&callback=callbackFunc",
        dataType: 'jsonp',
        success: function(r) {
            if (r.error && r.error.error_code == 5) _this.sendBadToken();
            for (var i = 1; i < r.response.length; i++) {
                results.push(_this.getTrackFromResponse(r.response[i]));
            }
            if (successCallback) successCallback(results);
        },
        error: function() {
            alert("Все сломалось :(");
        }
    });
    return true;
};

VKSearchEngine.prototype.searchByIds = function(ids, successCallback) {
    // Возвращает список треков по списку ID в поисковой системе

    var results = [];
    var _this = this;
    var id_str = typeof(ids) == "string" ? ids : ids.join(",");

    $.ajax({
        url: "https://api.vkontakte.ru/method/audio.getById?audios="+id_str+"&access_token="+this.access_token+"&callback=callbackFunc",
        dataType: 'jsonp',
        success: function(r) {
            if (r.error && r.error.error_code == 5) _this.sendBadToken();
            for (var i = 0; i < r.response.length; i++) {
                results.push(_this.getTrackFromResponse(r.response[i]));
            }
            if (successCallback) successCallback(results);
        },
        error: function() {
            alert("Все сломалось :(");
        }
    });
    return true;
};

VKSearchEngine.prototype.searchByUser = function(user_id, successCallback) {
    if (!this.is_activated) return false;
    user_id = user_id || this.id;
    var results = [];
    var _this = this;

    VK.Api.call('audio.get', { "uid": user_id, "need_user": 1 }, function(r) {
        if (r.response) {
            if (r.error && r.error.error_code == 5) _this.sendBadToken();
            for (var i = 1; i < r.response.length; i++) {
                results.push(_this.getTrackFromResponse(r.response[i]));
            }

            if (successCallback) successCallback(results);
        }
    });

    return true;
};

VKSearchEngine.prototype.searchOneGoodTrack = function(artist, title, successCallback) {
    var query = artist + " " + title;
    var _this = this;
    $.ajax({
        url: "https://api.vkontakte.ru/method/audio.search?q="+query+"&count=40&auto_complete=1&access_token="+this.access_token+"&callback=callbackFunc",
        dataType: 'jsonp',
        success: function(r) {
            if (r.error && r.error.error_code == 5) _this.sendBadToken();
            if (r.response[0] == "0") return;
            var goodtrack =- 1;
            for (var i = 1; i < r.response.length; i++) {
                if ( r.response[i].artist.toLowerCase() == artist &&
                     r.response[i].title.toLowerCase() == title ){
                    goodtrack = i;
                    break;
                }
                if ((r.response[i].artist.toLowerCase().indexOf(artist) + 1) &&
                    (r.response[i].title.toLowerCase().indexOf(title) + 1)) {
                    goodtrack = i;
                }
            }
            if (goodtrack > -1 && successCallback) {
                successCallback(_this.getTrackFromResponse(r.response[goodtrack]));
            }
        },
        error: function() {
            console.debug("Превышен интервал запросов. ВОТ ЭТО ПОВОРОТ!");
        }
    });
};

VKSearchEngine.prototype.getLyrics = function(lyrics_id, successCallback) {
    var _this = this;
    $.ajax({
        url: "https://api.vkontakte.ru/method/audio.getLyrics?lyrics_id="+lyrics_id+"&access_token="+this.access_token+"&callback=callbackFunc",
        dataType: 'jsonp',
        success: function(r) {
            if (r.error && r.error.error_code == 5) _this.sendBadToken();
            successCallback(r.response.text);
        },
        error: function() {
            alert("Все сломалось :(");
        }
    });
};

VKSearchEngine.prototype.loadUserInfo = function(successCallback) {
    var _this = this;
    VK.Api.call('getProfiles', { "uids": _this.id, "fields": "uid, first_name, last_name, nickname, sex, bdate, city, country, timezone, photo, photo_medium, photo_big, photo_rec" }, function(r) {
        if (r.response) {
            if (successCallback) successCallback(r.response[0]);
        }
    });
};