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

Track.template = '<div class="track" id="{{owner_id}}_{{aid}}" class="track" data-list="{{list}}" data-artist="{{artist}}" data-title="{{title}}" data-url="{{url}}">' +
    '<div class="track-edit"><input type="checkbox" /></div>' +
    '<div class="track-play"></div>' +
    '<div class="track-title">{{title}}</div>' +
    '<div class="track-artist">{{artist}}</div>' +
    '<div class="track-options">' +
    '{{#lyrics_id}}<div class="track-lyrics" title="Слова" data-lyrics="{{lyrics_id}}"></div>{{/lyrics_id}}' +
    '<div class="track-small" title="Открыть в маленьком плеере"></div>' +
    '{{#show_deletetrack}}<div class="track-delete" title="Удалить"></div>{{/show_deletetrack}}' +
    '{{#show_sort}}<div class="track-sort" title="Сортировка"></div>{{/show_sort}}' +
    '</div></div>';

Track.toClass = function(str) {
    return encodeURIComponent(str).replace(new RegExp("[%.]", 'g'), "").slice(0, 30);
};

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