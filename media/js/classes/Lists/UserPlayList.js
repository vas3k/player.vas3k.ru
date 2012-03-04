function UserPlayList(controller, name) {
    AbstractList.call(this); // copy methods
    this.controller = controller || {};
    this.list = [];
    this.is_deletable = true;
    this.is_addable = true;
    this.is_label = true;
    this.show_albums = false;
    this.show_header = true;
    this.show_deletetrack = true;
    this.label = "0";
    this.id = "";
    this.name = name || "Unnamed";
    this.icon = "/images/icons/playlist.png";
}

extend(UserPlayList, AbstractList);

UserPlayList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

UserPlayList.prototype.getList = function(successCallback) {
    // Получить ajax'ом весь плейлист, затем поиск по id'шникам
    // так как асинхронно - ничего не возвращает
    // и нужен каллбек. Если можно сразу - то
    // вызывает каллбек сама

    gui.changeHash("playlist:" + this.id);

    var _this = this;
    if (!_this.id) return;

    // Получить плейлист
    $.ajax({
        url: "/ajax/playlist/get",
        type: "POST",
        data: ({ id: _this.id }),
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                // Сделать список айдишников
                var ids = data.list.tracks.join(",");

                //  Получить песенки
                _this.controller.player.searchController.searchByIds(ids, function(new_list) {
                    _this.list = new_list;
                    successCallback(_this);
                    debug("THIS PLAYLIST: " + _this.list);
                });
            }
        },
        error: function () {
        }
    });
};

UserPlayList.prototype.push = function(tracks) {
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
        url: "/ajax/playlist/add",
        data: ({
            id: _this.id,
            tracks: JSON.stringify(tracks_ids)
        }),
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                _this.list.push(tracks);
            }
        }
    });
};

UserPlayList.prototype.removeById = function(track_id) {
    if (!track_id) return;
    var _this = this;
    $.ajax({
        url: "/ajax/playlist/delete",
        data: ({
            playlist_id: _this.id,
            track_id: track_id
        }),
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                for(var i = 0; i < _this.list.length; i++) {
                    if (_this.list[i].id === track_id) _this.list.splice(i, 1);
                }
            }
        }
    });
    return true;
};

UserPlayList.prototype.removeByIndex = function(index) {
    var track_id = this.list[index].id;
    return this.removeById(track_id);
};

UserPlayList.prototype.sorted = function(positions) {
    // Сохраним на сервере
    var _this = this;
    $.ajax({
        url: "/ajax/playlist/sorted",
        data: ({
            id: _this.id,
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