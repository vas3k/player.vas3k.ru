function Player () {
    // Initialization
    this.controls = new Controls();
    this.playlist = new Playlist();
    this.controls.setPlaylist(this.playlist);
    this.playlist.setControls(this.controls);

    soundManager.url = '/swf/';
    soundManager.debugMode = false;
    soundManager.flashVersion = 9; // optional: shiny features (default = 8)
    soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
    // enable HTML5 audio support, if you're feeling adventurous.
    soundManager.useHTML5Audio = true;
    soundManager.useHighPerformance = true;

    soundManager.onready(function() {
        if (soundManager.supported()) {
        } else {
            $("#dialog-unsupported").dialog({
                height: 140,
                modal: true
            });
        }
    });
};

Player.prototype.initializeControls = function () {
    this.controls.initialize();
};

Player.prototype.initializeVK = function () {
    VK.init({
        apiId: 1934554,
        nameTransportPath: "http://p.thedevel.ru/js/xd_receiver.html"
    });
    VK.Auth.getLoginStatus(function (r) {
        if (r.session) {
                $("#vk_search_login").hide();            
        } else {
            $("#dialog-vk").dialog({
                height: 140,
                modal: true
            });
        }
    });
};

Player.prototype.initializeByHash = function (hash) {
    if ((hash == "") || (hash == "#")) return;

    if (hash.substr(0, 7) == "#search") {
        player.controls.vk_search(hash.replace("#search:", "").replace("+", " "));
    } else if (hash.substr(0, 6) == "#track") {
        // TODO: Show track
    } else if (hash.substr(0, 5) == "#list") {
        // TODO: Load playlist
    }
};

Player.prototype.vk_login = function () {
    VK.Auth.login(function () {
            $("#vk_search_login").hide();
        },
        VK.access.FRIENDS | VK.access.AUDIO
    );
};

function timeFormat (milliseconds) {
    milliseconds = parseInt(milliseconds);
    var minutes = parseInt(milliseconds / 1000 / 60);
    var seconds = parseInt(milliseconds / 1000 - minutes * 60);
    var timestr = "";
    timestr += (minutes < 10) ? "0" : "";
    timestr += minutes;
    timestr += ":";
    timestr += (seconds < 10) ? "0" : "";
    timestr += seconds;
    return timestr;
};