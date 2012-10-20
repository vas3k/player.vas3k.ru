function ArtistGui() {
    this.ui_searchbox = $("#artist-search");

    this.ui_artist_bio = $("#artist-info-bio");
    this.ui_artist_img = $("#artist-info-img");
    this.ui_artist_name = $("#artist-info-name");
    this.ui_artist_subtitle = $("#artist-info-subtitle");
    this.ui_artist_fastsearch = $("#artist-info-fastsearch");

    this.ui_albums_list = $("#artist_covers");
    this.ui_similar_list = $("#artist-info-similar");

    this.ui_cover_info_block = $("#cover-info");
    this.ui_cover_info_arrow = $("#cover-info-arrow");
    this.cover_info_block_content = "";

    this.cover_info_title = $("#cover-info-title");
    this.cover_info_artist = $("#cover-info-artist");
    this.cover_info_tracks = $("#cover-info-tracks");
    this.cover_info_add_to_now = $("#album_add_to_now");
    this.cover_info_bgcover = $("#cover-info-bgcover");
    this.cover_info_lists = $("#cover-info-lists");

    this.ui_tags_block = $("#artist-tags");

    this.album_template = '<div class="cover artist_album_cover" data-num="{{num}}" data-artist="{{artist}}" data-album="{{title}}">' +
        '<div class="cover-image" style="background-image: url(\'{{cover}}\');"></div>' +
        '<div class="cover-title">' +
            '<span>{{title}}</span><br />' +
            '<small>{{artist}}</small>' +
        '</div></div>';

    this.similar_artist_template = '<div class="simular-artist" onclick="gui.artist_gui.search(\'{{artist}}\');">' +
        '<div class="simular-artist-img" style="background-image: url(\'{{cover}}\');"></div>' +
        '<div class="simular-artist-title">{{artist}}</div>' +
        '</div>';

    var _this = this;
    $(".artist_album_cover").live("click", function() {
        _this.showCoverInfo(this);
    });

    $("#artist-tags .tag").click(function() {
        _this.search($(this).attr("data-query"));
    });

    this.ui_artist_fastsearch.click(function() {
        gui.music_gui.search($(this).attr("data-artist"), true);
        gui.activateTab("music");
    });

    this.lists = {};
    this.current_num = 0;
}

ArtistGui.prototype.load = function() {
    this.cover_info_block_content = this.ui_cover_info_block.detach();
};

ArtistGui.prototype.search = function(query) {
    query = query || this.ui_searchbox.val();
    if (!query) return;
    this.ui_searchbox.val(query);
    this.ui_tags_block.fadeOut("slow");

    this.loadAlbums(query);
    this.loadArtistInfo(query);
    this.loadSimilar(query);

    setTimeout(function() {
        gui.changeHash("#artist:" + query.replace(" ", "+"));
    }, 0);
};

ArtistGui.prototype.loadArtistInfo = function(artist) {
    var _this = this;
    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: ({
            method: "artist.getInfo",
            format: "json",
            lang: "ru",
            autocorrect: 1,
            api_key: player.last_fm_id,
            artist: artist
        }),
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if (data.error) {
                _this.ui_artist_bio.html("Не найдено");
            }
            _this.ui_artist_name.html("<a href='" + data.artist.url + "' target='_blank'>" + data.artist.name + "</a>");
            _this.ui_artist_img.attr("style", "background-image: url('" + data.artist.image[2]["#text"] + "');");
            _this.ui_artist_bio.html(data.artist.bio.summary);
            _this.ui_artist_subtitle.html((data.artist.bio.placeformed || "") + " " + (data.artist.bio.yearformed || ""));
            _this.cover_info_bgcover.attr("style", "background-image: url('"+ data.artist.image[3]["#text"] + "');");
            _this.ui_artist_fastsearch.attr("data-artist", data.artist.name);
            _this.ui_artist_fastsearch.show();
        },
        beforeSend: function() {
            _this.ui_artist_fastsearch.hide();
            _this.ui_artist_name.html("");
            _this.ui_artist_img.attr("style", "");
            _this.ui_artist_bio.html('<div class="list_loader"></div>');
            _this.ui_artist_subtitle.html("");
        },
        error: function() {
            _this.ui_artist_name.html("Ошибка при загрузке");
        }
    });
};

