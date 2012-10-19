function MusicSearchList(controller, name) {
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
extend(MusicSearchList, AbstractList);

MusicSearchList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

MusicSearchList.prototype.getList = function(successCallback) {
    // Выполнить поиск по this.name
    // если асинхронно - ничего не возвращает
    // и нужен каллбек. Если можно сразу - то
    // вызывает каллбек сама

    
    var _this = this;
    _this.list = [];

    this.controller.player.searchController.searchByQuery(this.name, function(new_list) {
        _this.list = _this.list.concat(new_list);
        successCallback(_this);
    });

//    // Двойной асинхронный поиск, ага. НУЖНО БОЛЬШЕ МУЗЫКИ
//    this.controller.player.searchController.searchByQuery(this.name, function(new_list) {
//        _this.list = _this.list.concat(new_list);
//        successCallback(_this);
//    });

    setTimeout(function() {
        gui.searchGui(_this.name);
    }, 0);

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

MusicSearchList.prototype.getMore = function(successCallback) {
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