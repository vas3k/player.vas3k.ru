function AlbumsGui() {
    this.ui_searchbox = $("#albums-search");
    this.ui_albums_view = $("#albums-view");
    this.ui_item_activator = $(".big-album-view-item .item-title");
    this.ui_top_buttons = $("#albums-search-buttons");

    this.album_template = '<div class="big-album-view-item" data-id="{{id}}">' +
            '<div class="item-cover" style="background-image: url(\'{{cover}}\');"></div>' +
            '<div class="item-title">{{title}}</div>' +
            '<div class="item-artist">{{artist}}</div>' +
            '<div class="item-list" id="album-list-{{id}}"></div>' +
        '</div>';

    this.lists = {};

    var _this = this;
    this.ui_item_activator.live("click", function() {
        _this.loadAlbumTracks($(this).parent());
    });
}

AlbumsGui.prototype.load = function() {

};

AlbumsGui.prototype.clearSearchBox = function() {
    gui.albums_gui.ui_searchbox.val("");
};

AlbumsGui.prototype.search = function(query) {
    query = query || this.ui_searchbox.val();
    if (!query) return;
    this.ui_searchbox.val(query);

    var _this = this;
    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: {
            method: "album.search",
            format: "json",
            lang: "ru",
            api_key: player.last_fm_id,
            album: query
        },
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if (data.error || !data.results.albummatches.album) {
                _this.ui_albums_view.html("По данному запросу нет альбомов");
                return;
            }
            var html = "";
            for (var i = 0; i < data.results.albummatches.album.length; i++) {
                var album = data.results.albummatches.album[i];
                html += Mustache.to_html(_this.album_template, {
                    "cover": album.image[3]["#text"],
                    "title": album.name,
                    "artist": album.artist,
                    "id": "album-" + i
                });
                _this.lists["album-" + i] = new AlbumList(player.listController, album.artist, album.name);
            }
            _this.ui_top_buttons.show();
            _this.ui_albums_view.html(html);
        },
        beforeSend: function() {
            _this.ui_albums_view.html('<div class="list_loader"></div>');
        },
        error: function() {
            _this.ui_albums_view.html("Ошибка при загрузке альбомов");
        }
    });

    setTimeout(function() {
        gui.changeHash("#albums:" + query.replace(" ", "+"));
    }, 0);
};

AlbumsGui.prototype.loadAlbumTracks = function(element) {
    var album_id = element.attr("data-id");
    var album_object = this.lists[album_id];
    if (!album_object) return;

    var _this = this;
    var list_element = element.find(".item-list");
    list_element.html('<div class="list_loader"></div>');
    album_object.getList(function(list_object) {
        list_element.html("");
        for(var i = 0; i < list_object.list.length; i++) {
            list_element.append(gui.list_gui.trackHtml(list_object.list[i], {
                "show_deletetrack": false,
                "list": album_id
            }));
        }
    });
};