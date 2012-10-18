function UserGui() {
    this.ui_recent_searches = $("#search_history");
    this.ui_saved_searches = $("#search_saved");
    this.ui_recommendations = $("#recommendations");
    this.ui_save_search_delete = $(".search_saved-delete");

    this.ui_searchbox = $("#user-search");

    this.user_list_template = '<li data-tpe="{{{data-tpe}}}" data-id="{{{data-id}}}">' +
        '<div class="item">' +
            '<span onclick="gui.user_gui.search(\'{{name}}\');">{{name}}</span>' +
            '{{#remove}} <small class="search_saved-delete" data-id="{{{id}}}">x</small>{{/remove}}' +
            '<br />' +
            '<small>{{date}}</small>' +
        '</div></li>';

    this.recommendation_template = '<div class="simular-artist" onclick="gui.recommendations_gui.search(\'{{name}}\');">' +
        '<div class="simular-artist-img" style="background-image: url(\'{{{cover}}}\');"></div>' +
        '<div class="simular-artist-title">{{name}}</div>' +
    '</div>';

    this.ui_save_search_delete.live("click", function() {
        player.listController.removeSavedSearch($(this).attr("data-id"));
        $($(this).parents("li")[0]).fadeOut();
    });
}

UserGui.prototype.load = function() {
    player.listController.loadHistorySearches();
    player.listController.loadSavedSearches();
    player.listController.loadRecommendations();
};

UserGui.prototype.search = function(query) {
    query = query || this.ui_searchbox.val();
    if (!query) return;
    gui.activateTab("music");
    gui.music_gui.search(query);
};

UserGui.prototype.updateSearchHistory = function(list) {
    var html = "";
    for (var item_id in list) {
        var item = list[item_id];
        html += Mustache.to_html(this.user_list_template, {
                "icon": item.icon,
                "name": item.name,
                "date": item.date,
                "remove": item.is_deletable,
                "id": item.id,
                "data-tpe": "recent_searches",
                "data-id": item_id
            });
    }
    this.ui_recent_searches.html(html);
};

UserGui.prototype.updateSavedSearches = function(list) {
    var html = "";
    for (var item_id in list) {
        var item = list[item_id];
        html += Mustache.to_html(this.user_list_template, {
                "icon": item.icon,
                "name": item.name,
                "date": item.date,
                "remove": item.is_deletable,
                "id": item.id,
                "data-tpe": "search_saved",
                "data-id": item_id
            });
    }
    this.ui_saved_searches.html(html);
};

UserGui.prototype.updateRecommendations = function(list) {
    var html = "";
    for (var item_id in list) {
        var item = list[item_id];
        html += Mustache.to_html(this.recommendation_template, {
                "icon": item.icon,
                "name": item.name,
                "cover": item.cover,
                "id": item.id,
                "data-tpe": "search_saved",
                "data-id": item_id
            });
    }
    this.ui_recommendations.html(html);
};
