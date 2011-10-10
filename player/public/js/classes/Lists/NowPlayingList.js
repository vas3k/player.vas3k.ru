function NowPlayingList(controller, by_list_object) {
    AbstractList.call(this); // copy methods
    this.controller = controller || {};
    this.current_index = by_list_object ? by_list_object.current_index : 0;
    this.list = by_list_object ? by_list_object.list : [];
    this.is_deletable = false;
    this.is_addable = false;
    this.is_label = false;
    this.show_albums = true;
    this.show_header = true;
    this.show_deletetrack = true;
    this.is_getmore = false;
    this.name = "Играет сейчас";
    this.icon = "/images/icons/nowplaying.png";
}

extend(NowPlayingList, AbstractList);

NowPlayingList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

NowPlayingList.prototype.getList = function(successCallback) {
    // Обычно для "сейчас проигрывается" ниче получать не надо
    successCallback(this);
};

NowPlayingList.prototype.getTrack = function(index) {
    // Вернуть объект трека по индексу
    debug("Get track: " + index);
    if ((index < 0) || (index > this.list.length)) {
        throw new TrackOverflow();
    }
    debug("Get track ok: " + index);
    this.current_index = index;
    return this.list[index];
};

NowPlayingList.prototype.getNext = function() {
    // Вернуть объект следующего после текущего трека
    if (this.current_index >= this.list.length) {
        throw new TrackOverflow();
    }
    this.current_index += 1;
    return this.list[this.current_index];
};

NowPlayingList.prototype.getPrev = function() {
    // Вернуть объект предыдущего относительно текущего
    if (this.current_index == 0) {
        throw new TrackOverflow();
    }
    this.current_index -= 1;
    return this.list[this.current_index];
};

NowPlayingList.prototype.getCurrent = function() {
    // Вернуть объект текущего трека
    if ((this.current_index < 0) || (this.current_index > this.list.length)) {
        throw new TrackOverflow();
    }
    return this.list[this.current_index];
};

NowPlayingList.prototype.getById = function(id) {
    // Вернуть объект трека с нужным ID (а не индексом),
    // возможно придется циклом перебирать все. Зависит от реализации.
    for(var i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
            return this.getTrack(i);
        }
    }
    return false;
};

NowPlayingList.prototype.getMore = function() {
    // Не нужно
    // Получает еще треки (если есть ограничение)
    return false;
};

NowPlayingList.prototype.push = function(track) {
    // Не нужно
    // Добавляет трек в список
    return false;
};

NowPlayingList.prototype.pushAll = function(tracks) {
    // Не нужно
    // Добавляет много треков в список
    return false;
};

NowPlayingList.prototype.remove = function(index) {
    // Удаляет трек по индексу
    if ((this.current_index < 0) || (this.current_index > this.list.length)) {
        throw new TrackOverflow();
    }
    this.list.splice(index,1);
    return this.getList();
};

NowPlayingList.prototype.love = function(index) {
    // Добавляет трек в любимые по индексу
    return false;
};

NowPlayingList.prototype.filter = function(filter) {
    // Фильтрует текущий список переданным фильтром
    return false;
};