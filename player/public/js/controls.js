soundManager.url = '/swf/';
soundManager.debugMode = false;
soundManager.flashVersion = 9; // optional: shiny features (default = 8)
soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
// enable HTML5 audio support, if you're feeling adventurous.
soundManager.useHTML5Audio = true;
soundManager.useHighPerformance = true;

function timeFormat(milliseconds) {
    millisconds = parseInt(milliseconds)
    var minutes = parseInt(milliseconds / 1000 / 60);
    var seconds = parseInt(milliseconds / 1000 - minutes * 60);
    minutes = minutes.toString();
    seconds = seconds.toString();
    return minutes + ":" + seconds;
}

$(function () {
    var controls = {
        is_playing: false,
        current: null,
        volume: 100,

        track: {
            artist: "Unknown Artist",
            title: "Unknown Title"
        },
        
        volumebar: $("#vol_slider"),
        bar: $("#progressbar"),

        titlelabel: $("#tracktitle"),
        positionlabel: $("#trackposition"),
        durationlabel: $("#trackduration"),

        prevbutton: $("#button_prev button"),
        playbutton: $("#button_play button"),
        nextbutton: $("#button_next button")
    };

    soundManager.onready(function() {
        if (soundManager.supported()) {
            controls.playCurrent = function () {
                soundManager.play('current');
                controls.is_playing = true;
            };

            controls.setCurrent = function (filename) {
                controls.stopCurrent();
                if (controls.current) {
                    controls.current.unload();
                }
                controls.current = soundManager.createSound({
                    id: 'current',
                    url: filename,
                    autoLoad: true,
                    autoPlay: false,
                    onconnect: function () {
                        controls.bar.progressbar("option", "max", 10);
                        controls.bar.progressbar("option", "value", 10);
                        controls.bar.progressbar("option", "animated", true);
                    },
                    onload: function() {
                        controls.playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
                        controls.bar.progressbar("option", "disabled", false);
                        controls.bar.progressbar("option", "max", controls.current.duration);
                        controls.bar.progressbar("option", "animated", false);
                        controls.titlelabel.html(track.artist + " - " + track.title);
                        controls.durationlabel.html("(" + timeFormat(controls.current.duration) + ")");
                        controls.volumebar.slider("option", "disabled", false);
                        controls.prevbutton.button("option", "disabled", false);
                        controls.playbutton.button("option", "disabled", false);
                        controls.nextbutton.button("option", "disabled", false);

                    },
                    whileloading: function () {
                    },
                    whileplaying: function () {
                        controls.bar.progressbar("option", "value", controls.current.position / 30);
                        controls.positionlabel.html(timeFormat(controls.current.position));
                    },
                    onfinish: function () {
                        controls.playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
                        playlist.playNext();  
                    },
                    volume: controls.volume
                });
            };

            controls.setCurrentData = function (data) {
                track = data;
                controls.titlelabel.html(track.artist + " - " + track.title);
            };

            controls.pauseCurrent = function () {
                soundManager.pause('current');
                controls.is_playing = false;
            };

            controls.stopCurrent = function () {
                controls.pauseCurrent();
                controls.bar.progressbar("option", "value", 0);
                controls.playbutton.button("option", "icons", { primary: 'ui-icon-play' });
                controls.durationlabel.html("(0:0)");
                controls.positionlabel.html("0:0");

            };
        } else {
            alert("Unsupported :'(");
        }
    });



    /******* PLAYLIST ******/

    var tracklist = [
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
    ];
    
    var playlist = {
        tracks: 0,
        search: "",
        current: -1,
        shuffle: false,
        repeat: false,

        container: $("#playlist")
    };

    playlist.update = function () {
        html = "";
        tracklist.forEach(function (element, index, array) {
            html += '<div id="' + element.aid +
                        '" class="track" data-artist="' + element.artist +
                        '" data-track="' + index +
                        '" data-id="' + element.aid +
                        '" data-title="' + element.title +
                        '" data-url="' + element.url + '">' + element.artist + ' - ' + element.title + '</div>';
        });
        playlist.container.html(html);
    };

    playlist.playTrack = function (id) {
        id = parseInt(id) % tracklist.length;
        $(".track").removeClass("playing");
        $(".track[data-track=" + id + "]").addClass("playing");
        controls.setCurrent(tracklist[id]["url"]);
        controls.setCurrentData(tracklist[id]);
        controls.playCurrent();
    };

    playlist.playPrev = function () {
        playlist.current = playlist.current - 1;
        playlist.playTrack(playlist.current);
    };

    playlist.playNext = function () {
        playlist.current = playlist.current + 1;
        playlist.playTrack(playlist.current);
    };


    /********* CONTROLS ***********/

    playlist.update();

    controls.prevbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-prev'
        }
    }).click(function () {
        playlist.playPrev();
    });

    controls.nextbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-next'
        }
    }).click(function () {
        playlist.playNext();
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

    controls.volumebar.slider({
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

    controls.bar.progressbar({
        disabled: true,
        min: 0,
        max: 10,
        value: 0
    });

    $(".track").click(function () {
        controls.stopCurrent();
        playlist.current = parseInt($(this).attr("data-track"));
        playlist.playTrack(playlist.current);
    });

    playlist.container.css("height", $("body").height() - 130);



    /******* VKONTAKTE *******/
    VK.init({
        apiId: "1934554",
        nameTransportPath: "http://p.thedevel.ru/js/xd_receiver.html"
    });

    $("#q").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            VK.Api.call('audio.search', { "q": $(this).val() }, function(r) {
                if(r.response) {
                    tracklist = r.response;
                    playlist.update();

                    // FIXME: Event dont work
                }
            });
        }
    });
});