ArtistGui.prototype.loadAlbums = function(artist) {
    var _this = this;
    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: ({
            method: "artist.gettopalbums",
            format: "json",
            lang: "ru",
            autocorrect: 1,
            api_key: player.last_fm_id,
            artist: artist
        }),
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if (data.error || !data["topalbums"]["album"]) {
                _this.ui_albums_list.html("");
            }

            var html = "";
            for (var i = 0; i < data["topalbums"]["album"].length; i++) {
                var album = data["topalbums"]["album"][i];
                html += Mustache.to_html(_this.album_template, {
                    "cover": album.image[3]["#text"],
                    "title": album.name,
                    "artist": album.artist.name,
                    "num": (i + 1)
                });
            }
            _this.ui_albums_list.html(html);
        },
        error: function() {
            _this.ui_albums_list.html("Ошибка при загрузке");
        }
    });
};

ArtistGui.prototype.loadSimilar = function(artist) {
    var _this = this;
    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: ({
            method: "artist.getSimilar",
            format: "json",
            lang: "ru",
            autocorrect: 1,
            api_key: player.last_fm_id,
            artist: artist
        }),
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if (data.error || !data["similarartists"]["artist"]) {
                _this.ui_similar_list.html("");
            }

            var html = "";
            for (var i = 0; i < data["similarartists"]["artist"].length; i++) {
                var artist = data["similarartists"]["artist"][i];
                html += Mustache.to_html(_this.similar_artist_template, {
                    "cover": artist.image[0]["#text"],
                    "artist": artist.name
                });
            }
            _this.ui_similar_list.html(html);
        },
        beforeSend: function() {
            _this.ui_similar_list.html('<div class="list_loader"></div>');
        },
        error: function() {
            _this.ui_similar_list.html("");
        }
    });
};

ArtistGui.prototype.clearSearchBox = function() {
    this.ui_searchbox.val("");
    this.ui_artist_name.html("");
    this.ui_artist_img.attr("style", "");
    this.ui_artist_bio.html("");
    this.ui_artist_subtitle.html("");
    this.ui_similar_list.html("");
    this.ui_albums_list.html("");
    this.ui_artist_fastsearch.hide();
    this.ui_tags_block.fadeIn("fast");
};

ArtistGui.prototype.showCoverInfo = function(clicked_elem) {
    var num = parseInt($(clicked_elem).attr("data-num"));

    if (this.current_num == num) {
        $("#cover-info").slideToggle();
        return;
    } else {
        $("#cover-info").hide();
    }

    var is_found = false;
    var last_elem;
    var _this = this;
    $(".artist_album_cover").each(function (index, element) {
        if (element == clicked_elem) {
            is_found = true;
            return true;
        }

        if (is_found) {
            if ($(element).position().left < 100) {
                return false; // break
            }
            last_elem = element;
        }
    });

    $(last_elem).after(_this.cover_info_block_content);
    _this.ui_cover_info_arrow.css("left", $(clicked_elem).position().left + 100);

    this.current_num = num;

    // Load info
    var artist = $(clicked_elem).attr("data-artist");
    var album = $(clicked_elem).attr("data-album");
    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: {
            method: "album.getInfo",
            format: "json",
            lang: "ru",
            autocorrect: 1,
            api_key: player.last_fm_id,
            artist: artist,
            album: album
        },
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if (data.error) return;
            var album = data["album"];
            _this.cover_info_artist.html(album.artist);
            _this.cover_info_title.html(album.name);
            _this.cover_info_add_to_now.show();
            _this.lists["album"] = new AlbumList(player.listController, album.artist, album.name);
            _this.lists["album"].mbid = num;
            _this.lists["album"].raw_data = data;
            _this.lists["album"].getList(function(list_object) {
                if (_this.current_num != list_object.mbid) return;
                _this.cover_info_tracks.html("");
                for(var i = 0; i < list_object.list.length; i++) {
                    _this.cover_info_tracks.append(gui.list_gui.trackHtml(list_object.list[i], {
                        "show_deletetrack": false,
                        "list": "album"
                    }));
                }
            });
        },
        beforeSend: function() {
            _this.cover_info_artist.html("");
            _this.cover_info_title.html("");
            _this.cover_info_tracks.html("");
            $("#cover-info").slideDown();
        },
        error: function() {
            alert("Содержания этого альбома нет на lasf.fm :(");
        }
    });
};

ArtistGui.prototype.addToNowplayingList = function() {
    if (gui.artist_gui.lists["album"]) {
        player.listController.addToNowplayingList(gui.artist_gui.lists["album"]);
    }
};