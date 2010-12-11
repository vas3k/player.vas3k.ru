function Playlist (is_mobile) {
    this.is_mobile = is_mobile;
    this.controls = null;
    this.tracks = 0;
    this.search = "";
    this.current = -1;
    this.shuffle = false;
    this.repeat_one = false;
    this.repeat_all = true;
    this.container = $("#playlist");
    this.list = $("#playlist ul");
    this.error = $("#playlist_error");
    this.smallerror = $("#small_error");
    this.smallok = $("#small_ok");
    this.bigsearch = $("#playlist_search");
    this.sidebar = $("#sideLeft");
    this.sidebarRight = $("#sideRight");

    this.loaders = {};
    this.loaders.search = $("#search_loader");
    this.loaders.playlist = $("#playlist_loader");
    this.loaders.smart = $("#smart_loader");
    this.loaders.big = $("#big_loader");

    this.tracklist = [
    ];
    this.almost_tracklist = [];
};

Playlist.prototype.setControls = function (controls) {
    this.controls = controls;
};

Playlist.prototype.update = function (trackslist, type) {
    var playlist = this;
    html = "";
    trackslist.forEach(function (element, index, array) {
        if (!playlist.is_mobile) {
            html += '<li id="' + element.owner_id + "_" + element.aid +
                        '" class="track" data-artist="' + element.artist +
                        '" data-track="' + index +
                        '" data-type="' + type +
                        '" data-id="' + element.aid +
                        '" data-owner="' + element.owner_id +
                        '" data-title="' + element.title +
                        '" data-url="' + element.url + '"><input type="checkbox"> <img src="/images/icons/play.png" alt=">" class="playbutton"> <b>' +
                        ' <span onclick="player.controls.vk_search(\'' + element.artist + '\');">' + element.artist + '</span></b>' +
                        ' <span onclick="player.controls.vk_search(\'' + element.title + '\');">' + element.title + '</span>' +
                        ' <span class="time">(' + timeFormat(element.duration * 1000) + ')</span>' +
                        ' <img src="/images/icons/delete.png" alt="X" class="deletebutton">' +
                        ' <img src="/images/icons/love.png" alt="X" class="lovebutton">' +
                        ' <img src="/images/icons/link.png" alt="X" class="linkbutton">' +
                        ' <img src="/images/icons/repeat.png" alt="X" class="repeatbutton"></li>';
        } else {
            html += '<li id="' + element.owner_id + "_" + element.aid +
                        '" class="track" data-artist="' + element.artist +
                        '" data-track="' + index +
                        '" data-type="' + type +
                        '" data-id="' + element.aid +
                        '" data-owner="' + element.owner_id +
                        '" data-title="' + element.title +
                        '" data-url="' + element.url + '">' +
                        '<div class="pl_check"><input type="checkbox" /></div>' +
                        '<div class="playbutton">' + element.title + '<br /><small>' + element.artist + '</small></div>' +
                        '<div class="pl_buttons">' +
                        '</div>' +
                        '<div class="pl_duration">' + timeFormat(element.duration * 1000) + '</div>' +
                    '</li>';
        }
    });
    this.list.html(html);
    this.bind();
    if (type == "playlist") {
        this.bind_playlist();
    } else if (type == "love") {
        this.bind_love();
    }
};

Playlist.prototype.bind =  function () {
    var playlist = this;
    $(".playbutton").click(function () {
        playlist.repeat_one = false;
        playlist.controls.stopCurrent();
        if (($(this).parent().attr("data-type") == "playlist") || ($(this).parent().attr("data-type") == "love")) {
            playlist.tracklist = playlist.almost_tracklist;
        }
        playlist.current = playlist.getNById($(this).parent().attr("data-id"));
        playlist.playTrack(playlist.current);
    });

    $(".linkbutton").click(function () {
        window.open("/small#track:" + $(this).parent().attr("id"),
                    $(this).parent().attr("data-artist") + " " + $(this).parent().attr("data-title"),
                    'top=300, left=200, menubar=0, toolbar=0, location=0, ' +
                    'directories=0, status=0, scrollbars=0, resizable=0, width=600, height=110');
    });


    $(".deletebutton").click(function () {
        playlist.deltrack($(this).parent().attr("data-id"));
        $(this).parent().hide("fast");
    });

    $(".lovebutton").click(function () {
        playlist.love($(this).parent().attr("data-id"), $(this).parent().attr("data-owner"));
    });

    $(".repeatbutton").click(function () {
        playlist.repeat_one = playlist.repeat_one ? false : true;
        $(this).toggleClass("activebutton");
    });

    $(".track input").click(function () {
        $(this).parent().toggleClass("selected");
    });
};

