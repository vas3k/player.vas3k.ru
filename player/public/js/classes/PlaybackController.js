function PlaybackController(player) {
    this.player = player;
    this.current_stream = "";
    this.current_track = undefined;
    this.current = undefined;
    this.is_playing = false;
    this.volume = this.player.storage["volume"] || 100;
    this.repeat_state = this.player.storage["repeat"] || 0; // 0 - repeat all, 1 - repeat one, 2 - no repeat
}

PlaybackController.prototype.playTrack = function(track) {
    this.current_track = track;
    gui.activateControls(track);
    gui.list_gui.highlightTrackById(track.id);

    if (this.is_playing) {
        this.pause();
    }

    this.is_playing = true;
    this.current_stream = track.url;

    var _this = this;
    soundManager.destroySound("current");
    this.current = soundManager.createSound({
        id: 'current',
        url: _this.current_stream,
        autoLoad: true,
        autoPlay: true,
        volume: _this.volume,
        onconnect: function () {
            _this.player.fireEvent("TrackPlay");
            gui.ui_playbutton.button("option", "icons", { primary: 'ui-icon-pause' }); //TODO: FIXME: не красиво так делать
        },
        onload: function() {
            gui.ui_bar.removeClass("progressbar-ani");
            gui.ui_bar.progressbar("value", 0);
            gui.ui_smallinfo.fadeOut("slow");

            // Время скробблинга (либо половина, либо 320 секунд)
            this.scrobble_time = Math.min(this.duration / 2, 320000);
        },
        whileloading: function () {
            gui.ui_smallinfo.html("загружено: " + parseInt(this.bytesLoaded / 1024) + " из " + parseInt(this.bytesTotal / 1024) + " кБ");
            gui.ui_bar.progressbar("value", parseInt(this.bytesLoaded / this.bytesTotal * 100));
        },
        whileplaying: function () {
            gui.ui_slider.slider("value", _this.current.position / 10);
            gui.ui_positionlabel.html(timeFormat(_this.current.position));
        },
        onjustbeforefinish: function () {
            _this.player.fireEvent("TrackJustBeforeFinish");              
        },
        onfinish: function () {
            _this.playNextTrack();
        }
    });
};

PlaybackController.prototype.play = function() {
    // Играем текущий установленный трек
    // Установить можно через setCurrent
    if (this.current) {
        gui.ui_playbutton.button("option", "icons", { primary: 'ui-icon-pause' }); //TODO: FIXME: не красиво так делать
        this.is_playing = true;
        soundManager.play('current');
        this.player.fireEvent("TrackPlay");
    }
};

PlaybackController.prototype.pause = function() {
    // Приостановка текущего трека
    if (this.current && this.is_playing) {
        soundManager.pause('current');
        gui.pauseControls();
        this.is_playing = false;
        this.player.fireEvent("TrackPause");
    }
};

PlaybackController.prototype.playPreviousTrack = function() {
    // Получить предыдущий трек текущего списка и начать играть
    this.pause();
    var track = this.player.listController.getPreviousTrack();
    if (!track) {
        // TODO: тут можно возвращать последний
        track = this.player.listController.getFirstTrack();
    }
    this.playTrack(track);
    this.player.fireEvent("PreviousTrackPlay");
};

PlaybackController.prototype.playNextTrack = function() {
    // Получить следующий трек текущего списка и начать играть
    this.pause();
    switch (parseInt(this.repeat_state)) {
        case 0:
            // next track or first
            var track = this.player.listController.getNextTrack();
            if (!track) {
                track = this.player.listController.getFirstTrack();
            }
            this.playTrack(track);
            break;
        case 1:
            // repeat one
            this.playTrack(this.current_track);
            break;
        case 2:
            // next track or stop
            var track = this.player.listController.getNextTrack();
            if (track) {
                this.playTrack(track);
            }
            break;
    }
    this.player.fireEvent("NextTrackPlay");
};

PlaybackController.prototype.setCurrent = function(new_stream, and_play) {
    alert("Это баг с кодовым названием ДВЕРЬ МНЕ СДЕЛАЛ БЛЯТЬ. Если вы видите это, сообщите мне. Например на me@vas3k.ru или в твиттер @player_vas3k_ru.");
};

PlaybackController.prototype.seekPosition = function(position) {
    position = parseInt(position) * 10;
    this.current.setPosition(position);
};

PlaybackController.prototype.seekVolume = function(volume) {
    this.volume = volume;
    if (this.current) this.current.setVolume(this.volume);
    this.player.storage["volume"] = this.volume;
};

PlaybackController.prototype.toggleRepeat = function() {
    this.repeat_state = (this.repeat_state + 1) % 3;
    this.player.storage["repeat"] = this.repeat_state;
    return this.repeat_state;
};

PlaybackController.prototype.shuffle = function() {
    this.player.listController.shuffle();
};