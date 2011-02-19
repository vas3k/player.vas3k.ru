function LastfmAPI (player) {
    this.player = player;
};

LastfmAPI.prototype.scrobble = function (o_rly) {
    var player = this.player;
    var url = "/lastfm/nowplaying";
    if (o_rly) {
        url = "/lastfm/scrobble"
    }
    $.ajax({
        url: url,
        data: (player.controls.track),
        type: "POST",
        success: function (e) {
            //console.debug(e)
            //console.debug(player.controls.track);
        }
    });
};

LastfmAPI.prototype.getArtistInfo = function (track) {
    var player = this.player;
    $.ajax({
        url: "/lastfm/getartistinfo",
        data: ({
            track: JSON.stringify(track)
        }),
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                for (var key = 0; key < data["artist"]["similar"].length; key++) {
                    data["artist"]["similar"][key] = '<a href="#" onclick="player.vk_api.search(\'' + data["artist"]["similar"][key] + '\');">' + data["artist"]["similar"][key] + "</a>";
                }
                player.playlist.sidebarRight.find("#artist_title").html(data["artist"]["name"]);
                player.playlist.sidebarRight.find("#artist_url").html("<a href='" + data["artist"]["url"] + "'>" + data["artist"]["url"] + "</a>");
                player.playlist.sidebarRight.find("#artist_similar").html("<b>Похожие:</b> " + data["artist"]["similar"].join(", "));
                if (data["artist"]["image"][3]) {
                    player.playlist.sidebarRight.find("#artist_img").html("<a href='" + data["artist"]["url"] + "'><img src='" + data["artist"]["image"][3] + "' alt='' /></a>");
                } else {
                    player.playlist.sidebarRight.find("#artist_img").html("");
                }
                if (data["artist"]["bio"]) {
                    player.playlist.sidebarRight.find("#artist_text").html("<b>Биография:</b><br/>" + data["artist"]["bio"]);
                } else {
                    player.playlist.sidebarRight.find("#artist_text").html("");
                }
            } else {
                player.vk_api.getUserInfo();
            }
        },
        error: function() {
            player.vk_api.getUserInfo();
        }
    });
};