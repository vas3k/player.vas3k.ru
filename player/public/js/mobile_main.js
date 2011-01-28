$(function () {
    player = new Player(true);
    player.initializeControls();
    player.initializeVK();
    player.initializeByHash(document.location.hash);
    player.initializeAuth();
    //VK.UI.button('login_vk');

    $(".show_menu").click(function () {
        $('#playlist').hide();
        $('#playlistlist').hide();
        $('#savedsearches').hide();
        $('#menu').slideDown('slow');
        $("#nav_icons img").hide("fast");
    });

    $(".show_music").click(function () {
        $('#playlist').show();
        $('#menu').slideToggle('slow');
        $("#nav_icon_music").show("fast");
    });

    $(".show_searches").click(function () {
        player.playlist.searchRefresh();
        $('#savedsearches').show();
        $('#menu').slideToggle('slow');
        $("#nav_icon_searches").show("fast");
    });

    $(".show_playlists").click(function () {
        player.playlist.refresh();
        $('#playlistlist').show();
        $('#menu').slideToggle('slow');
        $("#nav_icon_pl").show("fast");
    });

    $(".show_love").click(function () {
        player.playlist.loveList();
        $('#playlist').show();
        $('#menu').slideToggle('slow');
        $("#nav_icon_love").show("fast");
    });

    // resizing
    var screen_height = $("body").height();
    var screen_width = $("body").width();
    $("#wrapper").height(screen_height).width(screen_width);
    $("#search").width(screen_width);
    $("#navigation").width(screen_width);
    $("#controls").width(screen_width);
    $("#playlist").width(screen_width).height(screen_height - 200);
    $("#menu").width(screen_width).height(screen_height - 200);
    $("#playlistlist").width(screen_width).height(screen_height - 200);
    $("#savedsearches").width(screen_width).height(screen_height - 200);

    var resizeTimer;
    $(window).resize(function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            var screen_height = $("body").height();
            var screen_width = $("body").width();
            $("#wrapper").height(screen_height).width(screen_width);
            $("#search").width(screen_width);
            $("#navigation").width(screen_width);
            $("#controls").width(screen_width);
            $("#playlist").width(screen_width).height(screen_height - 200);
            $("#menu").width(screen_width).height(screen_height - 200);
            $("#playlistlist").width(screen_width).height(screen_height - 200);
            $("#savedsearches").width(screen_width).height(screen_height - 200);
        }, 100);
    });
});