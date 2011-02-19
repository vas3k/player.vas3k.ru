function VkontakteAPI (player) {
    this.player = player;
    this.pidoffka = [ "•", "ღ", "|", "♪", "♫", "►", "★", "ι", "٩", "|̃̾", "•̃", "۶",
                      "♥", "●̮̮̃̾̃̾", "▼", "▲", "●", "➨", "Ѽ", "♥", "\\[", "\\]", "\\^", "mp3",
                      "!", "♡", "•", "°", "\\.", "♥", "\\*", "|", "vkontakte", "\\)\\)",
                      "☺", "∎", "\\<", "\\>", "✔" ];
    this.now_offset = 0;
    this.initialize();
    this.getUserInfo();
};

VkontakteAPI.prototype.initialize = function () {
    var player = this.player;

    VK.init({
        apiId: 1934554,
        nameTransportPath: "http://player.vas3k.ru/js/xd_receiver.html"
    });

    VK.Auth.getLoginStatus(function (r) {
        if (r.session) {
            $("#popup_error").hide();
            $("#vk_search_login").hide();
            player.controls.is_logged_in = true;
            player.vk_id = r.session["mid"];
        } else {
            $("#popup_error").slideDown("fast");
        }
    });
};

VkontakteAPI.prototype.login = function () {
    $("#popup_error").hide();
    $("#dialog-vk").hide();
    var player = this.player;

    VK.Auth.login(function () {
            $("#vk_search_login").hide();
            player.controls.is_logged_in = true;
        },
        VK.access.FRIENDS | VK.access.AUDIO
    );

    this.initialize();
};

VkontakteAPI.prototype.pidoffkaFilter = function(text) {
    for (var i = 0; i < this.pidoffka.length; i++) {
        text = text.replace(new RegExp(this.pidoffka[i], 'g'), "");
        text = text.replace(new RegExp("(http://[^ ]*)", 'g'), "");
        text = text.replace(new RegExp("(id[^ ]*)", 'g'), "");
    }
    return text.trim().substring(0, 50);
};

VkontakteAPI.prototype.search = function (query, offset, count) {
    var vk = this;
    var player = this.player;
    offset = (offset) ? offset : 0;
    count = (count) ? count : 200;
    player.search_query = query;
    this.now_offset = 0;

    if (!player.controls.is_logged_in) {
        player.playlist.error.html("Вы не залогинены вконтакте. От этого Павил Дуров опечален. Кнопочку можно найти в углу экрана.").fadeIn("slow").fadeOut(10000);
        return;
    }
    player.playlist.list.html("");
    player.playlist.bigsearch.hide();
    player.playlist.error.hide();
    player.playlist.loaders.big.show();
    player.playlist.show_more.hide();
    query = query.replace(new RegExp("<",'g'), "").replace(new RegExp(">",'g'), "");
    VK.Api.call('audio.search', { "q": query, "offset": offset, "count": count }, function(r) {
        if(r.response) {
            if (r.response[0] == "0") {
                player.playlist.loaders.big.hide();
                player.playlist.error.html("Поиск не дал результатов. Попробуйте другой запрос.").fadeIn("slow").fadeOut(10000);
                return false;
            }
            player.playlist.tracklist = r.response.slice(1);
            for (var i = 0; i < player.playlist.tracklist.length; i++) {
                player.playlist.tracklist[i]["artist"] = vk.pidoffkaFilter(player.playlist.tracklist[i]["artist"]);
                player.playlist.tracklist[i]["title"] = vk.pidoffkaFilter(player.playlist.tracklist[i]["title"]);
            }
            player.playlist.almost_tracklist = player.playlist.tracklist;
            player.playlist.update(player.playlist.tracklist, "search");
        }
        player.playlist.loaders.big.hide();
        player.playlist.playlist_controls.show();
        player.playlist.show_more.show();
    });
    document.location.hash = "search:" + query.replace(new RegExp(" ", 'g'), "+");
    $("#q").val(query);
    $("#lastsearches").prepend('<li onclick="player.vk_api.search(\'' + query + '\');"><span>' + query + '</span></li>');
    $("#playlist_search").hide();
    player.controls.ui_repeat_status.html("all");
    if (player.is_mobile) {
        $("#menu").hide();
        $('#playlistlist').hide();
        $('#savedsearches').hide();
        $('#playlist').show();
    }
};

