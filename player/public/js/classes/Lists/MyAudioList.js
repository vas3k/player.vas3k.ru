function MyAudioList(controller) {
    AbstractList.call(this); // copy methods
    this.controller = controller;
    this.list = [];
    this.is_deletable = false;
    this.is_addable = false;
    this.is_label = false;
    this.is_getmore = false;
    this.show_albums = false;
    this.show_header = false;
    this.show_deletetrack = false;
    this.id = "";
    this.label = "";
    this.name = "Мои аудиозаписи";
    this.icon = "/images/icons/my_audio.png";
}

extend(MyAudioList, AbstractList);

MyAudioList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

MyAudioList.prototype.getList = function(successCallback) {
    gui.changeHash("my");

    var _this = this;
    _this.showCallback = successCallback;

    if (this.list.length == 0) {
        this.controller.player.searchController.searchByUser(false, function(new_list) {
            _this.list = new_list;
            _this.showCallback(_this);
            debug("THIS LIST: " + _this.list);
        });
    } else {
        this.showCallback(this);
        return this.list;
    }
};