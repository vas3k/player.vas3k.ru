function Playlist () {
    this.controls = null;
    this.tracks = 0;
    this.search = "";
    this.current = -1;
    this.shuffle = false;
    this.repeat_one = false;
    this.repeat_all = true;
    this.container = $("#playlist");
    this.list = $("#playlist ul");
    this.sidebar = $("#sideLeft");
    this.tracklist = [
        {"aid":"60830458", "owner_id":"6492", "artist":"Noname", "title":"Bosco", "duration":"195","url":"http:\/\/cs40.vkontakte.ru\/u06492\/audio\/2ce49d2b88.mp3"},
        {"aid":"59317035","owner_id":"6492","artist":"Mestre Barrao","title":"Sinhazinha", "duration":"234","url":"http:\/\/cs510.vkontakte.ru\/u2082836\/audio\/d100f76cb84e.mp3"},
    ];
};

Playlist.prototype.setControls = function (controls) {
    this.controls = controls;
};

Playlist.prototype.update = function () {
    html = "";
    this.tracklist.forEach(function (element, index, array) {
        html += '<li id="track' + element.aid +
                    '" class="track" data-artist="' + element.artist +
                    '" data-track="' + index +
                    '" data-id="' + element.aid +
                    '" data-title="' + element.title +
                    '" data-url="' + element.url + '"><input type="checkbox"> <img src="/images/icons/play.png" alt=">" class="playbutton"> <b> ' +
                    '<span onclick="player.controls.vk_search(\'' + element.artist + '\');">' + element.artist + '</span></b> ' +
                    '<span onclick="player.controls.vk_search(\'' + element.title + '\');">' + element.title + '</span> <span class="time">(' + timeFormat(element.duration * 1000) + ')</span> ' +
		            ' <img src="/images/icons/delete.png" alt="X" class="deletebutton"> <img src="/images/icons/love.png" alt="X" class="lovebutton"> <img src="/images/icons/repeat.png" alt="X" class="repeatbutton"></li>';
    });
    this.list.html(html);
    this.bind();
};

Playlist.prototype.bind =  function () {
    var playlist = this;
    $(".playbutton").click(function () {
        playlist.repeat_one = false;
        playlist.controls.stopCurrent();
        playlist.current = playlist.getNById($(this).parent().attr("data-id"));
        playlist.playTrack(playlist.current);
    });
    $(".deletebutton").click(function () {
        playlist.deltrack($(this).parent().attr("data-id"));
        $(this).parent().hide("fast");
    });
    $(".repeatbutton").click(function () {
        if (playlist.repeat_one) {
            playlist.repeat_one = false;
        } else {
            playlist.repeat_one = true;
        }
        $(this).toggleClass("activebutton");
    });
    $(".track input").click(function () {
        $(this).parent().toggleClass("selected");
    });
};

Playlist.prototype.playTrack = function (id) {
    id = parseInt(id) % this.tracklist.length;
    var aid = this.tracklist[id]["aid"];
    $(".track").removeClass("playing");
    $(".track[data-id=" + aid + "]").addClass("playing");
    this.controls.setCurrent(this.tracklist[id]);
    this.controls.playCurrent();
};

Playlist.prototype.playPrev =  function () {
    this.current = this.current - 1;
    this.playTrack(this.current);
};

Playlist.prototype.playNext =  function () {
    this.current = this.current + 1;
    this.playTrack(this.current);
};

Playlist.prototype.getById = function (id) {
    for (i = 0; i < this.tracklist.length; i++) {
        if (this.tracklist[i].aid == id) {
            return this.tracklist[i];
        }
    }
};

Playlist.prototype.getNById = function(id) {
    for (i = 0; i < this.tracklist.length; i++) {
        if (this.tracklist[i].aid == id) {
            return i;
        }
    }
};

Playlist.prototype.restruct = function () {
    var newarray = this.list.sortable('toArray');
    var newtracklist = [];
    for (var i = 0; i < newarray.length ; i++) {
        newtracklist.push(this.getById(newarray[i]));
    }
    this.tracklist = newtracklist;
};

Playlist.prototype.deltrack = function (aid) {
    var id = this.getNById(aid);
    this.tracklist.splice(id,1);
};

// Управление плейлистами

Playlist.prototype.refresh = function () {
    $.ajax({
        url: "/ajax/playlist/list",
        type: "POST",
        dataType: "json",
        success: function() {
            // add dsdss
            // whahahaha
        }
    });
};

Playlist.prototype.create = function (name) {
    var playlist = this;
    if (name != "") {
        $.ajax({
            url: "/ajax/playlist/new",
            data: ({ name: name }),
            type: "POST",
            dataType: "json",
            success: function() {
                playlist.refresh();
            }
        });
    }
};