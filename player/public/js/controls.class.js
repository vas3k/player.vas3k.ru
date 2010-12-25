function Controls (is_mobile) {
    this.is_mobile = is_mobile;
    this.playlist = null;
    this.is_playing = false;
    this.is_logged_in = false;
    this.current = null;
    this.volume = 100;

    this.track = {
        artist: "Unknown Artist",
        title: "Unknown Title"
    };

    this.windowtitle = $("title");

    this.volumebar = $("#vol_slider");
    this.bar = $("#progressbar");
    this.slider = $("#trackslider");

    this.titlelabel = $("#tracktitle");
    this.positionlabel = $("#trackposition");
    this.durationlabel = $("#trackduration");

    this.prevbutton = $("#button_prev button");
    this.playbutton = $("#button_play button");
    this.nextbutton = $("#button_next button");
    this.searchbutton = $("#qok");
    this.psearchbutton = $("#pok");
    this.smallinfo = $("#smallinfo");

    this.pidoffka = [ "•", "ღ", "|", "♪", "♫", "►", "★", "ι", "٩", "|̃̾", "•̃", "۶",
                      "♥", "●̮̮̃̾̃̾", "▼", "▲", "●", "➨", "Ѽ", "♥", "\\[", "\\]", "\\^", "mp3",
                      "!", "♡", "•", "°", "\\.", "♥", "\\*", "|", "vkontakte", "\\)\\)",
                      "☺", "∎", "\\<", "\\>", "✔" ];

};

Controls.prototype.setPlaylist = function (playlist) {
    this.playlist = playlist;
};

Controls.prototype.initialize = function (is_mobile) {
    var controls = this;
    var playlist = this.playlist;

    controls.prevbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-prev'
        }
    }).click(function () {
        controls.playlist.playPrev();
    });

    controls.nextbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-next'
        }
    }).click(function () {
        controls.playlist.playNext();
    });

    controls.playbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-play'
        }
    }).click(function () {
        if (controls.is_playing) {
            $(this).button("option", "icons", { primary: 'ui-icon-play' });
            controls.changeFavicon("favicon_pause.png");
            controls.pauseCurrent();
        } else {
            $(this).button("option", "icons", { primary: 'ui-icon-pause' });
            controls.changeFavicon("favicon_play.png");
            controls.playCurrent();
        }
    });

    this.searchbutton.button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click(function () {
        if ($("#q").val() != "") {
            controls.vk_search($("#q").val());
        }
    });

    this.psearchbutton.button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click(function () {
        if ($("#pq").val() != "") {
            controls.vk_search($("#pq").val());
        }
    });

    this.volumebar.slider({
        disabled: true,
        range: false,
        min: 0,
        max: 100,
        value: 100,
        slide: function (event, ui) {
            controls.volume = ui.value;
            controls.current.setVolume(ui.value);
            soundManager.setVolume(ui.value);
        }
    });

    this.bar.progressbar({
        value: 0
    });

    this.slider.slider({
        min: 0,
        max: 100,
        value: 0,
        slide: function (event, ui) {
            controls.setPosition(ui.value);
        }
    });

    this.playlist.list.sortable({
        placeholder: 'sort-placeholder',
        opacity: 0.8,
        stop: function(event, ui) {
            playlist.restruct();
        }
    });
    this.playlist.list.disableSelection();

    $("#q").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            controls.vk_search($(this).val());
        }
    });

    $("#pq").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            controls.vk_search($(this).val());
        }
    });

    $("#newplaylist input").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            playlist.create($(this).val());
        }
    });
};

Controls.prototype.setCurrent = function (sound) {
    var controls = this;
    controls.stopCurrent();
    controls.track = sound;
    controls.durationlabel.html(timeFormat(controls.track.duration * 1000));
    controls.slider.slider("option", "max", controls.track.duration * 100);
    controls.slider.slider("value", 0);
    controls.titlelabel.html("<b>" + controls.track.artist + "</b><br />" + controls.track.title);
    controls.windowtitle.html(controls.track.artist + " - " + controls.track.title + " - Playaaa Beta");
    controls.lastfm_scrobble(false);

    controls.volumebar.slider("option", "disabled", false);
    controls.prevbutton.button("option", "disabled", false);
    controls.playbutton.button("option", "disabled", false);
    controls.nextbutton.button("option", "disabled", false);
    controls.playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
    controls.smallinfo.show("fast");
    controls.changeFavicon("favicon_play.png");

    controls.current = soundManager.createSound({
        id: 'current',
        url: sound["url"],
        autoLoad: true,
        autoPlay: false,
        onconnect: function () {
            controls.lastfm_getinfo(controls.track);
        },
        onload: function() {
            controls.bar.removeClass("progressbar-ani");
            controls.bar.progressbar("value", 0);
            controls.smallinfo.hide("slow");
        },
        whileloading: function () {
            controls.smallinfo.html("загружено: " + parseInt(this.bytesLoaded / 1024) + " из " + parseInt(this.bytesTotal / 1024) + " кБ");
            controls.bar.progressbar("value", parseInt(this.bytesLoaded / this.bytesTotal * 100));
        },
        whileplaying: function () {
            controls.slider.slider("value", controls.current.position / 10);
            controls.positionlabel.html(timeFormat(controls.current.position));
        },
        onjustbeforefinish: function () {
            controls.lastfm_scrobble(true);  
        },
        onfinish: function () {
            controls.playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
            if (controls.playlist.repeat_one) {
                controls.playlist.playTrack(controls.playlist.current);
            } else {
                controls.playlist.playNext();
            }
        },
        volume: controls.volume
    });
};

