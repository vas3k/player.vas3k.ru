"""The application's Globals object"""
from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options

from player.model import register_models
from mongokit import Connection

class Globals(object):
    """Globals acts as a container for objects available throughout the
    life of the application

    """

    def __init__(self, config):
        """One instance of Globals is created during application
        initialization and is available during requests via the
        'app_globals' variable

        """
        self.cache = CacheManager(**parse_cache_config_options(config))

        # For MongoDB
        self.connection = Connection(
          host = config['db_host'],
          port = int(config['db_port']),
        )
        self.db = self.connection[config['db_name']]
        self.connection.register(register_models)