Playlist.prototype.bind_playlist = function () {
    var playlist = this;
    $(".deletebutton").click(function () {
        playlist.remove_from($(this).parent().attr("data-owner") + "_" + $(this).parent().attr("data-id"));
        playlist.deltrack($(this).parent().attr("data-id"));
        $(this).parent().hide("fast");
    });    
};

Playlist.prototype.bind_love = function () {
    var playlist = this;
    $(".deletebutton").click(function () {
        playlist.unlove($(this).parent().attr("data-owner") + "_" + $(this).parent().attr("data-id"));
        playlist.deltrack($(this).parent().attr("data-id"));
        $(this).parent().hide("fast");
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
    for (var i = 0; i < this.tracklist.length; i++) {
        if (this.tracklist[i].aid == id) {
            return this.tracklist[i];
        }
    }
};

Playlist.prototype.getNById = function(id) {
    for (var i = 0; i < this.tracklist.length; i++) {
        if (this.tracklist[i].aid == id) {
            return i;
        }
    }
};

Playlist.prototype.restruct = function () {
    var newarray = this.list.sortable('toArray');
    var newtracklist = [];
    var track_id = 0;
    for (var i = 0; i < newarray.length ; i++) {
        track_id = newarray[i].split("_");
        newtracklist.push(this.getById(track_id[1]));
    }
    this.tracklist = newtracklist;

    if (document.location.hash.indexOf("#playlist") == 0) {
        var playlist_id = document.location.hash.replace("#playlist:", "");
        this.restruct_save(playlist_id, newarray);
    }
};

Playlist.prototype.deltrack = function (aid) {
    var id = this.getNById(aid);
    this.tracklist.splice(id,1);
};

// Управление плейлистами

Playlist.prototype.refresh = function () {
    this.loaders.playlist.show();
    var playlist = this;
    $.ajax({
        url: "/ajax/playlist/list",
        type: "POST",
        dataType: "json",
        success: function(data) {
            var html = "";
            if ((data["status"] == "OK") && (data["count"] > 0)) {
                for (var i = 0; i < data["count"]; i++) {
                    html += "<li><span onclick=\"player.playlist.show('" + data["lists"][i]["_id"] + "');\"><img src=\"/images/icons/playlist.png\" alt=\">\" /> " + data["lists"][i]["name"] + "</span>";
                    html += " <small onclick=\"player.playlist.add_to('" + data["lists"][i]["_id"] + "');\">";
                    html += "<img src=\"/images/icons/add.png\" alt=\"add\" /></small> ";
                    html += "<small onclick=\"player.playlist.remove('" + data["lists"][i]["_id"] + "');\"><img src=\"/images/icons/cross.png\" alt=\"del\" /></small></li>";
                }
            } else {
                html = "<li>Нет плейлистов</li>";
            }
            $("#playlistlist").html(html);
            playlist.loaders.playlist.hide();
        }
    });
};

Playlist.prototype.create = function (name) {
    this.loaders.playlist.show();
    var playlist = this;
    if (name != "") {
        $.ajax({
            url: "/ajax/playlist/new",
            data: ({ name: name }),
            type: "POST",
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    playlist.refresh();
                    $("#newplaylist input").val("");
                    $("#newplaylist").hide("fast");
                } else {
                    playlist.smallerror.html("При создании что-то наебнулось. Может попробовать еще раз.").fadeIn("slow").fadeOut(10000);
                    alert(data["message"]);
                }
                playlist.loaders.playlist.hide();
            }
        });
    }
    $("#newplaylist").hide();
};

