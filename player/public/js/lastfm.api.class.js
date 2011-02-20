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

LastfmAPI.prototype.getAlbums = function(artist) {
    var player = this.player;
    $.ajax({
        url: "/lastfm/getalbums",
        data: ({
            artist: artist
        }),
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                player.playlist.album_container.html("");
                var album;
                for (var i = 0; i < data["albums"].length; i++) {
                    album = data["albums"][i];
                    player.playlist.album_container.append('<img src="' + album["img"] + '" alt="' + album["name"] + '" data-artist="' + album["artist"] + '" data-album="' + album["name"] + '" />');
                }
                player.playlist.album_flow.init({ ImageFlowID: 'playlist_albums', reflections: false, imageCursor: 'pointer', slider: false,
                                                  aspectRatio: 6.0, imageFocusMax: 10, percentLandscape: 70, percentOther: 60,
                                                  onClick: function() { player.lastfm_api.getAlbumTracks($(this).attr("data-artist"), $(this).attr("data-album")); }});
                player.playlist.album_container.show();
            } else {
            }
        },
        error: function() {
        }
    });
};

LastfmAPI.prototype.getAlbumTracks = function(artist, album) {
    var player = this.player;
    $.ajax({
        url: "/lastfm/getalbumtracks",
        data: ({
            artist: artist,
            album: album
        }),
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                player.playlist.almost_tracklist = [];
                var track_id = 0;
                var all_tracks = data["tracks"].length;
                var fetchTracks = setInterval(function() {
                    if (data["tracks"][track_id]) {
                        player.vk_api.getOneTrack(artist, data["tracks"][track_id]);
                    }
                    track_id++;
                    if (track_id > all_tracks) clearInterval(fetchTracks);
                }, 400);
            } else {
                player.playlist.smallerror.html("Видимо для этого альбома last.fm больше не хочет давать нам список треков. Печально :(").fadeIn("slow").fadeOut(10000);
            }
        },
        error: function() {
            player.playlist.smallerror.html("Видимо для этого альбома last.fm больше не хочет давать нам список треков. Печально :(").fadeIn("slow").fadeOut(10000);
        }
    });
};

LastfmAPI.prototype.getRecommendations = function() {
    var player = this.player;
    player.playlist.loaders.recommend.show();
    $.ajax({
        url: "/lastfm/getrecommended",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (data["status"] == "OK") {
                player.playlist.recommendations_container.html("");
                var min = data["artists"].length < 7 ? data["artists"].length : 7;
                for (var i = 0; i < min; i++) {
                    player.playlist.recommendations_container.append('<li onclick="player.vk_api.search(\'' + data["artists"][i] + '\');"><span><img src="/images/icons/recommendations.png" alt=">" /> ' + data["artists"][i] + '</span></li>');
                }
            } else {
            }
            player.playlist.loaders.recommend.hide();
        },
        error: function() {
            player.playlist.loaders.recommend.hide();
        }
    });
};