function ScrobblerController(player) {
    this.player = player;
    this.events = {};
}

ScrobblerController.prototype.handleEvent = function(event) {
    try {
        this["on" + event]();
    } catch(e) {
        return false;
    }
};

ScrobblerController.prototype.onTrackJustBeforeFinish = function() {
    this.scrobble();
};

ScrobblerController.prototype.onTrackPlay = function() {
    this.nowplaying();
};

ScrobblerController.prototype.scrobble = function() {
    var track = this.player.playbackController.current_track;
    $.ajax({
        url: "/lastfm/scrobble",
        data: track.toDict(),
        type: "POST",
        success: function (e) {
        }
    });
};

ScrobblerController.prototype.nowplaying = function() {
    var track = this.player.playbackController.current_track;
    $.ajax({
        url: "/lastfm/nowplaying",
        data: track.toDict(),
        type: "POST",
        success: function (e) {
        }
    });
};