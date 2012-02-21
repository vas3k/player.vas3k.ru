"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from routes import Mapper

def make_map(config):
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False
    map.explicit = False

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    # CUSTOM ROUTES HERE
    map.connect('/small', controller="main", action="track")
    map.connect('/small/', controller="main", action="track")
    map.connect('/register', controller="main", action="register")
    map.connect('/register/', controller="main", action="register")
    map.connect('/register_vk', controller="main", action="register_vk")
    map.connect('/register_vk/', controller="main", action="register_vk")
    map.connect('/login', controller="main", action="login")
    map.connect('/login/', controller="main", action="login")
    map.connect('/login_reg', controller="main", action="login_ajax")
    map.connect('/login_reg/', controller="main", action="login_ajax")
    map.connect('/logout', controller="main", action="logout")
    map.connect('/logout/', controller="main", action="logout")
    map.connect('/faq', controller="main", action="faq")
    map.connect('/faq/', controller="main", action="faq")
    map.connect('/vk/update_id', controller="main", action="update_vk_id")
    map.connect('/vk/update_id/', controller="main", action="update_vk_id")

    map.connect('/ajax/playlist/:pl_action', controller="ajax", action="playlist")
    map.connect('/ajax/searches/:se_action', controller="ajax", action="searches")
    map.connect('/ajax/love/:l_action', controller="ajax", action="love")
    map.connect('/ajax/banlist/:b_action', controller="ajax", action="banlist")
    map.connect('/nowlistening', controller="ajax", action="nowlistening")
    map.connect('/', controller='main', action='index')

    map.connect('/m', controller="mobile", action="index")
    map.connect('/m/', controller="mobile", action="index")
    map.connect('/m/menu', controller="mobile", action="menu")
    map.connect('/m/menu/', controller="mobile", action="menu")

    map.connect('/instruments/ban_stat', controller="instruments", action="ban_stat")

    map.connect('/{controller}/{action}')
    map.connect('/{controller}/{action}/{id}')



    return map
