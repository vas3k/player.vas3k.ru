from player.tests import *

class TestMobileController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='mobile', action='index'))
        # Test response...
