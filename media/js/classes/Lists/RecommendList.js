function RecommendList(controller, params) {
    this.controller = controller;
    this.current_index = 0;
    this.list = [];
    this.is_deletable = false;
    this.is_addable = false;
    this.is_label = false;
    this.is_getmore = false;
    this.show_albums = false;
    this.show_header = true;
    this.show_deletetrack = false;
    this.id = "";
    this.label = "";
    this.name = params["name"] || "";
    this.cover = params["cover"] || "";
    this.icon = "/images/icons/recommendations.png";
}

extend(RecommendList, AbstractList);

RecommendList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

RecommendList.prototype.getList = function(successCallback) {
    gui.searchGui(this.name);

    var _this = this;
    if (this.list.length == 0) {
        this.controller.player.searchController.searchByQuery(this.name, function(new_list) {
            _this.list = new_list;
            successCallback(_this);
        });
    } else {
        this.showCallback(this);
        return this.list;
    }
};