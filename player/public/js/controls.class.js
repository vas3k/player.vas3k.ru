function Controls () {
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

Controls.prototype.initialize = function () {
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
            controls.pauseCurrent();
        } else {
            $(this).button("option", "icons", { primary: 'ui-icon-pause' });
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

    this.playlist.container.css("height", $("body").height() - 102);
    this.playlist.sidebar.css("height", $("body").height() - 95);
    $("#progress").css("width", $("body").width() - 500);

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
    controls.lastfm_scrobble();
    controls.tell_fsb();

    controls.current = soundManager.createSound({
        id: 'current',
        url: sound["url"],
        autoLoad: true,
        autoPlay: false,
        onconnect: function () {
            controls.volumebar.slider("option", "disabled", false);
            controls.prevbutton.button("option", "disabled", false);
            controls.playbutton.button("option", "disabled", false);
            controls.nextbutton.button("option", "disabled", false);
            controls.playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
            controls.smallinfo.show("fast");
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
        controls.playlist.error.html("Вы не залогинены вконтакте. От этого Павил Дуров опечален. Кнопочку можно найти в правом нижнем углу экрана.").fadeIn("slow").fadeOut(10000);
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
};

Controls.prototype.vk_get_by_id = function (id, type) {
    var controls = this;
    var id_str = id.join(",");
    VK.Api.call('audio.getById', { "audios": id_str }, function(r) {
        if(r.response) {
            controls.playlist.almost_tracklist = r.response;
            for (var i = 0; i < controls.playlist.almost_tracklist.length; i++) {
                controls.playlist.almost_tracklist[i]["artist"] = controls.pidoffka_filter(controls.playlist.almost_tracklist[i]["artist"]);
                controls.playlist.almost_tracklist[i]["title"] = controls.pidoffka_filter(controls.playlist.almost_tracklist[i]["title"]);
            }
            controls.playlist.update(controls.playlist.almost_tracklist, type);
        }
    });
    $("#playlist_search").hide();
};

Controls.prototype.clear_search = function () {
    $("#playlist_search").show();
    $("#sortable").html("");
};

Controls.prototype.lastfm_scrobble = function () {
    var controls = this;
    $.ajax({
        url: "/lastfm/scrobble",
        data: (controls.track),
        type: "POST",
        success: function (e) {
        }
    });
};

// Стучать в ФСБ
Controls.prototype.tell_fsb = function () {
    var controls = this;
    $.ajax({
        url: "/nowlistening",
        data: ({ id: controls.track["owner"] + "_" + controls.track["aid"]}),
        type: "POST",
        success: function (e) {
        }
    });   
};