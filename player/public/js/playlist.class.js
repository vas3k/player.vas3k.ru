function Playlist (player) {
    this.player = player;
    this.is_mobile = false; // мобильная версия?
    this.is_restructing = false; // мютекс, якобы включаемый пока плейлист обновляется
    this.now_type = "search"; // текущий тип воспроизведения = ["search", "playlist", "love", "my"]

    this.tracks = 0; // количество треков (DEPRECATED)
    this.current = -1; // ID текущего трека в this.tracklist
    this.current_aid = -1; // AID текущего трека
    this.current_fullid = -1; // Full ID текущего трека (Owner ID + AID)
    this.shuffle = false; // шаффл? (DEPRECATED)
    this.repeat_one = false; // повтор одного трека
    this.repeat_all = true;  // повтор всех

    // Описание гуев
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

    this.playlist_controls = $("#playlist_controls");
    this.button_doubles = $("#button_doubles button");
    this.button_only_artist = $("#button_only_artist button");
    this.button_only_title = $("#button_only_title button");
    this.show_more = $("#show_more");

    // Треклист
    this.tracklist = [];

    // "почти треклист" (когда жмешь на плейлист, чтобы старый треклист продолжал играть)
    this.almost_tracklist = [];

    this.initialize();
};

Playlist.prototype.initialize = function () {
    var playlist = this;
    this.list.sortable({
        placeholder: 'sort-placeholder',
        opacity: 0.8,
        stop: function(event, ui) {
            playlist.restruct();
        }
    });

    this.list.disableSelection();

    this.button_doubles.button().click(function () {
        playlist.filterDoubles();
    });

    this.button_only_artist.button().click(function () {
        playlist.filterOnlyArtist();
    });

    this.button_only_title.button().click(function () {
        playlist.filterOnlyTitle();
    });

    //this.sidebarRight.resizable();
};

Playlist.prototype.update = function (trackslist, type) {
    var playlist = this;
    this.now_type = type;
    html = "";
    for (var index = 0; index < trackslist.length; index++) {
        element = trackslist[index];
        if (!playlist.is_mobile) {
            html += '<li id="' + element.owner_id + "_" + element.aid +
                        '" class="track" data-artist="' + element.artist +
                        '" data-track="' + index +
                        '" data-type="' + type +
                        '" data-id="' + element.aid +
                        '" data-owner="' + element.owner_id +
                        '" data-title="' + element.title +
                        '" data-url="' + element.url + '"><input type="checkbox"> <img src="/images/icons/play.png" alt=">" class="playbutton"> <b>' +
                        ' <span onclick="player.vk_api.search(\'' + element.artist + '\');">' + element.artist + '</span></b>' +
                        ' <span onclick="player.vk_api.search(\'' + element.title + '\');">' + element.title + '</span>' +
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
    }
    if (html) {
        this.list.html(html);
    } else {
        this.list.html(" ");
        this.error.html("Список пуст").fadeIn("slow").fadeOut(10000);
    }
    this.bind();
    if (type == "playlist") {
        this.bindPlaylist();
    } else if (type == "love") {
        this.bindLove();
    } else if (type == "last") {
        this.bindLast();
    }
};

Playlist.prototype.bind =  function () {
    var playlist = this;
    var player = this.player;

    // чтобы не сбилось проигрывание треков, после частичной чистки
    $("#" + playlist.current_fullid).addClass("playing");
    var new_n = playlist.getNById(playlist.current_aid);
    if (new_n) playlist.current = new_n;

    $(".playbutton").click(function () {
        playlist.repeat_one = false;
        player.controls.destroyCurrent();
        playlist.tracklist = playlist.almost_tracklist;
        playlist.current_aid = $(this).parent().attr("data-id");
        playlist.current_fullid = $(this).parent().attr("id");
        playlist.current = playlist.getNById(playlist.current_aid);
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
        if (playlist.repeat_one) {
            playlist.player.controls.ui_repeat_status.html("one");
        } else {
            playlist.player.controls.ui_repeat_status.html("all");
        }
        $(this).toggleClass("activebutton");
    });

    $(".track input").click(function () {
        $(this).parent().toggleClass("selected");
    });

    this.sidebar.find("li").click(function () {
        playlist.sidebar.find("li").each(function () {
            $(this).removeClass("active");
        });
        $(this).addClass("active");
    });
};

Playlist.prototype.bindPlaylist = function () {
    var playlist = this;
    $(".deletebutton").click(function () {
        playlist.removeFrom($(this).parent().attr("data-owner") + "_" + $(this).parent().attr("data-id"));
        playlist.deltrack($(this).parent().attr("data-id"));
        $(this).parent().hide("fast");
    });    
};

Playlist.prototype.bindLove = function () {
    var playlist = this;
    $(".deletebutton").click(function () {
        playlist.unlove($(this).parent().attr("data-owner") + "_" + $(this).parent().attr("data-id"));
        playlist.deltrack($(this).parent().attr("data-id"));
        $(this).parent().hide("fast");
    });
};

Playlist.prototype.bindLast = function () {
    var playlist = this;
    $(".deletebutton").hide();
};

Playlist.prototype.playTrack = function (id) {
    var player = this.player;
    id = this.repeat_all ? parseInt(id) % this.tracklist.length : parseInt(id);
    try {
        var aid = this.tracklist[id]["aid"];
        $(".track").removeClass("playing");
        $(".track[data-id=" + aid + "]").addClass("playing");
        player.controls.setCurrent(this.tracklist[id]);
        player.controls.playCurrent();
    } catch (e) {
        player.controls.stopCurrent();
    }
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
    if (!this.is_restructing) {
        this.is_restructing = true;
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
            this.restructSave(playlist_id, newarray);
        }
        this.is_restructing = false;
    }
};

