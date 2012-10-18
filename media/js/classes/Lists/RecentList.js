function RecentList(controller) {
    this.controller = controller;
    this.current_index = 0;
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
    this.name = "История";
    this.icon = "/images/icons/recent.png";
}

extend(RecentList, AbstractList);

RecentList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

RecentList.prototype.getList = function(successCallback) {
    // Получить ajax'ом весь плейлист, затем поиск по id'шникам
    // так как асинхронно - ничего не возвращает
    // и нужен каллбек. Если можно сразу - то
    // вызывает каллбек сама

    var _this = this;
    _this.showCallback = successCallback;

    // Получить поледние треки
    $.ajax({
        url: "/ajax/nowlistening",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                // Сделать список айдишников
                var ids = data.tracks.join(",");

                //  Получить песенки
                _this.controller.player.searchController.searchByIds(ids, function(new_list) {
                    _this.list = new_list;
                    _this.showCallback(_this);
                });
            }
        },
        error: function () {
        }
    });
};