$(function () {
    player = new Player(false);
    player.initializeControls();
    player.initializeVK();
    player.initializeAuth();
    player.initializeByHash(document.location.hash);
    VK.UI.button('login_vk');
    player.controls.vk_getuserinfo();

    player.playlist.container.css("height", $("body").height() - 102);
    player.playlist.sidebar.css("height", $("body").height() - 95);
    player.playlist.sidebarRight.css("height", $("body").height() - 115);
    $("#progress").css("width", $("body").width() - 500);

    var resizeTimer;
    $(window).resize(function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            player.playlist.container.css("height", $("body").height() - 102);
            player.playlist.sidebar.css("height", $("body").height() - 95);
            player.playlist.sidebarRight.css("height", $("body").height() - 115);
            $("#progress").css("width", $("body").width() - 500);
        }, 100);
    });
});