$(function () {
    player = new Player(false);
    player.initializeControls();
    player.initializeVK();
    player.initializeAuth();
    player.initializeByHash(document.location.hash);
    VK.UI.button('login_vk');

    $("#urlcode").val('<a href="' + document.location.href + '" onclick="javascript:window.open(\'' + document.location.href + '\', \'player.vas3k.ru\', \'top=300,left=200,menubar=0,toolbar=0,location=0,directories=0,status=0,scrollbars=0,resizable=0,width=600,height=110\');return false;">[ссылка]</a>');
});