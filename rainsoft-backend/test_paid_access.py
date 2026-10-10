"""No-network integration checks for subscription entitlement."""
import os, tempfile, unittest, datetime, time, sqlite3
from unittest.mock import patch
import app

class PaidAccessTests(unittest.TestCase):
    def setUp(self):
        self.folder=tempfile.TemporaryDirectory()
        self.prior=app.DB
        app.DB=self.folder.name+"/db.sqlite3"
        self.client=app.app.test_client()
        with app.db() as con:
            con.execute("INSERT INTO tenants VALUES (?,?,?,?)",("paid1","Paid Guest House",'{"arrival":"Welcome","parking":"","wifi_info":"","house_rules":"","extras":""}',int(time.time())))
    def tearDown(self):
        app.DB=self.prior
        self.folder.cleanup()
    def put_subscription(self,status,last,updated=None):
        with app.db() as con:
            con.execute("INSERT OR REPLACE INTO subscriptions VALUES (?,?,?,?,?)",("I-TEST","paid1",status,last,updated or int(time.time())))
    def test_verified_paid_active_allows_guest_content(self):
        now=datetime.datetime.now(datetime.timezone.utc)
        self.put_subscription("ACTIVE",now.isoformat())
        with patch.object(app,"ready",return_value=True):
            response=self.client.get("/api/guest/paid1")
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["guest_info"]["arrival"],"Welcome")
    def test_cancelled_denies_even_with_recent_payment(self):
        self.put_subscription("CANCELLED",datetime.datetime.now(datetime.timezone.utc).isoformat())
        with patch.object(app,"ready",return_value=True):
            self.assertEqual(self.client.get("/api/guest/paid1").status_code,404)
    def test_stale_paypal_reconciliation_denies_access(self):
        self.put_subscription("ACTIVE",datetime.datetime.now(datetime.timezone.utc).isoformat(),int(time.time())-90000)
        with patch.object(app,"ready",return_value=True):
            self.assertEqual(self.client.get("/api/guest/paid1").status_code,404)
    def test_missing_payment_denies_access(self):
        self.put_subscription("ACTIVE",None)
        with patch.object(app,"ready",return_value=True):
            self.assertEqual(self.client.get("/api/guest/paid1").status_code,404)
if __name__=="__main__":unittest.main()
