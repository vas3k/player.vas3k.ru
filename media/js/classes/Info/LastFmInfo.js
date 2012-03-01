function LastFmInfo(track) {
    this.data = [];
    var _this = this;
    $.ajax({
        url: "/lastfm/getartistinfo",
        data: ({
            track: track.toJSON()
        }),
        type: "POST",
        dataType: "json",
        success: function (data) {
            _this.data = data;
        },
        error: function() {
            debug("Np artist info");
        }
    });
}

LastFmInfo.prototype.getContents = function() {
    for (var key = 0; key < this.data["artist"]["similar"].length; key++) {
        this.data["artist"]["similar"][key] = '<a href="#" onclick="alert(\'' + this.data["artist"]["similar"][key] + '\');">' + this.data["artist"]["similar"][key] + '</a>';
    }
    html =  '<strong id="artist_title">' + this.data["artist"]["name"] + '</strong><br />' +
            '<small id="artist_url"></small><br />' +
            '<span id="artist_img"><a href="' + this.data["artist"]["url"] + '" target="_blank">' +
            '<img src="' + this.data["artist"]["image"][3] + '" alt="" /></a></span><br />' +
            '<span id="artist_similar">' + this.data["artist"]["similar"].join(", ") + '</span><br /><br />' +
            '<span id="artist_text"><b>Биография:</b><br/>' + this.data["artist"]["bio"] + '</span><br />';
    return html;
};

extend(LastFmInfo, AbstractInfo);