Controls.prototype.setPosition = function (pos) {
    pos = parseInt(pos) * 10;
    this.current.setPosition(pos);
};

Controls.prototype.playCurrent = function () {
    soundManager.play('current');
    this.is_playing = true;
};

Controls.prototype.pauseCurrent = function () {
    soundManager.pause('current');
    this.is_playing = false;
};

Controls.prototype.stopCurrent = function () {
    this.pauseCurrent();
    soundManager.destroySound('current');
    this.bar.progressbar("option", "value", 0);
    this.playbutton.button("option", "icons", { primary: 'ui-icon-play' });
    this.durationlabel.html("(00:00)");
    this.positionlabel.html("00:00");
};

Controls.prototype.pidoffka_filter = function(text) {
    for (var i = 0; i < this.pidoffka.length; i++) {
        text = text.replace(new RegExp(this.pidoffka[i], 'g'), "");
        text = text.replace(new RegExp("(http://[^ ]*)", 'g'), "");
        text = text.replace(new RegExp("(id[^ ]*)", 'g'), "");
    }
    return text;
};

Controls.prototype.vk_search = function (query) {
    var controls = this;
    if (!controls.is_logged_in) {
        controls.playlist.error.html("Вы не залогинены вконтакте. От этого Павил Дуров опечален. Кнопочку можно найти в углу экрана.").fadeIn("slow").fadeOut(10000);
        return;
    }
    this.playlist.list.html("");
    this.playlist.bigsearch.hide();
    this.playlist.error.hide();
    this.playlist.loaders.big.show();
    query = query.replace(new RegExp("<",'g'), "").replace(new RegExp(">",'g'), "");
    VK.Api.call('audio.search', { "q": query, "count": 200 }, function(r) {
        if(r.response) {
            if (r.response[0] == "0") {
                controls.playlist.loaders.big.hide();
                controls.playlist.error.html("Поиск не дал результатов. Попробуйте другой запрос.").fadeIn("slow").fadeOut(10000);
                return false;
            }
            controls.playlist.tracklist = r.response.slice(1);
            for (var i = 0; i < controls.playlist.tracklist.length; i++) {
                controls.playlist.tracklist[i]["artist"] = controls.pidoffka_filter(controls.playlist.tracklist[i]["artist"]);
                controls.playlist.tracklist[i]["title"] = controls.pidoffka_filter(controls.playlist.tracklist[i]["title"]);
            }
            controls.playlist.update(controls.playlist.tracklist, "search");
        }
        controls.playlist.loaders.big.hide();
    });
    document.location.hash = "search:" + query.replace(new RegExp(" ", 'g'), "+");
    $("#q").val(query);
    $("#lastsearches").prepend('<li onclick="player.controls.vk_search(\'' + query + '\');">' + query + '</li>');
    $("#playlist_search").hide();
    if (this.is_mobile) {
        $("#menu").hide();
        $('#playlistlist').hide();
        $('#savedsearches').hide();
        $('#playlist').show();
    }
};

Controls.prototype.vk_get_by_id = function (id, type, play_now) {
    var controls = this;
    var id_str = typeof(id) == "string" ? id : id.join(",");
    VK.Api.call('audio.getById', { "audios": id_str }, function(r) {
        if (r.response) {
            controls.playlist.almost_tracklist = r.response;
            for (var i = 0; i < controls.playlist.almost_tracklist.length; i++) {
                controls.playlist.almost_tracklist[i]["artist"] = controls.pidoffka_filter(controls.playlist.almost_tracklist[i]["artist"]);
                controls.playlist.almost_tracklist[i]["title"] = controls.pidoffka_filter(controls.playlist.almost_tracklist[i]["title"]);
            }
            controls.playlist.update(controls.playlist.almost_tracklist, type);
            if (play_now) {
                controls.playlist.tracklist = controls.playlist.almost_tracklist;
                controls.playlist.current = 0;
                controls.playlist.playTrack(0);
            }
        }
    });
    $("#playlist_search").hide();
    if (this.is_mobile) {
        $("#menu").hide();
        $('#playlistlist').hide();
        $('#savedsearches').hide();
        $('#playlist').show();
    }
};

