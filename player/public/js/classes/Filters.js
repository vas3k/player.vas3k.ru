function FilterDoubles() {
    this.list = []; // каждый трек сравнивается - есть ли он в листе или нет
}

FilterDoubles.prototype.isApproved = function(track) {
    if (!track) return false;
    for (var i = 0; i < this.list.length; i++) {
        if ((this.list[i].artist.toLowerCase() == track.artist.toLowerCase()) &&
            (this.list[i].title.toLowerCase() == track.title.toLowerCase())) {
            return false;
        }
    }
    this.list.push(track);
    return true;
};


function FilterArtist(artist) {
    this.artist = artist.toLowerCase() || "";
}

FilterArtist.prototype.isApproved = function(track) {
    if (!track) return false;
    return track.artist.toLowerCase() == this.artist;
};



function FilterTitle(title) {
    this.title = title.toLowerCase() || "";
}

FilterTitle.prototype.isApproved = function(track) {
    if (!track) return false;
    return track.title.toLowerCase().indexOf(this.title) + 1;
};

