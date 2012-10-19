function MusicGui() {
    this.ui_track_list = $("#music-tracks");
    this.ui_searchbox = $("#music-search");
    this.ui_search_list_buttons = $("#music-search-buttons");
    this.ui_lists = $("#music-lists");

    this.ui_checkbox_duplicates = $("#music-search-param-duplicates");
    this.ui_checkbox_artist = $("#music-search-param-artistonly");

    this.ui_history = $("#listening_history");
    this.ui_vk = $("#vk_audio");
    this.ui_vk_login = $("#vk_need_login");

    this.lists = {};
}

MusicGui.prototype.load = function() {
    player.listController.loadListeningHistory();
    if (player.searchController.search_engines["vk"].is_activated) {
        player.listController.loadVkAudio();
    } else {
        this.ui_vk.find(".list_loader").hide();
        this.ui_vk_login.show();
    }
};

MusicGui.prototype.showList = function(list_object) {
    gui.music_gui.lists["search_list"] = list_object;

    var tracklist = list_object.list;
    var html = "";
    for (var i = 0; i < tracklist.length; i++) {
        html += gui.list_gui.trackHtml(tracklist[i], {
            "show_deletetrack": list_object.show_deletetrack,
            "list": "search_list"
        });
    }

    gui.music_gui.ui_track_list.html(html); // Да-да :(
};

MusicGui.prototype.search = function(query) {
    query = query || this.ui_searchbox.val();
    if (!query) return;
    this.ui_searchbox.val(query);
    this.ui_lists.hide();
    this.ui_search_list_buttons.show();
    var _this = this;
    var search_list = player.searchController.musicSearch(query);
    search_list.getList(function(list_object) {
        if (_this.ui_checkbox_artist.is(':checked')) {
            player.listController.applyDoublesFilter(list_object);
        }
        if (_this.ui_checkbox_artist.is(':checked')) {
            player.listController.applyArtistFilter(list_object);
        }
        _this.showList(list_object);
    });

    setTimeout(function() {
        gui.changeHash("#music:" + query.replace(" ", "+"));
    }, 0);
};

MusicGui.prototype.updateListeningHistory = function(list_object) {
    gui.music_gui.lists["history_list"] = list_object;

    var html = "";
    for (var i in list_object.list) {
        html += gui.list_gui.trackHtml(list_object.list[i], {
            "show_deletetrack": false,
            "list": "history_list"
        });
    }
    gui.music_gui.ui_history.html(html);
};

MusicGui.prototype.updateVk = function(list_object) {
    gui.music_gui.lists["vk_list"] = list_object;

    var html = "";
    for (var i in list_object.list) {
        html += gui.list_gui.trackHtml(list_object.list[i], {
            "show_deletetrack": false,
            "list": "vk_list"
        });
    }
    gui.music_gui.ui_vk.html(html);
};

MusicGui.prototype.clearSearchBox = function() {
    this.ui_searchbox.val("");
    this.ui_lists.show();
    this.ui_track_list.html("");
    this.ui_search_list_buttons.hide();
};