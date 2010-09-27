from player.tests import *

class TestLastfmController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='lastfm', action='index'))
        # Test response...
