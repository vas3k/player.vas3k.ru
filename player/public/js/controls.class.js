function Controls (player) {
    this.player = player;

    this.is_mobile = false;
    this.is_playing = false;
    this.is_logged_in = false;
    this.current = null;
    this.next = null;
    this.volume = 100;

    this.track = {
        artist: "Unknown Artist",
        title: "Unknown Title"
    };

    this.windowtitle = $("title");

    this.ui_volumebar = $("#vol_slider");
    this.ui_bar = $("#progressbar");
    this.ui_slider = $("#trackslider");

    this.ui_titlelabel = $("#tracktitle");
    this.ui_positionlabel = $("#trackposition");
    this.ui_durationlabel = $("#trackduration");

    this.ui_prevbutton = $("#button_prev button");
    this.ui_playbutton = $("#button_play button");
    this.ui_nextbutton = $("#button_next button");
    this.ui_shuffle_button = $("#button_shuffle button");
    this.ui_repeat_button = $("#button_repeat button");
    this.ui_repeat_status = $("#repeat_status");
    this.ui_searchbutton = $("#qok");
    this.ui_psearchbutton = $("#pok");
    this.ui_smallinfo = $("#smallinfo");

    this.initialize();
};

Controls.prototype.initialize = function () {
    var player = this.player;

     this.ui_prevbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-prev'
        }
    }).click(function () {
         player.playlist.playPrev();
    });

     this.ui_nextbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-next'
        }
    }).click(function () {
         player.playlist.playNext();
    });

     this.ui_playbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-play'
        }
    }).click(function () {
        if ( player.controls.is_playing) {
            $(this).button("option", "icons", { primary: 'ui-icon-play' });
             player.changeFavicon("favicon_pause.png");
             player.controls.pauseCurrent();
        } else {
            $(this).button("option", "icons", { primary: 'ui-icon-pause' });
             player.changeFavicon("favicon_play.png");
             player.controls.playCurrent();
        }
    });

    this.ui_searchbutton.button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click(function () {
        if ($("#q").val() != "") {
             player.vk_api.search($("#q").val());
        }
    });

    this.ui_psearchbutton.button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click(function () {
        if ($("#pq").val() != "") {
             player.vk_api.search($("#pq").val());
        }
    });

    this.ui_shuffle_button.button({
        text: false,
        icons: {
            primary: 'ui-icon-shuffle'
        }
    }).click(function () {
        player.playlist.toggleShuffle();
    });

    this.ui_repeat_button.button({
        text: false,
        icons: {
            primary: 'ui-icon-refresh'
        }
    }).click(function () {
        player.playlist.toggleRepeat();
    });

    this.ui_volumebar.slider({
        disabled: true,
        range: false,
        min: 0,
        max: 100,
        value: 100,
        slide: function (event, ui) {
             player.controls.volume = ui.value;
             player.controls.current.setVolume(ui.value);
            soundManager.setVolume(ui.value);
        }
    });

    this.ui_bar.progressbar({
        value: 0
    });

    this.ui_slider.slider({
        min: 0,
        max: 100,
        value: 0,
        slide: function (event, ui) {
             player.controls.setPosition(ui.value);
        }
    });

    $("#q").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
             player.vk_api.search($(this).val());
        }
    });

    $("#pq").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
             player.vk_api.search($(this).val());
        }
    });

    $("#newplaylist input").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            player.playlist.create($(this).val());
        }
    });
};

Controls.prototype.setCurrent = function (sound) {
    var player = this.player;
    var controls = this;
    controls.stopCurrent();
    controls.track = sound;
    controls.ui_durationlabel.html(timeFormat(controls.track.duration * 1000));
    controls.ui_slider.slider("option", "max", controls.track.duration * 100);
    controls.ui_slider.slider("value", 0);
    controls.ui_titlelabel.html("<b>" + controls.track.artist + "</b><br />" + controls.track.title);
    controls.windowtitle.html(controls.track.artist + " - " + controls.track.title + " - Playaaa Beta");
    player.lastfm_api.scrobble(false);

    controls.ui_volumebar.slider("option", "disabled", false);
    controls.ui_prevbutton.button("option", "disabled", false);
    controls.ui_playbutton.button("option", "disabled", false);
    controls.ui_nextbutton.button("option", "disabled", false);
    controls.ui_playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
    controls.ui_smallinfo.show("fast");
    player.changeFavicon("favicon_play.png");

    //soundManager.destroySound('next');
    //soundManager.destroySound('current');
    controls.current = soundManager.createSound({
        id: 'current',
        url: sound["url"],
        autoLoad: true,
        autoPlay: false,
        onconnect: function () {
            player.lastfm_api.getArtistInfo(controls.track);
        },
        onload: function() {
            controls.ui_bar.removeClass("progressbar-ani");
            controls.ui_bar.progressbar("value", 0);
            controls.ui_smallinfo.hide("slow");
        },
        whileloading: function () {
            controls.ui_smallinfo.html("загружено: " + parseInt(this.bytesLoaded / 1024) + " из " + parseInt(this.bytesTotal / 1024) + " кБ");
            controls.ui_bar.progressbar("value", parseInt(this.bytesLoaded / this.bytesTotal * 100));
        },
        whileplaying: function () {
            controls.ui_slider.slider("value", controls.current.position / 10);
            controls.ui_positionlabel.html(timeFormat(controls.current.position));
        },
        onjustbeforefinish: function () {
            player.lastfm_api.scrobble(true);
        },
        onfinish: function () {
            controls.ui_playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
            if (player.playlist.repeat_one) {
                player.playlist.playTrack(player.playlist.current);
            } else {
                player.playlist.playNext();
            }
        },
        volume: controls.volume
    });

    /*controls.next = soundManager.createSound({
        id: 'next',
        url: player.playlist.tracklist[(player.playlist.current + 1)  % player.playlist.tracklist.length]["url"],
        autoLoad: true,
        autoPlay: false,
        onconnect: function () {
            console.debug("NEXT: " + this.url);
        }
    });*/
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
    this.ui_bar.progressbar("option", "value", 0);
    this.ui_playbutton.button("option", "icons", { primary: 'ui-icon-play' });
    this.ui_durationlabel.html("(00:00)");
    this.ui_positionlabel.html("00:00");
};


Controls.prototype.clear_search = function () {
    $("#playlist_search").show();
    $("#sortable").html("");
};