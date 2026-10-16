import unittest
import datetime
from unittest.mock import patch
import app

class EntitlementTests(unittest.TestCase):
    def test_unpaid_denied(self):
        self.assertFalse(app.allowed("ACTIVE",None))
    def test_cancelled_denied(self):
        self.assertFalse(app.allowed("CANCELLED","2026-10-09T00:00:00Z",now=1791504000))
    def test_old_payment_denied(self):
        self.assertFalse(app.allowed("ACTIVE","2020-01-01T00:00:00Z",now=1791504000))
    def test_recent_paid_allowed(self):
        now=1791504000
        date=datetime.datetime.fromtimestamp(now-86400,datetime.timezone.utc).isoformat()
        self.assertTrue(app.allowed("ACTIVE",date,now=now))
    def test_hmac_rejects_no_credentials(self):
        with app.app.test_request_context("/internal/entitlement/tenant1"):
            self.assertFalse(app.internal_authorised("tenant1"))
    def test_health_does_not_claim_live_without_configuration(self):
        with patch.object(app,"ENABLED",False):
            with app.app.test_client() as c:
                self.assertFalse(c.get("/health").json["paypal_live"])
    def test_no_subscription_without_configuration(self):
        with patch.object(app,"ENABLED",False):
            with app.app.test_client() as c:
                self.assertEqual(c.post("/api/subscribe",json={"tenant_id":"tenant1"}).status_code,503)
if __name__=="__main__":unittest.main()
