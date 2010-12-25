function Player (is_mobile) {
    // Initialization
    this.is_mobile = is_mobile;
    this.controls = new Controls(is_mobile);
    this.playlist = new Playlist(is_mobile);
    this.controls.setPlaylist(this.playlist);
    this.playlist.setControls(this.controls);

    this.is_authorized = false;
    this.vk_id = 0;
    this.is_lastfm = false;

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
    this.controls.initialize(this.is_mobile);
};

Player.prototype.initializeVK = function () {
    var controls = this.controls;
    var player = this;
    VK.init({
        apiId: 1934554,
        nameTransportPath: "http://player.vas3k.ru/js/xd_receiver.html"
    });
    VK.Auth.getLoginStatus(function (r) {
        if (r.session) {
            $("#vk_search_login").hide();
            controls.is_logged_in = true;
            player.vk_id = r.session["mid"];
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

    if (hash.indexOf("#search") == 0) {
        this.controls.vk_search(hash.replace("#search:", "").replace(new RegExp("\\+", 'g'), " "));
    }

    if (hash.indexOf("#love") == 0) {
        this.playlist.love_list();
    }
    
    if (hash.indexOf("#playlist") == 0) {
        this.playlist.show(hash.replace("#playlist:", ""));
    }

    if (hash.indexOf("#track") == 0) {
        this.controls.vk_get_by_id([hash.replace("#track:", ""),], "playlist", true);
    }

    if (hash.indexOf("#last") == 0) {
        this.playlist.nowlistening();
    }

    if (hash.indexOf("#my") == 0) {
        this.controls.vk_getuserinfo(true);
    }
};

Player.prototype.initializeAuth = function () {
    if (getCookie("userhash")) {
        this.is_authorized = true;
    }

    if (getCookie("lastfm_session")) {
        this.is_lastfm = true;
    }

    if (this.is_authorized) {
        this.playlist.refresh();
        this.playlist.search_refresh();
        $("#button_register").hide();
        $("#button_login").hide();
    } else {
        $("#savedsearches").html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Нужно <a href='/register'>зарегаться</a>");
        $("#playlistlist").html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;или <a href='/login'>войти</a>");
        $("#button_exit").hide();
    }
};

Player.prototype.vk_login = function () {
    VK.Auth.login(function () {
            $("#vk_search_login").hide();
            controls.is_logged_in = true;
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

function getCookie(name) {
    var pattern = "(?:; )?" + name + "=([^;]*);?";
    var regexp  = new RegExp(pattern);

    if (regexp.test(document.cookie))
    return decodeURIComponent(RegExp["$1"]);

	    return false;
};