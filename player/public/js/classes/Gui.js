function Gui() {
    this.sidebar_gui = new SidebarGui();
    this.list_gui = new ListGui();
    this.albums_gui = new AlbumsGui();

    this.repeat_states = ["all", "one", "no"];

    // Window
    this.ui_windowtitle = $("title");
    this.ui_head = document.getElementsByTagName('head')[0];

    // Sliders
    this.ui_volumebar = $("#vol_slider");
    this.ui_bar = $("#progressbar");
    this.ui_slider = $("#trackslider");

    // Labels
    this.ui_titlelabel = $("#tracktitle");
    this.ui_positionlabel = $("#trackposition");
    this.ui_durationlabel = $("#trackduration");

    // Buttons
    this.ui_prevbutton = $("#button_prev button");
    this.ui_playbutton = $("#button_play button");
    this.ui_nextbutton = $("#button_next button");
    this.ui_shuffle_button = $("#button_shuffle button");
    this.ui_repeat_button = $("#button_repeat button");
    this.ui_repeat_status = $("#repeat_status");

    // Filters
    this.ui_filter_artist = $("#onlyArtist");
    this.ui_filter_track = $("#onlyTrack");
    this.ui_filter_duplicates = $("#removeDuplicates");

    // Search
    this.ui_search = $("#q");
    this.ui_searchbutton = $("#qok");
    this.ui_smallinfo = $("#smallinfo");
    this.ui_search_combo = $("#searchOptionsCombo");
    this.ui_search_combo_button = $("#showSearchCombo");

    // Dialogs
    this.ui_unsupported_dialog = $("#dialog-unsupported");
    this.ui_lyrics_dialog = $("#dialog-lyrics");

    // Initialization
    this.linkButtonEvents();
    this.linkSearchEvents();
    this.linkSliderEvents();
    this.initByHash();

    if (player.isiPad) {
        $("body").bind("touchmove", function (event) {
            event.preventDefault();
        });
    }
}

Gui.prototype.linkButtonEvents = function() {
    var _this = this;

    this.ui_filter_artist.bind("click", function() {
        player.searchController.active_filters["artist"] = $(this).attr("checked");
    });

    this.ui_filter_track.bind("click", function() {
        player.searchController.active_filters["title"] = $(this).attr("checked");
    });

    this.ui_filter_duplicates.bind("click", function() {
        player.searchController.active_filters["doubles"] = $(this).attr("checked");
    });

    this.ui_prevbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-prev'
        }
    }).click(function () {
         player.playbackController.playPreviousTrack();
    });

     this.ui_nextbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-seek-next'
        }
    }).click(function () {
         player.playbackController.playNextTrack();
    });

     this.ui_playbutton.button({
        disabled: true,
        text: false,
        icons: {
            primary: 'ui-icon-play'
        }
    }).click(function () {
        if (player.playbackController.is_playing) {
             player.playbackController.pause();
        } else {
             player.playbackController.play();
        }
    });

    this.ui_shuffle_button.button({
        text: false,
        icons: {
            primary: 'ui-icon-shuffle'
        }
    }).click(function () {
        player.playbackController.shuffle();
    });

    this.ui_repeat_button.button({
        text: false,
        icons: {
            primary: 'ui-icon-refresh'
        }
    }).click(function () {
        var repeat_state = player.playbackController.toggleRepeat();
        _this.ui_repeat_status.html(_this.repeat_states[repeat_state]);
    });

    _this.ui_repeat_status.html(_this.repeat_states[player.playbackController.repeat_state]);

    $("#newplaylist input").keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
            player.listController.createPlaylist($(this).val());
        }
    });
};

Gui.prototype.linkSearchEvents = function() {
    var _this = this;
    this.ui_searchbutton.button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click(function () {
        if (_this.ui_search.val() != "") {
             player.searchController.performSearch($("#q").val());
        }
    });
    
    this.ui_search.keypress(function (e) {
        if ((e.which == 13) && ($(this).val() != "")) {
             player.searchController.performSearch($(this).val());
        }
    });

    this.ui_search_combo_button.click(function () {
        _this.ui_search_combo.toggle();
    });
};

Gui.prototype.linkSliderEvents = function() {
    this.ui_volumebar.slider({
        disabled: true,
        range: false,
        min: 0,
        max: 100,
        value: player.playbackController.volume,
        slide: function (event, ui) {
            player.playbackController.seekVolume(ui.value);
        }
    });

    this.ui_bar.progressbar({
        value: 0
    });

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

    if ((hash == "") || (hash == "#")) return;

    if (hash.indexOf("#search") == 0) {
        setTimeout(function () {
            player.searchController.performSearch(hash.replace("#search:", "").replace(new RegExp("\\+", 'g'), " "));
        }, 1000);
        return;
    }

    if (hash.indexOf("#love") == 0) {
        setTimeout(function () {
            player.listController.showList(player.listController.getListByName("other", "love"));
        }, 1000);
        return;
    }

    if (hash.indexOf("#recent") == 0) {
        setTimeout(function () {
            player.listController.showList(player.listController.getListByName("other", "recent"));
        }, 1000);
        //this.playlist.nowlistening();
        return;
    }

    if (hash.indexOf("#my") == 0) {
        setTimeout(function () {
            player.listController.showList(player.listController.getListByName("other", "my_vk"));
        }, 1000);
        return;
    }

    if (hash.indexOf("#playlist") == 0) {
        setTimeout(function () {
            player.listController.showList(player.listController.getListByName("playlists",
                                             hash.replace("#playlist:", "")));
        }, 1000);
        return;
    }

    if (hash.indexOf("#radio") == 0) {
        setTimeout(function () {
            player.listController.showList(player.listController.getListByName("radios",
                                             hash.replace("#radio:", "")));
        }, 1000);
        return;
    }
};

Gui.prototype.activateControls = function(track) {
    this.ui_durationlabel.html(track.duration);
    this.ui_slider.slider("option", "max", track.duration_ms * 100);
    this.ui_slider.slider("value", 0);
    this.ui_titlelabel.html("<b>" + track.artist + "</b><br />" + track.title);
    this.changeWindowTitle(track.artist + " - " + track.title);
    
    this.ui_volumebar.slider("option", "disabled", false);
    this.ui_prevbutton.button("option", "disabled", false);
    this.ui_playbutton.button("option", "disabled", false);
    this.ui_nextbutton.button("option", "disabled", false);
    this.ui_playbutton.button("option", "icons", { primary: 'ui-icon-pause' });
    this.ui_smallinfo.fadeIn("fast");
    this.changeFavicon("favicon_play.png");
};

Gui.prototype.pauseControls = function() {
    this.ui_playbutton.button("option", "icons", { primary: 'ui-icon-play' });
    this.changeFavicon("favicon_pause.png");
};

Gui.prototype.deactivateControls = function() {
    this.ui_durationlabel.html("");
    this.ui_slider.slider("option", "max", 0);
    this.ui_slider.slider("value", 0);
    this.ui_titlelabel.html("");
    this.changeWindowTitle("");

    this.ui_volumebar.slider("option", "disabled", true);
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
    this.changeHash("search:" + search_query.replace(new RegExp(" ", 'g'), "+"));
};

Gui.prototype.showLyrics = function(text) {
    text = text.replace(new RegExp("<",'g'), "").replace(new RegExp(">",'g'), "");
    gui.ui_lyrics_dialog.find("div").html(text);
    gui.ui_lyrics_dialog.fadeIn();
};