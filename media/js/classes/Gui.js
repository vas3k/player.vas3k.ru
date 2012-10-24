function Gui() {
    this.user_gui = new UserGui();
    this.music_gui = new MusicGui();
    this.artist_gui = new ArtistGui();
    this.albums_gui = new AlbumsGui();
    this.playlists_gui = new PlaylistsGui();
    this.recommendations_gui = new RecommendationsGui();

    this.list_gui = new ListGui();

    this.repeat_states = ["all", "one", "no"];

    // Tab
    this.active_tab_gui = this.user_gui;
    this.tabs = {
        "user": {
            "element": $("#tab-user"),
            "gui": this.user_gui
        },
        "music": {
            "element": $("#tab-music"),
            "gui": this.music_gui
        },
        "artist": {
            "element": $("#tab-artist"),
            "gui": this.artist_gui
        },
        "albums": {
            "element": $("#tab-albums"),
            "gui": this.albums_gui
        },
        "playlists": {
            "element": $("#tab-playlists"),
            "gui": this.playlists_gui
        },
        "recommendations": {
            "element": $("#tab-recommendations"),
            "gui": this.recommendations_gui
        }
    };
    this.all_tabs = $(".tab");

    // Window
    this.ui_windowtitle = $("title");
    this.ui_head = document.getElementsByTagName('head')[0];

    // Sliders
    this.ui_volumebar = $("#volume_slider");
    this.ui_bar = $("#loading_bar");
    this.ui_slider = $("#top-info-progress-slider");

    // Labels
    this.ui_trackcover = $("#top-info-cover");
    this.ui_titlelabel = $("#top-info-title");
    this.ui_artistlabel = $("#top-info-artist");
    this.ui_positionlabel = $("#top-info-progress-left_time");
    this.ui_durationlabel = $("#top-info-progress-right_time");

    // Buttons
    this.ui_prevbutton = $("#top-controls-prev");
    this.ui_playbutton = $("#top-controls-play");
    this.ui_nextbutton = $("#top-controls-next");

    this.ui_list_selectall_button = $(".list-selectall-button");
    this.ui_list_remove_button = $(".list-remove-button");
    this.ui_list_addto_button_activator = $(".list-addto-button");
    this.ui_list_addto_button = $(".add_to_button");

    this.ui_shuffle_button = $("#shuffle");
//    this.ui_repeat_button = $("#button_repeat button");
//    this.ui_repeat_status = $("#repeat_status");

    // Search
    this.ui_search = $(".search-query");
    this.ui_searchbutton = $(".search-button");
    this.ui_top_search = $("#top-search-filter");

    this.ui_smallinfo = $("#smallinfo");
    this.ui_search_combo = $("#searchOptionsCombo");
    this.ui_search_combo_button = $("#showSearchCombo");

    // Dialogs
    this.ui_unsupported_dialog = $("#dialog-unsupported");
    this.ui_lyrics_dialog = $("#dialog-lyrics");

    // Top
    this.ui_top_lyrics = $("#top-show-lyrics");
    this.ui_top_mini = $("#top-open-mini");

    // Initialization
    this.linkButtonEvents();
    this.linkSearchEvents();
    this.linkSliderEvents();
    this.initByHash();
}

