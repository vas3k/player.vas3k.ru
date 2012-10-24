function PlaylistsGui() {
    this.ui_playlists_sidebar = $("#playlists_sidebar");
    this.ui_playlist_tracks = $("#playlist_tracks");
    this.ui_playlist_name = $("#playlist_name");
    this.ui_playlist_buttons = $("#playlist_buttons");
    this.ui_add_to_lists = $(".add_to_popup-list");

    this.ui_playlist_add_to_now = $("#playlist_add_to_now");

    this.ui_playlist_delete = $(".delete_playlist");
    this.ui_playlist_handler = $(".sidebar_view-title");

    this.lists = {};
    this.shown_playlist_id = "";

    this.playlist_template = '<div class="sidebar_view-item">' +
        '<div class="sidebar_view-img" style="background-image: url(\'/images/cover20.png\');"></div>' +
        '<div class="sidebar_view-title" data-id="{{id}}">{{title}}</div>' +
        '<div class="sidebar_view-subtitle">Треков: {{tracks}}</div>' +
        '<div class="sidebar_view-buttons delete_playlist" data-id="{{id}}">удалить</div>' +
    '</div>';

    this.ui_playlist_delete.live("click", function() {
        if (confirm("Удалить плейлист?")) {
            player.listController.removePlaylist($(this).attr("data-id"));
        }
    });

    var _this = this;
    this.ui_playlist_handler.live("click", function() {
        _this.loadPlaylist($(this).attr("data-id"));
    });

    this.loadPlaylists();
}

PlaylistsGui.prototype.load = function() {
    this.loadPlaylists();
    this.ui_playlist_tracks.html("");
    this.ui_playlist_name.html("");
    this.ui_playlist_add_to_now.hide();
};

PlaylistsGui.prototype.loadPlaylists = function() {
    var _this = this;
    $.ajax({
        url: "/ajax/playlist/list",
        type: "POST",
        dataType: "json",
        success: function(data) {
            if (data["status"] == "OK") {
                var html = "";
                _this.ui_add_to_lists.html('<div class="add_to_button" data-list-id="nowplaying">Список воспроизведения</div>');
                for (var i = 0; i < data["lists"].length; i++) {
                    var playlist = data["lists"][i];
                    html += Mustache.to_html(_this.playlist_template, {
                        "title": playlist.name,
                        "tracks": playlist.track_count,
                        "id": playlist._id
                    });

                    _this.lists["playlist-" + playlist._id] = new UserPlayList(player.listController, playlist.name);
                    _this.lists["playlist-" + playlist._id].id = playlist._id

                    _this.ui_add_to_lists.append('<div class="add_to_button" data-list-id="' + playlist._id + '">' + playlist.name + '</div>');
                }
                if (data["lists"].length == 0) {
                    _this.ui_add_to_lists.html("<span class='add_to_block'>Плейлисты отсутствуют. Добавьте их в соответствующем разделе.</span>");
                }
                _this.ui_playlists_sidebar.html(html);
            } else {
                _this.ui_playlists_sidebar.html("Ошибка при загрузке");
            }
        },
        beforeSend: function() {
            _this.ui_playlists_sidebar.html("");
        },
        error: function () {
            _this.ui_playlists_sidebar.html("Ошибка при загрузке");
        }
    });
};

PlaylistsGui.prototype.loadPlaylist = function(id) {
    if (!id) return;
    var playlist = this.lists["playlist-" + id];
    if (!playlist) return;

    var _this = this;
    playlist.getList(function(playlist_object) {
        _this.ui_playlist_name.html(playlist_object.name);
        _this.shown_playlist_id = id;

        var html = "";
        for(var i = 0; i < playlist_object.list.length; i++) {
            var track = playlist_object.list[i];
            track.list = "playlist-" + id;
            html += gui.list_gui.trackHtml(track, {
                "show_deletetrack": true,
                "show_sort": true,
                "list": "playlist-" + _this.shown_playlist_id
            });
        }
        _this.ui_playlist_tracks.html(html);
        _this.ui_playlist_add_to_now.show();
        _this.ui_playlist_buttons.show();
    });
};

PlaylistsGui.prototype.addToNowplayingList = function() {
    var list_object = gui.playlists_gui.lists["playlist-" + gui.playlists_gui.shown_playlist_id];
    player.listController.addToNowplayingList(list_object);
};