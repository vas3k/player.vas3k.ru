from player.tests import *

class TestAjaxController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='ajax', action='index'))
        # Test response...
