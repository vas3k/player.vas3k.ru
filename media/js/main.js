function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

function debug(msg) {
    //console.debug(msg);
}

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
}

function getCookie(name) {
    var pattern = "(?:; )?" + name + "=([^;]*);?";
    var regexp  = new RegExp(pattern);

    if (regexp.test(document.cookie))
        return decodeURIComponent(RegExp["$1"]);
}

$(function () {
    $.support.cors = true;
//    VK.UI.button('vk_login');
    player = new Player();
    gui = new Gui();
});