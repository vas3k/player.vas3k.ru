function Track() {
    this.owner_id = "";
    this.aid = "";
    this.id = "";
    this.url = "";
    this.artist = "Unknown Artist";
    this.title = "Unknown Track";
    this.duration = "00:00";
    this.lyrics_id = 0;
}

Track.template  = '<li id="{{owner_id}}_{{aid}}" class="track" data-artist="{{artist}}" data-title="{{title}}" data-url="{{url}}">' +
            '<input type="checkbox"> ' +
            '<img src="/images/icons/play.png" alt=">" class="playbutton"> ' +
            '<span class="playlist_trackname"><b><span class="playlist_artist">{{artist}}</span></b> ' +
            '<span class="playlist_title">{{title}}</span></span> ' +
            '<span class="time">{{duration}}</span> ' +
            '{{#show_deletetrack}}<img src="/images/icons/delete.png" alt="X" title="Удалить трек" class="deletebutton"> {{/show_deletetrack}}' +
            '{{#lyrics_id}}<img src="/images/icons/lyrics.png" alt="X" data-lyrics="{{{lyrics_id}}}" title="Показать текст" class="lyricsbutton"> {{/lyrics_id}}' +
            '<a href="{{url}}"><img src="/images/icons/arrow_down.png" alt="X" title="Скачать mp3 (это не пермалинк, он меняется!)" class="downloadbutton" /></a> ' +
            '<img src="/images/icons/link.png" alt="X" title="Открыть в отдельном окне" class="linkbutton"> ' +
        '</li>';

Track.prototype.dummy = function() {
    if (!this.dummy_track) {
        this.dummy_track = new Track();
    }
    return this.dummy_track;
};

Track.prototype.toDict = function() {
    return { "owner_id": this.owner_id, "aid": this.aid, "id": this.id,
             "url": this.url, "artist": this.artist,
             "title": this.title, "duration": this.duration,
             "duration_ms": this.duration_ms, "lyrics_id": this.lyrics_id }
};

Track.prototype.toJSON = function() {
    return JSON.stringify(this.toDict());
};