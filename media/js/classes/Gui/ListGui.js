function ListGui() {
    // Playlist
    this.ui_playlist = $("#playlist ul");
    this.ui_error = $("#playlist_error");
    this.ui_smallerror = $("#small_error");
    this.ui_smallok = $("#small_ok");
    this.ui_getmore = $("#show_more");

    this.ui_nowplaying_activator = $("#top-info-nowplaying");
    this.ui_nowplaying = $("#nowplaying_list-list");
    this.ui_nowplaying_play = $(".nowplaying-play");
    this.ui_nowplaying_remove = $(".nowplaying-remove");
    // Header
    this.ui_playlist_header = $("#playlist_controls");

    // Track
    this.ui_track_class = $(".track");
    this.ui_track_play = $(".track-play");
    this.ui_track_artist = $(".track-artist");
    this.ui_track_title = $(".track-title");
    this.ui_track_delete = $(".track-delete");
    this.ui_track_lyrics = $(".track-lyrics");
    this.ui_track_link = $(".track-small");

    this.nowplaying_template = '<div class="nowplaying_list-item" id="nowplaying-track-{{{id}}}">' +
        '<div class="item-buttons" data-id="{{{id}}}">' +
            '<img src="/images/icons/delete_circle.png" alt="x" class="nowplaying-remove" title="Удалить трек из списка" />' +
        '</div><div class="item-clickable nowplaying-play" data-id="{{{id}}}">' +
            '<div class="item-img artist-cover-{{{artist_class}}}"></div>' +
            '<div class="item-title">{{title}}</div>' +
            '<div class="item-artist">{{artist}}</div>' +
        '</div></div>';

    this.linkTrackEvents();
}

ListGui.prototype.linkTrackEvents = function() {
    this.ui_track_play.live("click", function() {
        var track_list_name = $(this).parent().attr("data-list");
        var track_id = $(this).parent().attr("data-id");
        var track = gui.active_tab_gui.lists[track_list_name].getById(track_id);
        player.listController.replaceNowplayingList(gui.active_tab_gui.lists[track_list_name]);
        player.playbackController.playTrack(track);
    });

    this.ui_nowplaying_play.live("click", function() {
        var track_id = $(this).attr("data-id");
        var track = player.listController.nowplaying.getById(track_id);
        player.playbackController.playTrack(track);
    });

    this.ui_track_artist.live("click", function() {
        gui.activateTab("artist");
        gui.artist_gui.search($(this).html());
    });

    this.ui_track_title.live("click", function() {
        gui.activateTab("music");
        gui.music_gui.search($(this).html());
    });

    this.ui_track_delete.live("click", function() {
        var track_list_name = $(this).parent().parent().attr("data-list");
        var track_id = $(this).parent().parent().attr("data-id");
        if (gui.active_tab_gui.lists[track_list_name].removeById(track_id)) {
            $(this).parent().parent().fadeOut();
        }
    });

    this.ui_nowplaying_remove.live("click", function() {
        var track_id = $(this).parent().attr("data-id");
        if (player.listController.nowplaying.removeById(track_id)) {
            $(this).parent().parent().fadeOut();
        }
    });

    this.ui_track_lyrics.live("click", function() {
        var lyrics_id = $(this).attr("data-lyrics");
        player.searchController.getLyrics(lyrics_id, gui.showLyrics);
    });

    this.ui_track_link.live("click", function() {
        window.open("/small#track:" + $(this).parent().parent().attr("id"),
                    $(this).parent().parent().attr("data-artist") + " " + $(this).parent().parent().attr("data-title"),
                    'top=300, left=200, menubar=0, toolbar=0, location=0, ' +
                    'directories=0, status=0, scrollbars=0, resizable=0, width=600, height=110');
    });

    $("#container").click(function() {
        $("#nowplaying_list").fadeOut();
    });

    $(".sortable").sortable({
        axis: 'y',
        handle: '.track-sort',
        cursor: 'move',
        stop: function(event, ui) {
            var list_name = $(ui.item).attr("data-list");
            gui.active_tab_gui.lists[list_name].sorted($(this).sortable("toArray"));
        }
    });
};

ListGui.prototype.trackHtml = function(track, config) {
    var context = track.toDict();
    for (var key in config) {
        context[key] = config[key];
    }
    return Mustache.to_html(Track.template, context);
};

ListGui.prototype.showList = function(list_object) {
    if ((!list_object) || (!list_object.list)) {
        gui.list_gui.ui_playlist.html("");
        return;
    }

    gui.list_gui.ui_check_all.attr("checked", false);
    if (!list_object.refreshFix) {
        gui.list_gui.ui_playlist.hide();
    }
    var tracklist = list_object.list;
    var html = "";
    for (var i = 0; i < tracklist.length; i++) {
        html += gui.list_gui.trackHtml(tracklist[i], {
            "show_deletetrack": list_object.show_deletetrack
        });
    }
    gui.list_gui.ui_playlist.html(html);

    if (player.playbackController.current_track) {
        gui.list_gui.highlightTrackById(player.playbackController.current_track.id);
    }

    if (list_object.show_header) {
        gui.list_gui.ui_playlist_header.fadeIn();
    } else {
        gui.list_gui.ui_playlist_header.hide();
    }

    if (list_object.is_getmore) {
        gui.list_gui.ui_getmore.fadeIn();
    } else {
        gui.list_gui.ui_getmore.hide();
    }

    if (!list_object.show_albums) {
        gui.albums_gui.ui_albums_container.hide();
    }
    
    gui.list_gui.ui_playlist.fadeIn();
};

ListGui.prototype.highlightTrackById = function(track_id) {
    $(".track").removeClass("playing");
    $("*[data-id=" + track_id + "]").addClass("playing");

    $(".nowplaying_list-item").removeClass("playing");
    $("#nowplaying-track-" + track_id).addClass("playing");

    var is_inactive = true;
    $(".nowplaying_list-item").each(function(index, element) {
        $(element).removeClass("inactive");
        if ($(element).hasClass("playing")) {
            is_inactive = false;
            return;
        }
        if (is_inactive) {
            $(element).addClass("inactive");
        }
    });

};

ListGui.prototype.updateNowplayingList = function(nowplaying_object) {
    var html = "";
    for(var i in nowplaying_object.list) {
        var item = nowplaying_object.list[i];
        var artist_class = Track.toClass(item.artist);
        html += Mustache.to_html(this.nowplaying_template, {
            "title": item.title,
            "artist": item.artist,
            "artist_class": artist_class,
            "id": item.id
        });
        CoversController.getArtistCover(item.artist, ".artist-cover-" + artist_class)
    }
    this.ui_nowplaying.html(html);
};