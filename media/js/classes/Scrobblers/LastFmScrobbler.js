function LastFmScrobbler() {
    
}

LastFmScrobbler.prototype.nowplaying = function(track) {
    $.ajax({
        url: "/lastfm/nowplaying",
        data: track.toDict(),
        type: "POST",
        success: function () {
            debug("Nowplaying success")
        },
        error: function() {
            debug("Nowplaying failed")
        }
    });
};

LastFmScrobbler.prototype.scrobble = function(track) {
    $.ajax({
        url: "/lastfm/scrobble",
        data: track.toDict(),
        type: "POST",
        success: function () {
            debug("Scrobble success")
        },
        error: function() {
            debug("Scrobble failed")
        }
    });
};