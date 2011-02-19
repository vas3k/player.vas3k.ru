function Player (is_mobile) {
    // Initialization
    this.is_mobile = is_mobile;
    this.is_authorized = false;
    this.vk_id = 0;
    this.is_lastfm = false;
    this.search_query = "";
    try {
        this.storage = window.localStorage||window.globalStorage[document.domain];
    } catch(e) {
        this.storage = {};
    }

    soundManager.url = '/swf/';
    soundManager.debugMode = false;
    soundManager.flashVersion = 9; // optional: shiny features (default = 8)
    soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
    // enable HTML5 audio support, if you're feeling adventurous.
    soundManager.useHTML5Audio = true;
    soundManager.useHighPerformance = true;

    var player = this;
    soundManager.onready(function() {
        player.initializeAuth();
        player.initializeByHash(document.location.hash);
        if (soundManager.supported()) {
        } else {
            $("#dialog-unsupported").dialog({
                height: 140,
                modal: true
            });
        }
    });

    this.controls = new Controls(this);
    this.playlist = new Playlist(this);
    this.lastfm_api = new LastfmAPI(this);
    this.vk_api = new VkontakteAPI(this);
    //this.radio = new Radio(this);
};

Player.prototype.initializeByHash = function (hash) {
    if ((hash == "") || (hash == "#")) return;

    if (hash.indexOf("#search") == 0) {
        this.vk_api.search(hash.replace("#search:", "").replace(new RegExp("\\+", 'g'), " "));
        return;
    }

    if (hash.indexOf("#love") == 0) {
        this.playlist.loveList();
        return;
    }

    if (hash.indexOf("#playlist") == 0) {
        this.playlist.show(hash.replace("#playlist:", ""));
        return;
    }

    if (hash.indexOf("#track") == 0) {
        this.vk_api.getById([hash.replace("#track:", ""),], "playlist", true);
        return;
    }

    if (hash.indexOf("#last") == 0) {
        this.playlist.nowlistening();
        return;
    }

    if (hash.indexOf("#my") == 0) {
        this.vk_api.getUserInfo(true);
        return;
    }

    /*if (hash.indexOf("#radio") == 0) {
        this.radio.update();
        return;
    }*/
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
        this.playlist.searchRefresh();
        $("#button_register").hide();
        $("#button_login").hide();
        $(".forAnonymous").hide();
        $(".forNonAnonymous").show();
    } else {
        $(".only_auth").html("<div style='padding: 20px;'>Надо бы <a href='/register'>зарегаться</a>, а может <a href='/login'>просто войти</a>. Вот тогда точно ад и содомия.</div>");
        $(".forAnonymous").show();
        $(".forNonAnonymous").hide();
        $("#button_exit").hide();
    }
};

Player.prototype.changeFavicon = function(filename) {
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = '/images/' + filename;
    document.getElementsByTagName('head')[0].appendChild(link);
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