function AlbumList(controller, artist, album) {
    AbstractList.call(this); // copy methods
    this.controller = controller;
    this.current_index = 0;
    this.list = [];
    this.is_deletable = false;
    this.is_addable = false;
    this.is_label = false;
    this.is_getmore = false;
    this.show_albums = true;
    this.show_header = true;
    this.show_deletetrack = false;
    this.refreshFix = true;
    this.id = "";
    this.label = "";
    this.artist = artist || "";
    this.album = album || "";
    this.name = this.artist + " " + this.album;
    this.icon = "/images/icons/playlist.png";
    this.raw_data = null;
    this.mbid = "";
    this.update_list_interval = null;
}

extend(AlbumList, AbstractList);

AlbumList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

AlbumList.prototype.getList = function(successCallback) {
    // Получить ajax'ом альбом, затем поиск по id'шникам
    // так как асинхронно - ничего не возвращает
    // и нужен каллбек. Если можно сразу - то
    // вызывает каллбек сама

    var _this = this;

    var data_processing = function (data) {
        var tracks = data["album"]["tracks"]["track"];
        if (!tracks) return;
        var track_id = 0;
        _this.update_list_interval = setInterval(function() {
            if (tracks[track_id]) {
                _this.controller.player.searchController.searchOneGoodTrack(_this.artist, tracks[track_id]["name"].toLowerCase(), function(track) {
                    _this.push(track);
                    successCallback(_this);
                });
            }
            track_id++;
            if (track_id > tracks.length) {
                clearInterval(_this.update_list_interval);
                _this.update_list_interval = null;
            }
        }, 300);
    };

    if (this.raw_data) {
        data_processing(this.raw_data);
    } else {
        $.ajax({
            url: "http://ws.audioscrobbler.com/2.0/",
            data: ({
                method: "album.getInfo",
                format: "json",
                autocorrect: "1",
                lang: "ru",
                api_key: "6f557f2c836b0fff474c3b6cfcf0ccf4",
                artist: _this.artist,
                album: _this.album
            }),
            type: "GET",
            crossDomain: true,
            dataType: "json",
            success: function(data) {
                data_processing(data);
            },
            error: function() {}
        });
    }
};