VkontakteAPI.prototype.searchMore = function() {
    this.now_offset += 200;
    var offset = this.now_offset;
    var vk = this;
    var player = this.player;
    query = player.search_query;

    player.playlist.playlist_controls.show();
    VK.Api.call('audio.search', { "q": query, "offset": offset, "count": 200 }, function(r) {
        if(r.response) {
            if (r.response[0] == "0") player.playlist.show_more.hide();

            var j = 1;
            for (j = 1; j < r.response.length; j++) {
                if (r.response[j]) {
                    player.playlist.tracklist.push(r.response[j]);
                }
            }

            for (var i = player.playlist.tracklist.length - 1; i > j; i--) {
                player.playlist.tracklist[i]["artist"] = vk.pidoffkaFilter(player.playlist.tracklist[i]["artist"]);
                player.playlist.tracklist[i]["title"] = vk.pidoffkaFilter(player.playlist.tracklist[i]["title"]);
            }
            player.playlist.almost_tracklist = player.playlist.tracklist;
            player.playlist.update(player.playlist.tracklist, "search");
        }
    });
};

VkontakteAPI.prototype.getById = function (id, type, play_now) {
    var vk = this;
    var player = this.player;
    var id_str = typeof(id) == "string" ? id : id.join(",");
    //player.playlist.playlist_controls.hide();
    player.playlist.show_more.hide();

    VK.Api.call('audio.getById', { "audios": id_str }, function(r) {
        if (r.response) {
            player.playlist.almost_tracklist = r.response;
            for (var i = 0; i < player.playlist.almost_tracklist.length; i++) {
                player.playlist.almost_tracklist[i]["artist"] = vk.pidoffkaFilter(player.playlist.almost_tracklist[i]["artist"]);
                player.playlist.almost_tracklist[i]["title"] = vk.pidoffkaFilter(player.playlist.almost_tracklist[i]["title"]);
            }
            player.playlist.update(player.playlist.almost_tracklist, type);
            if (play_now) {
                player.playlist.tracklist = player.playlist.almost_tracklist;
                player.playlist.current = 0;
                player.playlist.playTrack(0);
            }
        }

        if (r.error) {
            $("#popup_error").slideDown("fast");
        }
    });

    $("#playlist_search").hide();

    if (player.is_mobile) {
        $("#menu").hide();
        $('#playlistlist').hide();
        $('#savedsearches').hide();
        $('#playlist').show();
    }
};

VkontakteAPI.prototype.getUserInfo = function (show) {
    var player = this.player;
    VK.Api.call('audio.get', { "uid": player.vk_id, "need_user": 1 }, function(r) {
        if (r.response) {
            player.playlist.sidebarRight.find("#artist_title").html(r.response[0].name);
            player.playlist.sidebarRight.find("#artist_url").html("");
            player.playlist.sidebarRight.find("#artist_similar").html("");
            var usertracks = player.playlist.sidebarRight.find("#artist_text");
            usertracks.html("<strong id='useraudio'>Мои аудиозаписи:</strong>");
            var ids = new Array();
            for (var i = 1; i < r.response.length; i++) {
                ids.push(r.response[i].owner_id + '_' + r.response[i].aid);
                usertracks.append('<div class="usertrack" onclick="window.open(\'/small#track:' + r.response[i].owner_id + '_' + r.response[i].aid  + '\', \'\', \'top=300, left=200, menubar=0, toolbar=0, location=0, directories=0, status=0, scrollbars=0, resizable=0, width=600, height=110\');">' + r.response[i].artist + " - " + r.response[i].title + '</div>');
            }
            $("#useraudio").click(function() {
                player.playlist.userPlaylist(ids.join(","));
            });
            if (show) {
                setTimeout(function () {
                    player.playlist.userPlaylist(ids.join(","));
                }, 1000);
            }
            setTimeout(function () {
                VK.Api.call('getProfiles', { "uids": player.vk_id, "fields": "uid, first_name, last_name, nickname, sex, bdate, city, country, timezone, photo, photo_medium, photo_big, photo_rec" }, function(r) {
                    if (r.response) {
                        player.playlist.sidebarRight.find("#artist_img").html("<center><img src='" + r.response[0].photo_big + "' alt=''></center>");
                    }
                });
            }, 2000);
        }
    });
};