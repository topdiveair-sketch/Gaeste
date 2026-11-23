import os, unittest
from unittest.mock import patch
import app

class LiveGateTests(unittest.TestCase):
    def test_no_payment_credentials_fail_closed(self):
        with patch.object(app,"ENABLED",True),patch.dict(os.environ,{"APP_ENV":"production","PAYPAL_MODE":"live","PAYPAL_PLAN_ID":"","PAYPAL_CLIENT_ID":"","PAYPAL_CLIENT_SECRET":"","PAYPAL_WEBHOOK_ID":""}):
            self.assertFalse(app.ready())
    def test_sandbox_never_accepted_as_production(self):
        with patch.object(app,"ENABLED",True),patch.dict(os.environ,{"APP_ENV":"production","PAYPAL_MODE":"sandbox","PAYPAL_WEBHOOK_ID":"WH-X","PAYPAL_CLIENT_ID":"X","PAYPAL_CLIENT_SECRET":"X"}),patch.object(app,"PLAN","P-TEST"):
            self.assertFalse(app.ready())
    def test_live_never_accepted_as_test(self):
        with patch.object(app,"ENABLED",True),patch.dict(os.environ,{"APP_ENV":"test","PAYPAL_MODE":"live","PAYPAL_WEBHOOK_ID":"WH-X","PAYPAL_CLIENT_ID":"X","PAYPAL_CLIENT_SECRET":"X"}),patch.object(app,"PLAN","P-TEST"):
            self.assertFalse(app.ready())
if __name__=="__main__":unittest.main()
