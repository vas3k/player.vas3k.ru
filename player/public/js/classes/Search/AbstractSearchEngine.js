function AbstractSearchEngine() {
    this.pidoffka = [ "•", "ღ", "|", "♪", "♫", "►", "★", "ι", "٩", "|̃̾", "•̃", "۶",
                      "♥", "●̮̮̃̾̃̾", "▼", "▲", "●", "➨", "Ѽ", "♥", "\\[", "\\]", "\\^", "mp3",
                       "♡", "•", "°", "♥", "\\*", "|", "vkontakte", "\\)\\)",
                      "☺", "∎", "✔" ];
}

AbstractSearchEngine.prototype.activate = function() {
    // Если требуется какая-то авторизация для использования
    // поиска, то она делается тут
    return true;
};

AbstractSearchEngine.prototype.filter = function(track) {
    // Применить фильтры к переданному треку и вернуть
    return track;
};

AbstractSearchEngine.prototype.search = function(query) {
    // Вернуть список треков - результат поиска
    return [];
};

AbstractSearchEngine.prototype.getById = function(id) {
    // Возвращает список треков по списку ID в поисковой системе
    return [];
};

AbstractSearchEngine.prototype.getByName = function(artist, title) {
    // Возвращает трек по исполнителю и названию
    return Track.dummy();
};