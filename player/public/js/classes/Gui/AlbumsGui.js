function AlbumsGui() {
    this.ui_albums_container = $("#playlist_albums");
    this.album_flow = new ImageFlow();
}

AlbumsGui.prototype.clearAlbums = function() {
    this.ui_albums_container.html("");
    this.ui_albums_container.hide();
};

AlbumsGui.prototype.initAlbums = function() {
    this.ui_albums_container.show();
    this.album_flow.init({ ImageFlowID: 'playlist_albums', reflections: false, imageCursor: 'pointer', slider: false,
                          aspectRatio: 6.0, imageFocusMax: 10, percentLandscape: 55, percentOther: 40,
                          onClick: function() {
                                player.listController.loadAlbumTracks($(this).attr("data-artist"), $(this).attr("data-album"));
                          }});
};

AlbumsGui.prototype.appendAlbum = function(album) {
    this.ui_albums_container.append('<img src="' + album["image"][2]["#text"] + '" alt="' + album["name"] + '" data-artist="' + album["artist"]["name"] + '" data-album="' + album["name"] + '" />');
};