Playlist.prototype.deltrack = function (aid) {
    var id = this.getNById(aid);
    this.tracklist.splice(id,1);
};

// Список воспроизведения
Playlist.prototype.showCurrent = function() {
    this.update(this.tracklist, this.now_type);
    this.show_more.hide();
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
                    html += "<li data-id=\"" + data['lists'][i]['_id'] + "\"><span onclick=\"player.playlist.show('" + data["lists"][i]["_id"] + "');\"><img src=\"/images/icons/playlist.png\" alt=\">\" /> " + data["lists"][i]["name"] + "</span>";
                    html += " <small onclick=\"player.playlist.addTo('" + data["lists"][i]["_id"] + "');\">";
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

Playlist.prototype.addTo = function (playlist_id) {
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

Playlist.prototype.removeFrom = function (track_id) {
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

Playlist.prototype.restructSave = function (playlist_id, newarray) {
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
    var playlist = this;
    playlist.list.html("");
    playlist.loaders.playlist.show();
    playlist.loaders.big.show();

    if (playlist_id) {
        $.ajax({
            url: "/ajax/playlist/get",
            type: "POST",
            data: ({ id: playlist_id }),
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    player.vk_api.getById(data["list"]["tracks"], "playlist");
                } else {
                    playlist.smallerror.html("Все сломалось. Плейлист не отображается. Попробуй еще раз.").fadeIn("slow").fadeOut(10000);
                }
                playlist.loaders.playlist.hide();
                playlist.loaders.big.hide();
            },
            error: function () {
                playlist.smallerror.html("Все сломалось. Плейлист не отображается. Попробуй еще раз.").fadeIn("slow").fadeOut(10000);
                playlist.loaders.playlist.hide();
                playlist.loaders.big.hide();
            }
        });
    }
    document.location.hash = "playlist:" + playlist_id;
};

// Save searches
Playlist.prototype.searchSave = function (search_name) {
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
                playlist.searchRefresh();
                playlist.smallok.html("Поиск сохранен").fadeIn("slow").fadeOut(5000);
            } else {
                playlist.smallerror.html("При сохранении поиска потеряна связь с космосом... это печально").fadeIn("slow").fadeOut(10000);
            }
            playlist.loaders.search.hide();
        },
        error: function () {
            playlist.smallerror.html("При сохранении поиска потеряна связь с космосом... это печально").fadeIn("slow").fadeOut(10000);
            playlist.loaders.search.hide();
        }
    });
};

Playlist.prototype.searchRemove = function (id) {
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
                playlist.searchRefresh();
                playlist.smallok.html("Поиск удален").fadeIn("slow").fadeOut(5000);
            } else {
                playlist.smallerror.html("При удалении поиска произошла ошибка. Попробуй еще раз.").fadeIn("slow").fadeOut(10000);
            }
            playlist.loaders.search.hide();
        },
        error: function () {
            playlist.smallerror.html("При удалении поиска произошла ошибка. Попробуй еще раз.").fadeIn("slow").fadeOut(10000);
            playlist.loaders.search.hide();
        }
    });
};