Gui.prototype.linkButtonEvents = function() {
    var _this = this;

    this.ui_top_lyrics.click(function() {
        var current = player.playbackController.current_track;
        if (current) {
            player.searchController.getLyrics(current.lyrics_id, gui.showLyrics);
        } else {
            alert("Надо что-нибудь слушать");
        }
    });

    this.ui_top_mini.click(function() {
        var current = player.playbackController.current_track;
        if (current) {
            window.open("/small#track:" + current.id,
                current.artist + " " + current.title,
                'top=300, left=200, menubar=0, toolbar=0, location=0, ' +
                    'directories=0, status=0, scrollbars=0, resizable=0, width=600, height=110');
        } else {
            alert("Надо что-нибудь слушать");
        }
    });

    this.ui_prevbutton.click(function () {
        player.playbackController.playPreviousTrack();
    });

     this.ui_nextbutton.click(function () {
         player.playbackController.playNextTrack();
    });

     this.ui_playbutton.click(function () {
        if (player.playbackController.is_playing) {
             player.playbackController.pause();
        } else {
             player.playbackController.play();
        }
    });

    this.ui_list_selectall_button.live("click", function() {
        var list_id = $(this).parent().parent().attr("data-list-id");
        $("#" + list_id).find("input[type=checkbox]").each(function () {
            this.checked = !this.checked;
        });
    });

    this.ui_list_remove_button.live("click", function() {
        var track_list_id = $(this).parent().parent().attr("data-list-id");
        $("#" + track_list_id).find("input[type=checkbox]:checked").each(function() {
            var track_element = $(this).parent().parent();
            if (gui.active_tab_gui.lists[track_element.attr("data-list")].removeById(track_element.attr("data-id"))) {
                track_element.fadeOut();
            }
        });
    });

    this.ui_list_addto_button_activator.live("click", function() {
        $(this).find(".add_to_popup").fadeToggle("fast");
    });

    this.ui_list_addto_button.live("click", function() {
        var playlist_id = $(this).attr("data-list-id");
        var parent_list = $($(this).parents(".list-buttons")[0]);

        var track_list_id = parent_list.attr("data-list-id");
        var track_list_name = parent_list.attr("data-list-name");

        if (playlist_id == "nowplaying") {
            $("#" + track_list_id).find("input[type=checkbox]:checked").each(function() {
                var track_id = $(this).parent().parent().attr("data-id");
                player.listController.nowplaying.list.push(gui.active_tab_gui.lists[track_list_name].getById(track_id));
            });
            gui.list_gui.updateNowplayingList(player.listController.nowplaying);
        } else {
            var track_ids = [];
            $("#" + track_list_id).find("input[type=checkbox]:checked").each(function() {
                var track_element = $(this).parent().parent();
                track_ids.push(track_element.attr("data-id"));
            });
            gui.playlists_gui.lists["playlist-" + playlist_id].pushRaw(track_ids);
        }
    });

    this.ui_shuffle_button.click(function() {
        player.playbackController.shuffle();
    });
//
//    this.ui_repeat_button.button({
//        text: false,
//        icons: {
//            primary: 'ui-icon-refresh'
//        }
//    }).click(function () {
//        var repeat_state = player.playbackController.toggleRepeat();
//        _this.ui_repeat_status.html(_this.repeat_states[repeat_state]);
//    });

//    _this.ui_repeat_status.html(_this.repeat_states[player.playbackController.repeat_state]);
//
    $("#create_playlist").click(function() {
        $(this).find("span").toggle();
        $(this).find("input").toggle().focus();
    });

    $("#create_playlist input").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            player.listController.createPlaylist($(this).val());
            $(this).val("");
            $("#create_playlist span").toggle();
            $("#create_playlist input").toggle();
        }
    });

    $(".list-buttons .activator").live("click", function() {
        $(this).toggleClass("active");
        $(this).parent().find(".list-buttons-onactive").toggle("fast");
        $(".add_to_popup").hide();
    });
};

Gui.prototype.linkSearchEvents = function() {
    var _this = this;
    this.ui_searchbutton.click(function () {
        _this.active_tab_gui.search();
    });
    
    this.ui_search.keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            _this.active_tab_gui.search();
        }
    });

    this.ui_top_search.keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            _this.user_gui.search($(this).val());
        }
    });
};

Gui.prototype.linkSliderEvents = function() {
    this.ui_volumebar.slider({
        disabled: false,
        range: false,
        min: 0,
        max: 100,
        value: player.playbackController.volume,
        slide: function (event, ui) {
            player.playbackController.seekVolume(ui.value);
        }
    });

    this.ui_bar.css("width", "0");

    this.ui_slider.slider({
        min: 0,
        max: 100,
        value: 0,
        slide: function (event, ui) {
             player.playbackController.seekPosition(ui.value);
        }
    });
};

