function Controls () {
    this.playlist = null;
    this.is_playing = false;
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
    this.smallinfo = $("#smallinfo");

    this.pidoffka = [ "•", "ღ", "|", "♪", "♫", "►", "★", "ι", "٩", "|̃̾", "•̃", "۶",
                      "♥", "●̮̮̃̾̃̾", "▼", "▲", "●", "➨", "Ѽ", "♥", "[", "]", "^" ];

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
    $("#progress").css("width", $("body").width() - 540);

    $("#q").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            controls.vk_search($(this).val());
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
    controls.windowtitle.html(controls.track.artist + " - " + controls.track.title + " - Playaaa");
    controls.lastfm_scrobble();

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
        text = text.replace(this.pidoffka[i], "");
    }
    return text;
};

Controls.prototype.vk_search = function (query) {
    var controls = this;
    VK.Api.call('audio.search', { "q": query, "count": 200 }, function(r) {
        if(r.response) {
            controls.playlist.tracklist = r.response.slice(1);
            for (var i = 0; i < controls.playlist.tracklist.length; i++) {
                controls.playlist.tracklist[i]["artist"] = controls.pidoffka_filter(controls.playlist.tracklist[i]["artist"]);
                controls.playlist.tracklist[i]["title"] = controls.pidoffka_filter(controls.playlist.tracklist[i]["title"]);
            }
            controls.playlist.update(controls.playlist.tracklist);
        }
    });
    document.location.hash = "search:" + query.replace(" ", "+");
    $("#q").val(query);
    $("#lastsearches").prepend('<li onclick="player.controls.vk_search(\'' + query + '\');">' + query + '</li>');
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