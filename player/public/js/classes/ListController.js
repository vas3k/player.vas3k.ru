function ListController(player) {

    this.player = player;
    this.shown_list = false;
    this.update_list_interval = undefined; // интервал, используется при загрузке потреково
    this.lists = { "nowplaying": new NowPlayingList(this),
                   "recent_searches":
                        { "title": "Последние поиски", "items": {} },
                   "searches":
                        { "title": "Сохраненные поиски", "items": {} },
                   "playlists":
                        { "title": "Плейлисты", "items": {} },
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

    this.loadSavedSearches(this.lists["searches"]["items"]);
    this.loadPlaylists(this.lists["playlists"]["items"]);
    this.loadRecommendations(this.lists["recommendations"]["items"]);
    this.loadRadios(this.lists["radios"]["items"]);
    FilterBanlist.loadBanlist();
}

ListController.prototype.loadSavedSearches = function(items) {
    items = items || this.lists["searches"]["items"];
    var _this = this;
    $.ajax({
        url: "/ajax/searches/list",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                var list;
                for (var i = 0; i < data["lists"].length; i++) {
                    list = new SearchList(_this, data["lists"][i]["name"]);
                    list.id =  data["lists"][i]["_id"];
                    items[list.id] = list;
                }
                gui.sidebar_gui.renderSidebar(_this.lists);
            } else {
                _this.player.fireEvent("SidebarUpdateError");
            }
        },
        error: function () {
            _this.player.fireEvent("SidebarUpdateError");
        }
    });
};

ListController.prototype.loadPlaylists = function(items) {
    items = items || this.lists["playlists"]["items"];
    var _this = this;
    $.ajax({
        url: "/ajax/playlist/list",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                var list;
                for (var i = 0; i < data["lists"].length; i++) {
                    list = new UserPlayList(_this, data["lists"][i]["name"]);
                    list.id =  data["lists"][i]["_id"];
                    list.label = data["lists"][i]["track_count"];
                    items[list.id] = list;
                }
                gui.sidebar_gui.renderSidebar(_this.lists);
            } else {
                _this.player.fireEvent("SidebarUpdateError");
            }
        },
        error: function () {
            _this.player.fireEvent("SidebarUpdateError");
        }
    });
};

ListController.prototype.loadRecommendations = function(items) {
    items = items || this.lists["recommendations"]["items"];
    var _this = this;
    $.ajax({
        url: "/lastfm/getrecommended",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                var min = data["artists"].length < 7 ? data["artists"].length : 7;
                var list;
                for (var i = 0; i < min; i++) {
                    list = new RecommendList(_this, data["artists"][i]);
                    list.id = data["artists"][i];
                    items[i] = list;
                }
                gui.sidebar_gui.renderSidebar(_this.lists);
            } else {
                _this.player.fireEvent("SidebarUpdateError");
            }
        },
        error: function() {
            _this.player.fireEvent("SidebarUpdateError");
        }
    });
};

ListController.prototype.loadRadios = function(items) {
    items = items || this.lists["radios"]["items"];
    var _this = this;
    $.ajax({
        url: "/radio/get_list",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                var list;
                for (var i = 0; i < data.radios.length; i++) {
                    list = new RadioList(_this, data.radios[i].name);
                    list.id = data.radios[i].id;
                    items[list.id] = list;
                }
                gui.sidebar_gui.renderSidebar(_this.lists);
            } else {
                _this.player.fireEvent("SidebarUpdateError");
            }
        },
        error: function() {
            _this.player.fireEvent("SidebarUpdateError");
        }
    });
};

ListController.prototype.loadAlbumTracks = function(artist, title) {
    var album = new AlbumList(this, artist, title);
    this.shown_list = album;
    album.getList(gui.list_gui.showList);
};

ListController.prototype.setShownAsPlayingList = function() {
    if (!this.shown_list) return;
    this.lists["nowplaying"] = new NowPlayingList(this, this.shown_list);
};

ListController.prototype.showList = function(show_list) {
    clearInterval(this.update_list_interval);
    var _this = this;
    setTimeout(function () {
        _this.shown_list = show_list;
        show_list.getList(gui.showList); // метод отрисовки передается как каллбек
    }, 0);
};

ListController.prototype.showMore = function() {
    this.shown_list.getMore(gui.showList);
};

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
    var nowplaying = this.lists["nowplaying"];
    if (nowplaying.length == 0) {
        return false;
    }

    return nowplaying.getTrack(0);
};

ListController.prototype.getNextTrack = function() {
    // Выбрать следующий из играющего листа
    var nowplaying = this.lists["nowplaying"];
    if (nowplaying.length == 0) {
        return false;
    }

    try {
        return nowplaying.getNext();
    } catch (e) { // TrackOverflow
        return false;
    }
};

ListController.prototype.getPreviousTrack = function() {
    // Выбрать предыдущий из играющего листа
    var nowplaying = this.lists["nowplaying"];
    if (nowplaying.length == 0) {
        return false;
    }

    try {
        return nowplaying.getPrev();
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
                    gui.sidebar_gui.toggleCreatePlaylistForm();
                    _this.loadPlaylists();
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
                    delete _this.lists["playlists"]["items"][id];
                    _this.loadPlaylists();
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

ListController.prototype.saveSearch = function() {
    var query = this.player.searchController.query;
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

ListController.prototype.addToLists = function(list_name, list_object) {
    this.lists[list_name].items[list_object.id] = list_object;
    gui.sidebar_gui.renderSidebar(this.lists);
};

ListController.prototype.addTo = function(type, id, track) {
    return this.lists[type].items[id].push(track);
};

ListController.prototype.applyFilter = function(filter) {
    var i = 0;
    while (i < this.shown_list.list.length) {
        if (!filter.isApproved(this.shown_list.list[i])) {
            this.shown_list.removeByIndex(i);
        } else {
            i++;
        }
    }
    this.showList(this.shown_list);
};

ListController.prototype.applyDoublesFilter = function() {
    this.applyFilter(new FilterDoubles());
};

ListController.prototype.applyArtistFilter = function() {
    var artist = gui.ui_search.val();
    this.applyFilter(new FilterArtist(artist));
};

ListController.prototype.applyTitleFilter = function() {
    var title = gui.ui_search.val();
    this.applyFilter(new FilterTitle(title));
};

ListController.prototype.applyBanlistFilter = function() {
    this.applyFilter(new FilterBanlist());
};

ListController.prototype.applyRemoveSelected = function() {
    var list = this.shown_list;
    gui.list_gui.ui_playlist.find("input:checked").each(function () {
        list.removeById($(this).parent().attr("id"));
        $(this).parent().fadeOut();
    });
};

ListController.prototype.shuffle = function() {
    this.shown_list.list.sort(function (a, b) {
        var max = 1;
        var min = -1;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    });
    this.showList(this.shown_list);
};