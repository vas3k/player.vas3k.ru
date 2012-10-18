function CoversController() {
}

CoversController.artists = {};

CoversController.getArtistCover = function(artist, apply_class) {
    if(this.artists[artist]) {
        setTimeout(function() {
            $(apply_class).attr("style", "background-image: url('" + CoversController.artists[artist].small_cover + "');");
        }, 0);
    } else {
        $.ajax({
            url: "http://ws.audioscrobbler.com/2.0/",
            data: ({
                method: "artist.getInfo",
                format: "json",
                lang: "ru",
                autocorrect: 1,
                api_key: player.last_fm_id,
                artist: artist
            }),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if (!data.error) {
                    CoversController.artists[artist].small_cover = data.artist.image[0]["#text"];
                    $(apply_class).attr("style", "background-image: url('" + CoversController.artists[artist].small_cover + "');");
                }
            },
            beforeSend: function() {
                CoversController.artists[artist] = {};
                CoversController.artists[artist].small_cover = "";
            },
            error: function() {}
        });
    }
};