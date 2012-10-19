function ListController(player) {

    this.player = player;
    this.shown_list = false;
    this.update_list_interval = undefined; // интервал, используется при загрузке потреково

    this.nowplaying = new NowPlayingList(this);

    this.lists = { "nowplaying": null,
                   "recent_searches": null,
                   "searches": null,
                   "playlists": null,
                   "other":
                        { "title": "Вкусняшки", "items": {
                                "my_vk": new MyAudioList(this),
                                "love":  new LoveList(this),
                                "recent": new RecentList(this)
                            }
                        },
                   "recommendations":
                        { "title": "Рекомендации", "items": [] },
        
                   "radios":
                        { "title": "Топ радио", "items": [] }
    };
}

ListController.prototype.handleEvent = function(event) {
    try {
        this["on" + event]();
    } catch(e) {
        return false;
    }
};

ListController.onTrackPlay = function() {
    this.saveToHistory();
};

ListController.prototype.loadHistorySearches = function() {
    var items = [];
    var _this = this;
    $.ajax({
        url: "/ajax/searchhistory/list",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                var list;
                for (var i = 0; i < data["lists"].length; i++) {
                    list = new SearchList(_this, data["lists"][i]);
                    list.is_deletable = false;
                    items[list.id] = list;
                }
                gui.user_gui.updateSearchHistory(items);
            } else {
                _this.player.fireEvent("SearchHistoryUpdateError");
            }
        },
        error: function () {
            _this.player.fireEvent("SearchHistoryUpdateError");
        }
    });
};

ListController.prototype.loadSavedSearches = function() {
    var items = [];
    var _this = this;
    $.ajax({
        url: "/ajax/searches/list",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                var list;
                for (var i = 0; i < data["lists"].length; i++) {
                    list = new SearchList(_this, data["lists"][i]);
                    list.id =  data["lists"][i]["_id"];
                    items[list.id] = list;
                }
                gui.user_gui.updateSavedSearches(items);
            } else {
                _this.player.fireEvent("SavedSearchesSidebarUpdateError");
            }
        },
        error: function () {
            _this.player.fireEvent("SavedSearchesSidebarUpdateError");
        }
    });
};

ListController.prototype.loadRecommendations = function() {
    var items = [];
    var _this = this;
    $.ajax({
        url: "/lastfm/getrecommended",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                var min = data["artists"].length < 10 ? data["artists"].length : 10;
                var list;
                for (var i = 0; i < min; i++) {
                    list = new RecommendList(_this, data["artists"][i]);
                    list.id = data["artists"][i];
                    items[i] = list;
                }
                gui.user_gui.updateRecommendations(items);
            } else {
                gui.user_gui.ui_recommendations.html("Необходимо <a href='#' onclick='return Player.toggleLastfm();'>авторизоваться</a> в last.fm");
                _this.player.fireEvent("RecommendationsUpdateError");
            }
        },
        error: function() {
            gui.user_gui.ui_recommendations.html("Ошибка сервера");
            _this.player.fireEvent("RecommendationsUpdateError");
        }
    });
};

ListController.prototype.loadBigRecommendations = function() {
    var items = [];
    var _this = this;
    $.ajax({
        url: "/lastfm/getrecommended",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                gui.recommendations_gui.updateRecommendations(data["artists"]);
            } else {
                gui.recommendations_gui.ui_recommend_covers.html("Необходимо авторизоваться в last.fm");
                _this.player.fireEvent("BigRecommendationsUpdateError");
            }
        },
        error: function() {
            gui.recommendations_gui.ui_recommend_covers.html("Ошибка сервера");
            _this.player.fireEvent("BigRecommendationsUpdateError");
        }
    });
};

ListController.prototype.loadListeningHistory = function(items) {
    var _this = this;
    setTimeout(function () {
        _this.getListByName("other", "recent").getList(gui.music_gui.updateListeningHistory);
    }, 0);
};

ListController.prototype.loadVkAudio = function(items) {
    var _this = this;
    setTimeout(function () {
        _this.getListByName("other", "my_vk").getList(gui.music_gui.updateVk);
    }, 0);
};

ListController.prototype.replaceNowplayingList = function(list_object) {
    this.nowplaying.list = list_object.list;
    this.nowplaying.current_index = list_object.current_index;
    gui.list_gui.updateNowplayingList(this.nowplaying);
};

ListController.prototype.addToNowplayingList = function(list_object) {
    this.nowplaying.list = this.nowplaying.list.concat(list_object.list);
    gui.list_gui.updateNowplayingList(this.nowplaying);
};
//
//ListController.prototype.showList = function(show_list) {
//    clearInterval(this.update_list_interval);
//    var _this = this;
//    setTimeout(function () {
//        _this.shown_list = show_list;
//        show_list.getList(gui.active_tab_gui.showList); // метод отрисовки передается как каллбек
//    }, 0);
//};

