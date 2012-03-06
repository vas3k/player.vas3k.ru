function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

function debug(msg) {
    //console.debug(msg);
}

function timeFormat (milliseconds) {
    milliseconds = parseInt(milliseconds);
    var minutes = parseInt(milliseconds / 1000 / 60);
    var seconds = parseInt(milliseconds / 1000 - minutes * 60);
    var timestr = "";
    timestr += (minutes < 10) ? "0" : "";
    timestr += minutes;
    timestr += ":";
    timestr += (seconds < 10) ? "0" : "";
    timestr += seconds;
    return timestr;
}

$(function () {
    VK.UI.button('login_vk');
    var track;
    var is_playing = true;

    soundManager.url = '/swf/';
    soundManager.debugMode = false;
    soundManager.flashVersion = 9; // optional: shiny features (default = 8)
    soundManager.useFlashBlock = true; // optionally, enable when you're ready to dive in
    soundManager.useHTML5Audio = true; // enable HTML5 audio support, if you're feeling adventurous.
    soundManager.useHighPerformance = true;

    $("#button_play button").button({
        disabled: false,
        text: false,
        icons: {
            primary: 'ui-icon-pause'
        }
    }).click(function () {
        if (!is_playing) {
            soundManager.play('current');
            is_playing = true;
            $(this).button("option", "icons", { primary: 'ui-icon-pause' });
        } else {
            soundManager.pause('current');
            is_playing = false;
            $(this).button("option", "icons", { primary: 'ui-icon-play' });
        }
    });

    $("#progressbar").progressbar({
        value: 0
    });

    $("#vol_slider").slider({
        disabled: false,
        range: false,
        min: 0,
        max: 100,
        value: window.localStorage["volume"] || 100,
        slide: function (event, ui) {
            track.setVolume(ui.value);
        }
    });

    $("#trackslider").slider({
        min: 0,
        max: 100,
        value: 0,
        slide: function (event, ui) {
            var position = parseInt(ui.value) * 10;
            track.setPosition(position);
        }
    });

    $("#love_one").bind("click", function() {
        var track_aid = $("#track_aid").html();
        var track_owner = $("#track_owner").html();
        $.ajax({
            url: "/ajax/love/add",
            type: "POST",
            data: ({
                tracks: JSON.stringify([track_owner + "_" + track_aid])
            }),
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {}
            }
        });
    });

    function playTrack(tracks) {
        $("#track_aid").html(tracks[0].aid);
        $("#track_owner").html(tracks[0].owner_id);

        $("#trackduration").html(timeFormat(tracks[0].duration * 1000));
        $("#trackslider").slider("option", "max", parseInt(tracks[0].duration * 100));
        $("#tracktitle").html("<b>" + tracks[0].artist + "</b><br />" + tracks[0].title);
        $("title").html(tracks[0].artist + " - " + tracks[0].title);

        soundManager.onready(function() {
            if (!soundManager.supported()) {
                $("#dialog-unsupported").show();
            }

            track = soundManager.createSound({
                id: 'current',
                url: tracks[0].url,
                autoLoad: true,
                autoPlay: true,
                volume: window.localStorage["volume"] || 100,
                onconnect: function () {
                },
                onload: function() {
                    $("#progressbar").removeClass("progressbar-ani");
                    $("#progressbar").progressbar("value", 0);
                    $("#smallinfo").fadeOut("slow");
                },
                whileloading: function () {
                    $("#smallinfo").html("загружено: " + parseInt(this.bytesLoaded / 1024) + " из " + parseInt(this.bytesTotal / 1024) + " кБ");
                    $("#progressbar").progressbar("value", parseInt(this.bytesLoaded / this.bytesTotal * 100));
                },
                whileplaying: function () {
                    $("#trackslider").slider("value", track.position / 10);
                    $("#trackposition").html(timeFormat(track.position));
                },
                onjustbeforefinish: function () {
                },
                onfinish: function () {
                    is_playing = false;
                    $("#button_play button").button("option", "icons", { primary: 'ui-icon-play' });
                    $("#trackslider").slider("value", 0);
                    $("#trackposition").html("00:00");
                    track.setPosition(0);
                    soundManager.stop('current');
                }
            });
        });
    }

    var vk_id = document.location.hash.replace("#track:", "");
    var access_token = $("#access_token").html();
    $.ajax({
        url: "https://api.vkontakte.ru/method/audio.getById?audios="+vk_id+"&access_token="+access_token+"&callback=callbackFunc",
        dataType: 'jsonp',
        success: function(r) {
            playTrack(r.response);
        },
        error: function() {
            alert("Все сломалось :(");
        }
    });
    $("#urlcode").val('<a href="' + document.location.href + '" onclick="javascript:window.open(\'' + document.location.href + '\', \'player.vas3k.ru\', \'top=300,left=200,menubar=0,toolbar=0,location=0,directories=0,status=0,scrollbars=0,resizable=0,width=600,height=110\');return false;">[ссылка]</a>');
});