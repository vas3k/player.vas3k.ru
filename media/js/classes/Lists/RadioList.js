function RadioList(controller, name) {
    this.controller = controller;
    this.current_index = 0;
    this.list = [];
    this.is_deletable = false;
    this.is_addable = false;
    this.is_label = false;
    this.is_getmore = false;
    this.show_albums = false;
    this.show_header = true;
    this.show_deletetrack = false;
    this.refreshFix = true;
    this.id = "";
    this.label = "";
    this.name = name || "";
    this.icon = "/images/icons/radio.png";
}

extend(RadioList, AbstractList);

RadioList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

RadioList.prototype.getList = function(successCallback) {
    gui.changeHash("radio:" + this.id);

    var _this = this;
    $.ajax({
        url: "/radio/get_radio",
        data: ({
            id: _this.id
        }),
        type: "GET",
        dataType: "json",
        success: function(data) {
            var tracks = data.tracks;
            if (!tracks) return;
            var track_id = 0;
            _this.controller.update_list_interval = setInterval(function() {
                if (tracks[track_id]) {
                    _this.controller.player.searchController.searchOneGoodTrack(tracks[track_id].artist.toLowerCase(), tracks[track_id].title.toLowerCase(), _this);
                    successCallback(_this);
                }
                track_id++;
                if (track_id > tracks.length) clearInterval(_this.controller.update_list_interval);
            }, 700);
        }
    });
};