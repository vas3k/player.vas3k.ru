function SearchController(player) {
    this.query = "";
    this.default_search_engine = "vk";
    this.player = player;
    this.search_engines = {
        "vk": new VKSearchEngine(this)
    };
    this.active_filters = {
        "doubles": true,
        "artist": false,
        "title": false
    };
}

SearchController.prototype.handleEvent = function(event) {
    try {
        this["on" + event]();
    } catch(e) {
        return false;
    }
};

SearchController.prototype.onNoSidebarInfo = function() {
};
//
//SearchController.prototype.performSearch = function(query, search_engine_id) {
//    search_engine_id = search_engine_id || this.default_search_engine;
//    query = this.clearQuery(query);
//    this.query = query;
//    var search = new SearchList(this.player.listController, query);
//    search.is_deletable = false;
//    this.player.listController.addToLists("recent_searches", search);
//    this.player.listController.showList(search);
//    this.player.fireEvent("Search");
//};

SearchController.prototype.musicSearch = function(query, successCallback, search_engine_id) {
    search_engine_id = search_engine_id || this.default_search_engine;
    query = this.clearQuery(query);
    this.query = query;
    var search = new MusicSearchList(this.player.listController, query);
    search.is_deletable = false;
    return search;
};

SearchController.prototype.artistSearch = function(query, search_engine_id) {
    search_engine_id = search_engine_id || this.default_search_engine;
    query = this.clearQuery(query);
    this.query = query;
    var search = new ArtistSearchList(this.player.listController, query);
    search.is_deletable = false;
    return search;
};

SearchController.prototype.activate = function(search_engine_id) {
    search_engine_id = search_engine_id || this.default_search_engine;
    return this.search_engines[search_engine_id].activate();
};

SearchController.prototype.searchByQuery = function(query, successCallback, search_engine_id) {
    this.searchByQueryWithOffset(query, 0, 200, successCallback, search_engine_id);
};

SearchController.prototype.searchByQueryWithOffset = function(query, offset, count, successCallback, search_engine_id) {
    search_engine_id = search_engine_id || this.default_search_engine;
    this.query = this.clearQuery(query);
    var _this = this;
    this.search_engines[search_engine_id].search(this.query, offset, count, function(results) {
        var filters = [];

        if (_this.active_filters["doubles"]) filters.push(new FilterDoubles());
        if (_this.active_filters["artist"]) filters.push(new FilterArtist(query));
        if (_this.active_filters["title"]) filters.push(new FilterTitle(query));
        //filters.push(new FilterBanlist());

        var i = 0;
        var is_deleted = false;
        while (i < results.length) {
            is_deleted = false;
            try {
                for (var j = 0; j < filters.length; j++) {
                    if (!filters[j].isApproved(results[i])) {
                        results.splice(i, 1);
                        is_deleted = true;
                    }
                }
            } catch(e) {}
            if (!is_deleted) i++;
        }
        successCallback(results);
        _this.player.fireEvent("Search");
    });
};

SearchController.prototype.searchByIds = function(ids, successCallback, search_engine_id) {
    search_engine_id = search_engine_id ||this.default_search_engine;
    this.search_engines[search_engine_id].searchByIds(ids, successCallback);
};

SearchController.prototype.searchByUser = function(user_id, successCallback, search_engine_id) {
    search_engine_id = search_engine_id || this.default_search_engine;
    this.search_engines[search_engine_id].searchByUser(user_id, successCallback);
};

SearchController.prototype.clearQuery = function(query) {
    return query.replace(new RegExp("<",'g'), "").replace(new RegExp(">",'g'), "");
};

SearchController.prototype.searchOneGoodTrack = function(artist, title, successCallback, search_engine_id) {
    search_engine_id = search_engine_id ||this.default_search_engine;
    artist = artist.toLowerCase();
    title = title.toLowerCase();
    this.search_engines[search_engine_id].searchOneGoodTrack(artist, title, successCallback);
};

SearchController.prototype.getLyrics = function(lyrics_id, successCallback, search_engine_id) {
    search_engine_id = search_engine_id ||this.default_search_engine;
    this.search_engines[search_engine_id].getLyrics(lyrics_id, successCallback);
};