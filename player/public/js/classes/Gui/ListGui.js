function ListGui() {
    // Playlist
    this.ui_container = $("#playlist");
    this.ui_playlist = $("#playlist ul");
    this.ui_error = $("#playlist_error");
    this.ui_smallerror = $("#small_error");
    this.ui_smallok = $("#small_ok");
    this.ui_left_sidebar = $("#leftSidebar");
    this.ui_right_sidebar = $("#rightSidebar");
    this.ui_getmore = $("#show_more");

    // Header
    this.ui_playlist_header = $("#playlist_controls");
    this.ui_check_all = $("#check-all");

    // Track
    this.ui_track_class = $(".track");
    this.ui_track_play = $(".playbutton");
    this.ui_track_artist = $(".playlist_artist");
    this.ui_track_title = $(".playlist_title");
   // this.ui_track_time = $(".playlist_time");
    this.ui_track_delete = $(".deletebutton");
    this.ui_track_lyrics = $(".lyricsbutton");
    //this.ui_track_download = $(".downloadbutton");
    this.ui_track_link = $(".linkbutton");

    this.linkTrackEvents();
}

ListGui.prototype.linkTrackEvents = function() {
    this.ui_check_all.live("click", function() {
        // найти все чекбоксы видимых элементов и инвертировать
        var checkbox;
        gui.list_gui.ui_playlist.find("li:visible").each(function () {
            checkbox = $(this).find("input[type=checkbox]");
            checkbox[0].checked = !checkbox[0].checked;
            checkbox.parent().toggleClass("selected");
        });
    });

    this.ui_track_play.live("click", function() {
        var track = player.listController.shown_list.getById($(this).parent().attr("id"));
        player.listController.setShownAsPlayingList();
        player.playbackController.playTrack(track);
    });

    this.ui_track_artist.live("click", function() {
        // поиск по исполнителю
        player.searchController.performSearch($(this).html());
    });

    this.ui_track_title.live("click", function() {
        // поиск по названию
        player.searchController.performSearch($(this).html());
    });

    this.ui_track_delete.live("click", function() {
        var track_id = $(this).parent().attr("id");
        var list = player.listController.shown_list;
        if (!list) return;
        if (list.removeById(track_id)) {
            $(this).parent().fadeOut();
            player.listController.loadPlaylists();
        }
    });

    this.ui_track_lyrics.live("click", function() {
        var lyrics_id = $(this).attr("data-lyrics");
        player.searchController.getLyrics(lyrics_id, gui.showLyrics);
    });

    this.ui_getmore.live("click", function() {
        player.listController.showMore();
    });

    this.ui_track_link.live("click", function() {
        window.open("/small#track:" + $(this).parent().attr("id"),
                    $(this).parent().attr("data-artist") + " " + $(this).parent().attr("data-title"),
                    'top=300, left=200, menubar=0, toolbar=0, location=0, ' +
                    'directories=0, status=0, scrollbars=0, resizable=0, width=600, height=110');
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
        html += gui.list_gui.trackHtml(tracklist[i],
                    {
                        "show_deletetrack": list_object.show_deletetrack
                    });
    }
    gui.list_gui.ui_playlist.html(html);

    $(".track").draggable({
        revert: "invalid",
        helper: "clone",
        cursor: "move"
    });

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
    $("#" + track_id).addClass("playing")
};