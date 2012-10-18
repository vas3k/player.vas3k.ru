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
    this.saveToHistory();
};

InfoController.prototype.onSearch = function() {
    this.loadAlbums();
};

InfoController.prototype.saveToHistory = function() {
    var current_track = this.player.playbackController.current_track;
    var _this = this;
    $.ajax({
        url: "/ajax/add_to_nowlistening",
        data: {
            track: current_track.toJSON()
        },
        type: "POST",
        dataType: "json",
        success: function (data) {},
        error: function() {}
    });
};

InfoController.prototype.loadAlbums = function() {
//    var artist = this.player.searchController.query;
//    var api_key = this.player.last_fm_id;
//    gui.albums_gui.clearAlbums();
//    $.ajax({
//        url: "http://ws.audioscrobbler.com/2.0/",
//        data: ({
//            method: "artist.gettopalbums",
//            format: "json",
//            lang: "ru",
//            api_key: api_key,
//            artist: artist
//        }),
//        type: "GET",
//        dataType: "jsonp",
//        success: function (data) {
//            if (!data["topalbums"]["album"]) return;
//            for (var i = 0; i < data["topalbums"]["album"].length; i++) {
//                gui.albums_gui.appendAlbum(data["topalbums"]["album"][i]);
//            }
//            gui.albums_gui.initAlbums();
//        },
//        error: function() {
//        }
//    });
};

