function ArtistSearchList(controller, name) {
    AbstractList.call(this); // copy methods
    this.controller = controller || {};
    this.list = [];
    this.is_deletable = true;
    this.is_addable = false;
    this.is_label = false;
    this.is_getmore = true;
    this.show_albums = true;
    this.show_header = true;
    this.show_deletetrack = true;
    this.id = AbstractList.globalId++;
    this.name = name || "Unnamed";
    this.icon = "/images/icons/saved_searches.png";
    this.offset = 0;
}
extend(ArtistSearchList, AbstractList);

ArtistSearchList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

ArtistSearchList.prototype.getList = function(successCallback) {
    // Выполнить поиск по this.name
    // если асинхронно - ничего не возвращает
    // и нужен каллбек. Если можно сразу - то
    // вызывает каллбек сама

    gui.searchGui(this.name);
    
    var _this = this;
    if (this.list.length == 0) {
        this.controller.player.searchController.searchByQuery(this.name, function(new_list) {
            _this.list = new_list;
            successCallback(_this);
        });
    } else {
        successCallback(this);
        return this.list;
    }

    $.ajax({
        url: "/ajax/searchhistory/add/",
        type: "POST",
        data: ({ query: _this.name }),
        dataType: "json",
        success: function(data) {
        },
        error: function () {
        }
    });
};

ArtistSearchList.prototype.getMore = function(successCallback) {
    // Получает еще треки и вызывает каллбек для вывода
    var _this = this;
    this.offset += 200;
    this.controller.player.searchController.searchByQueryWithOffset(this.name, this.offset, 200, function(new_list) {
        for (var i = 0; i < new_list.length; i++) {
            _this.list.push(new_list[i]);
        }
        successCallback(_this);
    });
    return false;
};