Gui.prototype.initByHash = function() {
    hash = document.location.hash;

    if ((hash == "") || (hash == "#")) {
        this.activateTab("user");
        return;
    }

    if (hash.indexOf(":") >= 0) {
        var hash_segments = hash.split(":");
        var hash = hash_segments[0];
        var query = hash_segments[1].replace("+", " ");
    }

    if (hash.indexOf("#user") == 0) {
        this.activateTab("user");
        if (query) this.user_gui.search(query);
        return;
    }

    if (hash.indexOf("#music") == 0) {
        this.activateTab("music");
        if (query) this.music_gui.search(query);
        return;
    }

    if (hash.indexOf("#artist") == 0) {
        this.activateTab("artist");
        if (query) this.artist_gui.search(query);
        return;
    }

    if (hash.indexOf("#albums") == 0) {
        this.activateTab("albums");
        if (query) this.albums_gui.search(query);
        return;
    }

    if (hash.indexOf("#playlists") == 0) {
        this.activateTab("playlists");
        return;
    }

    if (hash.indexOf("#recommendations") == 0) {
        this.activateTab("recommendations");
        return;
    }
};

Gui.prototype.activateControls = function(track) {
    this.ui_durationlabel.html(track.duration);
    this.ui_slider.slider("option", "max", track.duration_ms * 100);
    this.ui_slider.slider("value", 0);
    this.ui_titlelabel.html(track.title);
    this.ui_artistlabel.html(track.artist);

    var artist_class = Track.toClass(track.artist);
    this.ui_trackcover.attr("class", "artist-cover-" + artist_class);
    CoversController.getArtistCover(track.artist, ".artist-cover-" + artist_class);

    
//    this.ui_prevbutton.button("option", "disabled", false);
//    this.ui_playbutton.button("option", "disabled", false);
//    this.ui_nextbutton.button("option", "disabled", false);
//    this.ui_playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
    this.ui_playbutton.removeClass("playbutton-play").addClass("playbutton-pause");
    this.ui_smallinfo.fadeIn("fast");

    this.changeFavicon("favicon_play.png");
    this.changeWindowTitle(track.artist + " - " + track.title);
};

Gui.prototype.pauseControls = function() {
    this.ui_playbutton.removeClass("playbutton-pause").addClass("playbutton-play");
    this.changeFavicon("favicon_pause.png");
};

Gui.prototype.deactivateControls = function() {
    this.ui_durationlabel.html("");
    this.ui_slider.slider("option", "max", 0);
    this.ui_slider.slider("value", 0);
    this.ui_titlelabel.html("");
    this.changeWindowTitle("");

    this.ui_prevbutton.button("option", "disabled", true);
    this.ui_playbutton.button("option", "disabled", true);
    this.ui_nextbutton.button("option", "disabled", true);
    this.ui_playbutton.button("option", "icons", { primary: 'ui-icon-play' });
    this.ui_smallinfo.fadeOut();
    this.changeFavicon("favicon_pause.png");
};

Gui.prototype.changeFavicon = function(filename) {
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/images/' + filename;
    this.ui_head.appendChild(link);
};

Gui.prototype.changeWindowTitle = function(title) {
    this.ui_windowtitle.html(title + " - player.vas3k.ru");
};

Gui.prototype.changeHash = function(title) {
    document.location.hash = title;
};

Gui.prototype.clearSearch = function() {
    this.ui_search.val("");
};

Gui.prototype.showUnsupported = function() {
    this.ui_unsupported_dialog.dialog({
        height: 140,
        width: 400,
        modal: true
    });
};

Gui.prototype.showList = function(list_object) {
    gui.list_gui.showList(list_object);
};

Gui.prototype.searchGui = function(search_query) {
    this.ui_search.val(search_query);
    this.changeWindowTitle(search_query);
};

Gui.prototype.showLyrics = function(text) {
    text = text.replace(new RegExp("<",'g'), "").replace(new RegExp(">",'g'), "");
    gui.ui_lyrics_dialog.find("div").html(text);
    gui.ui_lyrics_dialog.fadeIn();
};

Gui.prototype.activateTab = function(tab_name) {
    this.all_tabs.hide();
    this.tabs[tab_name].element.show();
    this.active_tab_gui = this.tabs[tab_name].gui;
    this.active_tab_gui.load();

    $(".mode-list-item").removeClass("active");
    $("#tab-title-" + tab_name).addClass("active");
    this.changeHash("#" + tab_name);
};