ListController.prototype.getListByName = function(type, name) {
    if (!type) return [];
    if (!name) {
        return this.lists[type];
    } else {
        return this.lists[type]["items"][name];
    }
};

ListController.prototype.getFirstTrack = function() {
    // Выбрать первый трек из nowplaying
    if (this.nowplaying.length == 0) {
        return false;
    }

    return this.nowplaying.getTrack(0);
};

ListController.prototype.getNextTrack = function() {
    // Выбрать следующий из играющего листа
    if (this.nowplaying.length == 0) {
        return false;
    }

    try {
        return this.nowplaying.getNext();
    } catch (e) { // TrackOverflow
        return false;
    }
};

ListController.prototype.getPreviousTrack = function() {
    // Выбрать предыдущий из играющего листа
    if (this.nowplaying.length == 0) {
        return false;
    }

    try {
        return this.nowplaying.getPrev();
    } catch (e) { // TrackOverflow
        return false;
    }
};

ListController.prototype.createPlaylist = function(name) {
    if (name) {
        var _this = this;
        $.ajax({
            url: "/ajax/playlist/new",
            data: ({ name: name }),
            type: "POST",
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    gui.playlists_gui.loadPlaylists();
                    _this.player.fireEvent("PlaylistCreated");
                } else {
                    _this.player.fireEvent("PlayistCreateError");
                }
            },
            error: function () {
                _this.player.fireEvent("PlayistCreateError");
            }
        });
    }
};

ListController.prototype.removePlaylist = function(id) {
    if (id) {
        var _this = this;
        $.ajax({
            url: "/ajax/playlist/remove",
            data: ({ id: id }),
            type: "POST",
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    gui.playlists_gui.loadPlaylists();
                    _this.player.fireEvent("PlaylistRemoved");
                } else {
                    _this.player.fireEvent("PlayistRemoveError");
                }
            },
            error: function () {
                _this.player.fireEvent("PlayistRemoveError");
            }
        });
    }
};

ListController.prototype.saveSearch = function(query) {
    var query = query || this.player.searchController.query;
    if (!query) return;
    var _this = this;
    $.ajax({
        url: "/ajax/searches/add",
        type: "POST",
        data: ({ name: query }),
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                _this.loadSavedSearches();
                _this.player.fireEvent("SearchCreated");
            } else {
                _this.player.fireEvent("SearchCreateError");
            }
        },
        error: function () {
            _this.player.fireEvent("SearchCreateError");
        }
    });

};

ListController.prototype.removeSavedSearch = function(id) {
    if (id) {
        var _this = this;
        $.ajax({
            url: "/ajax/searches/remove",
            type: "POST",
            data: ({ id: id }),
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    delete _this.lists["searches"]["items"][id];
                    _this.loadSavedSearches();
                    _this.player.fireEvent("SearchRemoved");
                } else {
                    _this.player.fireEvent("SearchRemoveError");
                }
            },
            error: function () {
                _this.player.fireEvent("SearchRemoveError");
            }
        });
    }
};

ListController.prototype.saveToHistory = function() {
    var current_track = player.playbackController.current_track;
    var _this = this;
    $.ajax({
        url: "/ajax/add_to_nowlistening",
        data: {
            track: current_track.toJSON()
        },
        type: "POST",
        dataType: "json",
        success: function (data) {},
        error: function() {}
    });
};

ListController.prototype.addToLists = function(list_name, list_object) {
    this.lists[list_name].items[list_object.id] = list_object;
//    gui.sidebar_gui.renderSidebar(this.lists);
};

ListController.prototype.addTo = function(type, id, track) {
    return this.lists[type].items[id].push(track);
};

ListController.prototype.applyFilter = function(list_object, filter) {
    var i = 0;
    while (i < list_object.list.length) {
        if (!filter.isApproved(list_object.list[i])) {
            list_object.removeByIndex(i);
        } else {
            i++;
        }
    }
};

ListController.prototype.applyDoublesFilter = function(list_object) {
    this.applyFilter(list_object, new FilterDoubles());
};

ListController.prototype.applyArtistFilter = function(list_object) {
    var artist = gui.ui_search.val();
    this.applyFilter(list_object, new FilterArtist(artist));
};

ListController.prototype.applyTitleFilter = function(list_object) {
    var title = gui.ui_search.val();
    this.applyFilter(list_object, new FilterTitle(title));
};

ListController.prototype.shuffle = function() {
    this.nowplaying.list.sort(function (a, b) {
        var max = 1;
        var min = -1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    });
    this.nowplaying.current_index = 0;
    gui.list_gui.updateNowplayingList(this.nowplaying);
};