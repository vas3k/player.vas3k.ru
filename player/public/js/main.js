$(function () {
    player = new Player();
    player.initializeControls();
    player.initializeVK();
    player.initializeByHash(document.location.hash);    
    VK.UI.button('login_vk');
});