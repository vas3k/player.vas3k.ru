function RecommendationsGui() {
    this.ui_recommend_covers = $("#recommend_covers");
    this.ui_cover = this.ui_recommend_covers.find(".cover");
    this.cover_template = '<div class="cover" data-artist="{{title}}">' +
        '<div class="cover-image" style="background-image: url(\'{{{cover}}}\');"></div>' +
        '<div class="cover-title">' +
            '<span>{{title}}</span>' +
        '</div></div>';

    var _this = this;
    this.ui_cover.live("click", function() {
        _this.search($(this).attr("data-artist"));
    });
}

RecommendationsGui.prototype.load = function() {
    player.listController.loadBigRecommendations();
};

RecommendationsGui.prototype.search = function(query) {
    if (!query) return;
    gui.activateTab("artist");
    gui.artist_gui.search(query);
};

RecommendationsGui.prototype.updateRecommendations = function(list) {
    var html = "";
    for (var item_id in list) {
        var item = list[item_id];
        html += Mustache.to_html(this.cover_template, {
                "cover": item.cover_big,
                "title": item.name
            });
    }
    this.ui_recommend_covers.html(html);
};
