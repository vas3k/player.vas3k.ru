function SidebarGui() {
    this.ui_mainlist = $("#sidebarMainMenu");
    this.ui_recent_searches = $("#lastsearches");
    this.ui_searches = $("#savedsearches");
    this.ui_playlists = $("#playlistlist");
    this.ui_other = $("#otherlist");
    this.ui_recommendations = $("#recommendationslist");
    this.ui_radios = $("#radiolist");
    this.ui_create_playlist_form = $('#newplaylist');
    this.sidebar_item_template = '<li>' +
                '{{#label}}<span class="sidebarCount">{{label}}</span>{{/label}}' +
                '{{#add}}<small class="sidebarAdd" data-id="{{{id}}}"><img src="/images/icons/action_add.png" alt="add" /></small>{{/add}}' +
                '<img src="{{icon}}" alt="" /> <span class="sidebarName">{{name}}</span> ' +
                '{{#remove}}<small class="sidebarDelete" data-id="{{{id}}}"><img src="/images/icons/action_delete.png" alt="del" /></small>{{/remove}}' +
            '</li>';

    this.ui_info_sidebar = $("#rightSidebar .innertube");
    this.ui_dir_class = $(".dir");
    this.linkSidebarItems();
}

SidebarGui.prototype.linkSidebarItems = function() {
    function on_sidebar_click() {
        var list = player.listController.getListByName($(this).attr("data-tpe"), $(this).attr("data-id"));
        player.listController.showList(list);
    }

    this.ui_mainlist.find("li").live("click", on_sidebar_click);

    this.ui_recent_searches.find("li").live("click", on_sidebar_click);

    this.ui_searches.find("li").live("click", on_sidebar_click);

    this.ui_searches.find(".sidebarDelete").live("click", function (event) {
        if (confirm("Правда удалить сохраненный поиск?")) {
            player.listController.removeSavedSearch($(this).attr("data-id"));
        }
        event.stopPropagation();
    });

    this.ui_playlists.find("li").live("click", on_sidebar_click);

    this.ui_playlists.find(".sidebarDelete").live("click", function (event) {
        if (confirm("Правда удалить плейлист?")) {
            player.listController.removePlaylist($(this).attr("data-id"));
            $(this).parent().fadeOut();
        }
        event.stopPropagation();
    });

    this.ui_playlists.find(".sidebarAdd").live("click", function (event) {
        var list = player.listController.shown_list;
        if (!list) return;
        var tracks = [];

        gui.list_gui.ui_playlist.find("input:checked").each(function () {
            var track = list.getById($(this).parent().attr("id"));
            tracks.push(track);
        });

        var playlist_id = $(this).attr("data-id");
        player.listController.addTo("playlists", playlist_id, tracks);
        player.listController.loadPlaylists();
        event.stopPropagation();
    });

    this.ui_other.find("li").live("click", on_sidebar_click);

    this.ui_other.find(".sidebarAdd").live("click", function (event) {
        var list = player.listController.shown_list;
        if (!list) return;
        var tracks = [];

        gui.list_gui.ui_playlist.find("input:checked").each(function () {
            var track = list.getById($(this).parent().attr("id"));
            tracks.push(track);
        });

        player.listController.addTo("other", "love", tracks);
        event.stopPropagation();
    });
    
    this.ui_recommendations.find("li").live("click", on_sidebar_click);

    this.ui_radios.find("li").live("click", on_sidebar_click);

    this.ui_dir_class.live("click", function () {
        $(this).parent().find("ul").slideToggle();
    });
};

SidebarGui.prototype.renderSidebar = function(lists) {
    if (!lists) return;
    this.ui_mainlist.html("");
    this.ui_recent_searches.html("");
    this.ui_searches.html("");
    this.ui_playlists.html("");
    this.ui_other.html("");
    this.ui_recommendations.html("");
    this.ui_radios.html("");
    for (var key in lists) {
        if (lists[key] instanceof AbstractList) {
            var item = lists[key];
            var li = $(Mustache.to_html(this.sidebar_item_template,
                {
                    "icon": item.icon,
                    "name": item.getName(),
                    "label": item.is_label ? item.label : false,
                    "remove": item.is_deletable,
                    "add": item.is_addable,
                    "id": item.id
                }));
            li.attr("data-tpe", key);
            //li.click(function () { debug(lists[key]); player.listController.showList(lists[key]); });
            this.ui_mainlist.append(li);
        } else {
            for (var item_id in lists[key]["items"]) {
                var item = lists[key]["items"][item_id];
                var li = $(Mustache.to_html(this.sidebar_item_template,
                    {
                        "icon": item.icon,
                        "name": item.getName(),
                        "label": item.is_label ? item.label : false,
                        "remove": item.is_deletable,
                        "add": item.is_addable,
                        "id": item.id
                    }));
                li.attr("data-tpe", key);
                li.attr("data-id", item_id);
                this['ui_' + key].append(li);
            }
        }
    }
};

SidebarGui.prototype.setInfoSidebar = function(text) {
    this.ui_info_sidebar.html(text);
};

SidebarGui.prototype.showUserInfoSidebar = function(user) {
    html = '<span id="artist_title">' + user.first_name + ' ' + user.last_name + '</span><br /><span id="artist_img"><img src="' + user.photo_big + '" alt=""></span>';
    gui.sidebar_gui.ui_info_sidebar.html(html);
};

SidebarGui.prototype.toggleCreatePlaylistForm = function() {
    this.ui_create_playlist_form.find("input").html("");
    this.ui_create_playlist_form.toggle('fast');
};