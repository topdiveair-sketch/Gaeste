import os,time,hmac,hashlib,tempfile,unittest
from unittest.mock import patch
import app
class ReadinessTests(unittest.TestCase):
    def setUp(self):
        self.folder=tempfile.TemporaryDirectory()
        self.previous=app.DB
        app.DB=self.folder.name+"/readiness.sqlite3"
        self.client=app.app.test_client()
        self.env=patch.dict(os.environ,{"RAINSOFT_INTERNAL_SECRET":"x"*48,"PAYPAL_MODE":"sandbox"},clear=False)
        self.env.start()
    def tearDown(self):
        self.env.stop();app.DB=self.previous;self.folder.cleanup()
    def headers(self):
        stamp=str(int(time.time()))
        sig=hmac.new(("x"*48).encode(),("admin:"+stamp).encode(),hashlib.sha256).hexdigest()
        return {"X-Rainsoft-Timestamp":stamp,"X-Rainsoft-Signature":sig}
    def test_no_public_readiness(self):
        self.assertEqual(self.client.get("/internal/operator/readiness").status_code,401)
    def test_readiness_flags_missing_configuration(self):
        with patch.dict(os.environ,{"PAYPAL_CLIENT_ID":"","PAYPAL_PLAN_ID":"","PUBLIC_ORIGIN":""}):
            response=self.client.get("/internal/operator/readiness",headers=self.headers())
        self.assertEqual(response.status_code,200)
        self.assertFalse(response.json["sandbox_ready"])
        self.assertFalse(response.json["live_ready"])
        self.assertIn("PAYPAL_CLIENT_ID",response.json["missing_configuration"])
        self.assertNotIn("x"*48,str(response.json))
    def test_readiness_is_not_a_paypal_transaction(self):
        with patch.object(app,"paypal",side_effect=AssertionError("Should never call PayPal")):
            self.assertEqual(self.client.get("/internal/operator/readiness",headers=self.headers()).status_code,200)
if __name__=="__main__":unittest.main()
