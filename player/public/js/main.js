$(function () {
    VK.UI.button('login_vk');
    player = new Player(false);

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