Controls.prototype.vk_getuserinfo = function (show) {
    var controls = this;
    VK.Api.call('audio.get', { "uid": player.vk_id, "need_user": 1 }, function(r) {
        controls.playlist.sidebarRight.find("#artist_title").html(r.response[0].name);
        controls.playlist.sidebarRight.find("#artist_url").html("");
        controls.playlist.sidebarRight.find("#artist_similar").html("");
        var usertracks = controls.playlist.sidebarRight.find("#artist_text");
        usertracks.html("<strong id='useraudio'>Мои аудиозаписи:</strong>");
        var ids = new Array();
        for (var i = 1; i < r.response.length; i++) {
            ids.push(r.response[i].owner_id + '_' + r.response[i].aid);
            usertracks.append('<div class="usertrack" onclick="window.open(\'/small#track:' + r.response[i].owner_id + '_' + r.response[i].aid  + '\', \'\', \'top=300, left=200, menubar=0, toolbar=0, location=0, directories=0, status=0, scrollbars=0, resizable=0, width=600, height=110\');">' + r.response[i].artist + " - " + r.response[i].title + '</div>');
        }
        $("#useraudio").click(function() {
            controls.playlist.userPlaylist(ids.join(","));
        });
        if (show) {
            setTimeout(function () {
                controls.playlist.userPlaylist(ids.join(","));
            }, 1000);
        }
        setTimeout(function () {
            VK.Api.call('getProfiles', { "uids": player.vk_id, "fields": "uid, first_name, last_name, nickname, sex, bdate, city, country, timezone, photo, photo_medium, photo_big, photo_rec" }, function(r) {
                controls.playlist.sidebarRight.find("#artist_img").html("<center><img src='" + r.response[0].photo_big + "' alt=''></center>");
            });
        }, 2000);
    });
};


Controls.prototype.clear_search = function () {
    $("#playlist_search").show();
    $("#sortable").html("");
};

Controls.prototype.lastfm_scrobble = function (o_rly) {
    var controls = this;
    var url = "/lastfm/nowplaying";
    if (o_rly) {
        url = "/lastfm/scrobble"
    }
    $.ajax({
        url: url,
        data: (controls.track),
        type: "POST",
        success: function (e) {
            //console.debug(e)
        }
    });
};

Controls.prototype.lastfm_getinfo = function (track) {
    var controls = this;
    $.ajax({
        url: "/lastfm/getartistinfo",
        data: ({
            track: JSON.stringify(track)
        }),
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                for (var key = 0; key < data["artist"]["similar"].length; key++) {
                    data["artist"]["similar"][key] = '<a href="#" onclick="player.controls.vk_search(\'' + data["artist"]["similar"][key] + '\');">' + data["artist"]["similar"][key] + "</a>";
                }
                controls.playlist.sidebarRight.find("#artist_title").html(data["artist"]["name"]);
                controls.playlist.sidebarRight.find("#artist_url").html("<a href='" + data["artist"]["url"] + "'>" + data["artist"]["url"] + "</a>");
                controls.playlist.sidebarRight.find("#artist_similar").html("<b>Похожие:</b> " + data["artist"]["similar"].join(", "));
                if (data["artist"]["image"][3]) {
                    controls.playlist.sidebarRight.find("#artist_img").html("<a href='" + data["artist"]["url"] + "'><img src='" + data["artist"]["image"][3] + "' alt='' /></a>");
                } else {
                    controls.playlist.sidebarRight.find("#artist_img").html("");
                }
                if (data["artist"]["bio"]) {
                    controls.playlist.sidebarRight.find("#artist_text").html("<b>Биография:</b><br/>" + data["artist"]["bio"]);
                } else {
                    controls.playlist.sidebarRight.find("#artist_text").html("");
                }
            } else {
                controls.vk_getuserinfo();              
            }
        },
        error: function() {
            controls.vk_getuserinfo();
        }
    });
};

Controls.prototype.changeFavicon = function(filename) {
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/images/' + filename;
    document.getElementsByTagName('head')[0].appendChild(link);
};