Playlist.prototype.searchRefresh = function () {
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
                        html += "<li><span onclick=\"player.vk_api.search('" + data["lists"][i]["name"] + "');\"><img src=\"/images/icons/saved_searches.png\" alt=\">\" /> " + data["lists"][i]["name"] + "</span> ";
                        html += "<small onclick=\"player.playlist.searchRemove('" + data["lists"][i]["_id"] + "');\"><img src=\"/images/icons/cross.png\" alt=\"del\" /></small></li>";
                    }
                }
            } else {
                html = "<li>Нет сохраненных</li>";
            }
            $("#savedsearches").html(html);
            playlist.loaders.search.hide();
        },
        error: function () {
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

Playlist.prototype.loveList = function () {
    var player = this.player;
    var playlist = this;
    this.loaders.smart.show();
    playlist.loaders.big.show();
    $.ajax({
        url: "/ajax/love/list",
        type: "POST",
        dataType: "json",
        success: function(data) {          
            if (data["status"] == "OK") {
                player.vk_api.getById(data["tracks"], "love");
            } else {
                playlist.smallerror.html("При отображении любимого я сломалась. Я говно. Я хуевая программа.").fadeIn("slow").fadeOut(10000);
            }
            playlist.loaders.smart.hide();
            playlist.loaders.big.hide();
        },
        error: function () {
            playlist.loaders.big.hide();
        }
    });
    document.location.hash = "love";
};

Playlist.prototype.nowlistening = function() {
    var player = this.player;
    var playlist = this;
    this.loaders.smart.show();
    playlist.loaders.big.show();
    $.ajax({
        url: "/ajax/nowlistening",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                player.vk_api.getById(data["tracks"], "last");
            } else {
                playlist.smallerror.html("При отображении последних треков я сломалась. Я говно. Я хуевая программа.").fadeIn("slow").fadeOut(10000);
            }
            playlist.loaders.smart.hide();
            playlist.loaders.big.hide();
        },
        error: function () {
            playlist.loaders.big.hide();
        }
    });
    document.location.hash = "last";
};

Playlist.prototype.userPlaylist = function(ids) {
    var player = this.player;
    var playlist = this;
    this.loaders.smart.show();

    document.location.hash = "my";
    player.vk_api.getById(ids, "my");
    playlist.loaders.smart.hide();
};

Playlist.prototype.filterDoubles = function() {
    this.tracklist = this.almost_tracklist;
    var new_tracklist = [];
    var artist = "";
    var title = "";
    new_tracklist.push(this.tracklist[0]);

    for (var i = 1; i < this.tracklist.length; i++) {
        artist = this.tracklist[i].artist.toLowerCase();
        title = this.tracklist[i].title.toLowerCase();
        found = false;

        for (var j = 0; j < new_tracklist.length; j++) {
            if ((new_tracklist[j].artist.toLowerCase() == artist) && (new_tracklist[j].title.toLowerCase() == title)) {
                found = true;
            }
        }

        if (!found) {
            new_tracklist.push(this.tracklist[i]);
        }
    }
    this.almost_tracklist = this.tracklist = new_tracklist;
    this.update(new_tracklist, this.now_type);
};

Playlist.prototype.toggleCheckAll = function() {
    this.tracklist = this.almost_tracklist;
    var checkbox;
    this.list.find("li:visible").each(function () {
        checkbox = $(this).find("input[type=checkbox]");
        checkbox[0].checked = !checkbox[0].checked;
        checkbox.parent().toggleClass("selected");
    });
};

Playlist.prototype.filterOnlyArtist = function() {
    this.tracklist = this.almost_tracklist;
    var query = $("#q").val().toLowerCase();
    var new_tracklist = [];
    for (var i = 0; i < this.tracklist.length; i++) {
        if (this.tracklist[i].artist.toLowerCase().indexOf(query) + 1) {
            new_tracklist.push(this.tracklist[i]);
        }
    }
    this.almost_tracklist = this.tracklist = new_tracklist;
    this.update(new_tracklist, this.now_type);
};

Playlist.prototype.filterOnlyTitle = function() {
    this.tracklist = this.almost_tracklist;
    var query = $("#q").val().toLowerCase();
    var new_tracklist = [];
    for (var i = 0; i < this.tracklist.length; i++) {
        if (this.tracklist[i].title.toLowerCase().indexOf(query) + 1) {
            new_tracklist.push(this.tracklist[i]);
        }
    }
    this.almost_tracklist = this.tracklist = new_tracklist;
    this.update(new_tracklist, this.now_type);
};

Playlist.prototype.toggleShuffle = function () {
    this.tracklist = this.almost_tracklist;
    this.tracklist.sort(function (a, b) {
        var max = 1;
        var min = -1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    });
    this.update(this.tracklist, this.now_type);
};

Playlist.prototype.toggleRepeat = function () {
    this.repeat_all = !this.repeat_all;
    this.repeat_one = false;
    if (this.repeat_all) {
        this.player.controls.ui_repeat_status.html("all");
    } else {
        this.player.controls.ui_repeat_status.html("off");
    }
};