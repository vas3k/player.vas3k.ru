function InfoController(player) {
    this.player = player;
    this.info_template = '<strong id="artist_title">{{name}}</strong><br />' +
                        '<small id="artist_url"></small><br />' +
                        '<span id="artist_img">{{#image}}<a href="{{url}}"><img src="{{image}}" alt="" /></a>{{/image}}</span><br />' +
                        '<span id="artist_similar"><b>Похожие:</b> {{{simular}}}</span><br /><br />' +
                        '{{#bio}}<span id="artist_text"><b>Биография:</b><br/>{{{bio}}}</span><br />{{/bio}}';
}

InfoController.prototype.handleEvent = function(event) {
    try {
        this["on" + event]();
    } catch(e) {
        return false;
    }
};

InfoController.prototype.onTrackPlay = function() {
    this.loadNewInfo();
};

InfoController.prototype.onSearch = function() {
    this.loadAlbums();
};

InfoController.prototype.loadNewInfo = function() {
    var current_track = this.player.playbackController.current_track;
    var _this = this;
    $.ajax({
        url: "/lastfm/getartistinfo",
        data: ({
            track: current_track.toJSON()
        }),
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                var simular = "";
                for (var i = 0; i < data["artist"]["similar"].length; i++) {
                    simular += '<a href="#" onclick="player.searchController.performSearch(\'' + data["artist"]["similar"][i] + '\');">' + data["artist"]["similar"][i] + "</a> ";
                }
                
                gui.sidebar_gui.setInfoSidebar(Mustache.to_html(_this.info_template,
                    { "name": data["artist"]["name"], "url": data["artist"]["url"],
                        "image": data["artist"]["image"][3], "simular": simular, "bio": data["artist"]["bio"] }));
            } else {
                _this.player.fireEvent("NoSidebarInfo");
            }
        },
        error: function() {
            _this.player.fireEvent("NoSidebarInfo");
        }
    });
};

InfoController.prototype.loadAlbums = function() {
    var artist = this.player.searchController.query;
    var api_key = this.player.last_fm_id;
    gui.albums_gui.clearAlbums();
    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: ({
            method: "artist.gettopalbums",
            format: "json",
            lang: "ru",
            api_key: api_key,
            artist: artist
        }),
        type: "GET",
        crossDomain: true,
        dataType: "json",
        success: function (data) {
            for (var i = 0; i < data["topalbums"]["album"].length; i++) {
                gui.albums_gui.appendAlbum(data["topalbums"]["album"][i]);
            }
            gui.albums_gui.initAlbums();
        },
        error: function() {
        }
    });
};