Playlist.prototype.remove = function (id) {
    this.loaders.playlist.show();
    var playlist = this;
    if (id) {
        $.ajax({
            url: "/ajax/playlist/remove",
            data: ({ id: id }),
            type: "POST",
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    playlist.refresh();
                } else {
                    playlist.smallerror.html("При удалении плейлиста что-то наебнулось. Попробуй еще.").fadeIn("slow").fadeOut(10000);
                    alert(data["message"]);
                }
                playlist.loaders.playlist.hide();
            }
        });
    }
};

Playlist.prototype.add_to = function (playlist_id) {
    this.loaders.playlist.show();
    var playlist = this;
    if (playlist_id) {
        var tracks = [];
        $("#playlist li.selected").each(function () {
            tracks.push($(this).attr("data-owner") + "_" + $(this).attr("data-id"));
        });
        $("#playlist li").removeClass("selected");
        $("#playlist :checkbox").attr("checked", false);
        $.ajax({
            url: "/ajax/playlist/add",
            data: ({
                id: playlist_id,
                tracks: JSON.stringify(tracks)
            }),
            type: "POST",
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    playlist.smallok.html("Треки успешно добавлены").fadeIn("slow").fadeOut(5000);
                } else {
                    playlist.smallerror.html("При добавлении треков в этот плейлист что-то наебнулось. Это печально.").fadeIn("slow").fadeOut(10000);
                }
                playlist.loaders.playlist.hide();
            }
        });
    }
};

Playlist.prototype.remove_from = function (track_id) {
    this.loaders.playlist.show();
    var playlist = this;
    var playlist_id = document.location.hash.replace("#playlist:", "");
    if (playlist_id) {
        $.ajax({
            url: "/ajax/playlist/delete",
            data: ({
                playlist_id: playlist_id,
                track_id: track_id
            }),
            type: "POST",
            dataType: "json",
            success: function(data) {
                console.debug(data);
                if (data["status"] == "OK") {
                    playlist.smallok.html("Треки успешно удалены").fadeIn("slow").fadeOut(5000);
                } else {
                    playlist.smallerror.html("При удалении трека что-то сломалось. Знаю, ты любишь делать это два раза.").fadeIn("slow").fadeOut(10000);
                }
                playlist.loaders.playlist.hide();
            }
        });
    }
};

Playlist.prototype.restruct_save = function (playlist_id, newarray) {
    this.loaders.playlist.show();
    var playlist = this;
    if (playlist_id) {
        $.ajax({
            url: "/ajax/playlist/sort",
            data: ({
                id: playlist_id,
                tracks: JSON.stringify(newarray)
            }),
            type: "POST",
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    playlist.smallok.html("Изменения в плейлисте сохранены").fadeIn("slow").fadeOut(5000);
                } else {
                    playlist.smallerror.html("Проблема связи с сервером. Просто забей...").fadeIn("slow").fadeOut(10000);
                }
                playlist.loaders.playlist.hide();
            }
        });
    }
};

Playlist.prototype.show = function (playlist_id) {
    this.loaders.playlist.show();
    var playlist = this;
    if (playlist_id) {
        $.ajax({
            url: "/ajax/playlist/get",
            type: "POST",
            data: ({ id: playlist_id }),
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    playlist.controls.vk_get_by_id(data["list"]["tracks"], "playlist");
                } else {
                    playlist.smallerror.html("Все сломалось. Плейлист не отображается. Попробуй еще раз.").fadeIn("slow").fadeOut(10000);
                }
                playlist.loaders.playlist.hide();
            }
        });
    }
    document.location.hash = "playlist:" + playlist_id;
};

