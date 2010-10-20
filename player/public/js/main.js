$(function () {
    player = new Player();
    player.initializeControls();
    player.initializeVK();
    player.initializeByHash(document.location.hash);
    player.initializeAuth();
    VK.UI.button('login_vk');

    var resizeTimer;
    $(window).resize(function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            player.playlist.container.css("height", $("body").height() - 102);
            player.playlist.sidebar.css("height", $("body").height() - 95);
            $("#progress").css("width", $("body").width() - 500);
        }, 100);
    });
});