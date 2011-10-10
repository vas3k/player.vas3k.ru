function TrackOverflow() {} // бросается при выходе за границы списка треков

function AbstractList(controller) {
    this.controller = controller;
    this.current_index = 0;         // исключительно для getNext, getPrev, etc. PlaybackController сам хранит свой индекс
    this.list = [];                 // список объектов Track
    this.is_deletable = false;      // сам список можно удалить?
    this.is_addable = false;        // а добавить в него?
    this.is_label = false;          // есть ли синенькая фигня справа (текст настраивается через this.label)
    this.is_getmore = false;        // отображать ли кнопку Get Moar снизу списка
    this.show_albums = true;        // показывать ли панель альбомов
    this.show_header = true;        // показывать ли панель меню (с кнопочками-фильтрами)
    this.show_deletetrack = true;   // можно ли удалять треки из списка
    this.refreshFix = false;        // чтобы экран не мигал, если треки грузятся постепенно
    this.id = "";                   // обязательно для тех листов, в которые можно добавлять-удалять (очевидно)
    this.label = "";
    this.name = "Dummy";
    this.icon = "/images/icons/playlist.png";
}

AbstractList.globalId = 0;

AbstractList.prototype.getName = function() {
    // Название для сайдбара
     return this.name;
};

AbstractList.prototype.getList = function(successCallback) {
    // Реакция на клик в сайдбаре
    // В простейшем случае список сам хранит свои
    // треки и должен вызвать каллбек

    // Правило одно: если не переопределены методы remove,
    // то обязательно возвращать кешированные результаты.
    // Иначе, например, поиск выполнится еще раз и все насмарку.
    
    successCallback(this.list);
};

AbstractList.prototype.getMore = function(successCallback) {
    // Получает еще треки (если есть ограничение)
    return false;
};

AbstractList.prototype.getTrack = function(index) {
    // Вернуть объект трека по индексу
    if ((index < 0) || (index > this.list.length)) {
        throw new TrackOverflow();
    }
    this.current_index = index;
    return this.list[index];
};

AbstractList.prototype.getNext = function() {
    // Вернуть объект следующего после текущего трека
    if (this.current_index >= this.list.length) {
        throw new TrackOverflow();
    }
    this.current_index += 1;
    return this.list[this.current_index];
};

AbstractList.prototype.getPrev = function() {
    // Вернуть объект предыдущего относительно текущего
    if (this.current_index == 0) {
        throw new TrackOverflow();
    }
    this.current_index -= 1;
    return this.list[this.current_index];
};

AbstractList.prototype.getById = function(id) {
    // Вернуть объект трека с нужным ID (а не индексом),
    // возможно придется циклом перебирать все. Зависит от реализации.
    for(var i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
            return this.getTrack(i);
        }
    }
    return false;
};

AbstractList.prototype.push = function(track) {
    // Добавляет трек в список
    try {
        this.list.push(track);
        return true;
    } catch(e) {
        return false;
    }
};

AbstractList.prototype.pushAll = function(tracks) {
    // Добавляет много треков в список
    return false;
};

AbstractList.prototype.removeByIndex = function(index) {
    // Удаляет трек по индексу
    if ((this.current_index < 0) || (this.current_index > this.list.length)) {
        return false;
    }
    this.list.splice(index, 1);
    return true;
};

AbstractList.prototype.removeById = function(id) {
    // Удаляет трек по id
    for(var i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
            this.list.splice(i, 1);
            return true;
        }
    }
    return false;
};