// Save searches
Playlist.prototype.search_save = function (search_name) {
    this.loaders.search.show();
    var playlist = this;
    if (!search_name) {
        search_name = $("#q").val();
    }
    if (!search_name) return false;
    $.ajax({
        url: "/ajax/searches/add",
        type: "POST",
        data: ({ name: search_name }),
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                playlist.search_refresh();
                playlist.smallok.html("Поиск сохранен").fadeIn("slow").fadeOut(5000);
            } else {
                playlist.smallerror.html("При сохранении поиска потеряна связь с космосом... это печально").fadeIn("slow").fadeOut(10000);
            }
            playlist.loaders.search.hide();
        }
    });
};

Playlist.prototype.search_remove = function (id) {
    if (!id) return false;
    this.loaders.search.show();
    var playlist = this;
    $.ajax({
        url: "/ajax/searches/remove",
        type: "POST",
        data: ({ id: id }),
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                playlist.search_refresh();
                playlist.smallok.html("Поиск удален").fadeIn("slow").fadeOut(5000);
            } else {
                playlist.smallerror.html("При удалении поиска произошла ошибка. Попробуй еще раз.").fadeIn("slow").fadeOut(10000);
            }
            playlist.loaders.search.hide();
        }
    });
};

Playlist.prototype.search_refresh = function () {
    this.loaders.search.show();
    var playlist = this;
    $.ajax({
        url: "/ajax/searches/list",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                var html = "";
                if ((data["status"] == "OK") && (data["count"] > 0)) {
                    for (var i = 0; i < data["count"]; i++) {
                        html += "<li><span onclick=\"player.controls.vk_search('" + data["lists"][i]["name"] + "');\"><img src=\"/images/icons/playlist.png\" alt=\">\" /> " + data["lists"][i]["name"] + "</span> ";
                        html += "<small onclick=\"player.playlist.search_remove('" + data["lists"][i]["_id"] + "');\"><img src=\"/images/icons/cross.png\" alt=\"del\" /></small></li>";
                    }
                }
            } else {
                html = "<li>Нет сохраненных</li>";
            }
            $("#savedsearches").html(html);
            playlist.loaders.search.hide();
        }
    });
};

// Love this tracks
Playlist.prototype.love = function (id, owner) {
    this.loaders.smart.show();
    var playlist = this;
    if (id) {
        $.ajax({
            url: "/ajax/love/add",
            type: "POST",
            data: ({ id: id, owner: owner }),
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    playlist.smallok.html("Трек добавлен в любимые").fadeIn("slow").fadeOut(5000);
                } else {
                    playlist.smallerror.html("При добавлении в любимые что-то сломалось. Я говно. Я хуевая программа.").fadeIn("slow").fadeOut(10000);
                }
                playlist.loaders.smart.hide();
            }
        });
    }
};

Playlist.prototype.unlove = function (id) {
    this.loaders.smart.show();
    var playlist = this;
    if (id) {
        $.ajax({
            url: "/ajax/love/remove",
            type: "POST",
            data: ({ id: id }),
            dataType: "json",
            success: function(data) {
                console.debug(data);
                if (data["status"] == "OK") {
                    playlist.smallok.html("Треки удален из любимых").fadeIn("slow").fadeOut(5000);
                } else {
                    playlist.smallerror.html("При удалении из любимых что-то сломалось. Я хуевая программа. Я не могу приносить людям счастье :(").fadeIn("slow").fadeOut(10000);
                }
                playlist.loaders.smart.hide();
            }
        });
    }   
};

Playlist.prototype.love_list = function () {
    this.loaders.smart.show();
    var playlist = this;
    $.ajax({
        url: "/ajax/love/list",
        type: "POST",
        dataType: "json",
        success: function(data) {          
            if (data["status"] == "OK") {
                playlist.controls.vk_get_by_id(data["tracks"], "love");
            } else {
                playlist.smallerror.html("При отображении любимого я сломалась. Я говно. Я хуевая программа.").fadeIn("slow").fadeOut(10000);
            }
            playlist.loaders.smart.hide();
        }
    });
    document.location.hash = "love";
};

Playlist.prototype.distinct = function (list) {
    if (!list) return [];
    var newlist = [];    
};