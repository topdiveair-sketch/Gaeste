import datetime,os,tempfile,unittest,time
from unittest.mock import patch
import app

class SubscriptionConflictTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.old=app.DB
        app.DB=self.tmp.name+"/test.db"
        with app.db() as c:
            c.execute("INSERT INTO tenants VALUES (?,?,?,?)",("haus1","Haus 1","{}",int(time.time())))
            c.execute("INSERT INTO subscriptions VALUES (?,?,?,?,?)",("I-ONE","haus1","ACTIVE",datetime.datetime.now(datetime.timezone.utc).isoformat(),int(time.time())))
        self.client=app.app.test_client()
    def tearDown(self):
        app.DB=self.old
        self.tmp.cleanup()
    def test_conflicting_subscription_rejected(self):
        details={"plan_id":"P-19","custom_id":"haus1","status":"ACTIVE","billing_info":{"last_payment":{"time":datetime.datetime.now(datetime.timezone.utc).isoformat()}}}
        event={"id":"EV-CHANGE","event_type":"BILLING.SUBSCRIPTION.ACTIVATED","resource":{"id":"I-TWO"}}
        with patch.object(app,"ready",return_value=True),patch.object(app,"verified",return_value=True),patch.object(app,"access_token",return_value="fake"),patch.object(app,"PLAN","P-19"),patch.object(app,"paypal",return_value=details):
            r=self.client.post("/webhooks/paypal",json=event)
        self.assertEqual(r.status_code,409)
        with app.db() as c:
            self.assertEqual(c.execute("SELECT paypal_id FROM subscriptions WHERE tenant_id='haus1'").fetchone()[0],"I-ONE")
if __name__=="__main__":unittest.main()
