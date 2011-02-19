function Radio(player) {
    this.player = player;
    this.current = null;
    this.radiolist = [
        { id: "pulsefm", title: "Pulse FM", url: "http://pulsefm.ru:8888/;stream.nsv" },
    ];

}

Radio.prototype.update = function() {
    var radio = this;
    html = "";
    this.player.playlist.list.html("");
    this.player.playlist.bigsearch.hide();
    this.player.playlist.error.hide();
    this.player.playlist.show_more.hide();
    for (var index = 0; index < radio.radiolist.length; index++) {
        element = radio.radiolist[index];
        html += '<li id="' + element.id +
                    '" class="track"' +
                    '" data-type="radio" data-id="' + element.id +
                    '" data-title="' + element.title +
                    '" data-url="' + element.url + '"><input type="checkbox"> <img src="/images/icons/play.png" alt=">" class="playbutton">' +
                    '<b>' + element.title + '</b>' +
                    '</li>';

    };
    this.player.playlist.list.html(html);
    this.bind();
};

Radio.prototype.bind = function() {
    var radio = this;
    var player = this.player;
    $(".playbutton").click(function () {
        player.controls.destroyCurrent();
        radio.current = radio.getNById($(this).parent().attr("data-id"));
        player.controls.setCurrent(radio.current);
        player.controls.playCurrent();
    });
};

Radio.prototype.getNById = function(id) {
    for (var i = 0; i < this.radiolist.length; i++) {
        if (this.radiolist[i].id == id) {
            return i;
        }
    }
};