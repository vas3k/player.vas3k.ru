function LoveList(controller) {
    AbstractList.call(this); // copy methods
    this.controller = controller;
    this.current_index = 0;
    this.list = [];
    this.is_deletable = false;
    this.is_addable = true;
    this.is_label = false;
    this.is_getmore = false;
    this.show_albums = false;
    this.show_header = false;
    this.show_deletetrack = true;
    this.id = "";
    this.label = "";
    this.name = "Любимые";
    this.icon = "/images/icons/love.png";
}

extend(LoveList, AbstractList);

LoveList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

LoveList.prototype.getList = function(successCallback) {
    // Получить ajax'ом весь плейлист, затем поиск по id'шникам
    // так как асинхронно - ничего не возвращает
    // и нужен каллбек. Если можно сразу - то
    // вызывает каллбек сама
    gui.changeHash("love");

    var _this = this;
    _this.showCallback = successCallback;

    // Получить список любимых
    $.ajax({
        url: "/ajax/love/list",
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
                    debug("LOVE: " + _this.list);
                });
            } else {
                alert(data["message"]);
            }
        },
        error: function () {
        }
    });
};

LoveList.prototype.push = function(tracks) {
    if (!tracks) return;
    var tracks_ids = [];
    if (tracks instanceof Array) {
        for (var i = 0; i < tracks.length; i++) {
            tracks_ids.push(tracks[i].id);
        }
    } else {
        try {
            tracks_ids.push(tracks.id);
        } catch(e) {
            return;
        }
    }
    var _this = this;
    $.ajax({
        url: "/ajax/love/add",
        type: "POST",
        data:  ({
            tracks: JSON.stringify(tracks_ids)
        }),
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                _this.list.push(tracks);
            } else {
                alert(data["message"]);
            }
        }
    });
};

LoveList.prototype.removeById = function(id) {
    if (id) {
        var _this = this;
        $.ajax({
            url: "/ajax/love/remove",
            type: "POST",
            data: ({ id: id }),
            dataType: "json",
            success: function(data) {
                if (data["status"] == "OK") {
                    for(var i = 0; i < _this.list.length; i++) {
                        if (_this.list[i].id === id) _this.list.splice(i, 1);
                    }
                } else {
                    alert(data["message"]);
                }
            }
        });
    }
    return true;
};

LoveList.prototype.removeByIndex = function(index) {
    var track_id = this.list[index].id;
    return this.removeById(track_id);
};

LoveList.prototype.sorted = function(positions) {
    // Сохраним на сервере
    $.ajax({
        url: "/ajax/love/sorted",
        data: ({
            sorted: JSON.stringify(positions)
        }),
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
            }
        }
    });

    // Переформируем список на фронтенде
    AbstractList.prototype.sorted.call(this, positions);
};