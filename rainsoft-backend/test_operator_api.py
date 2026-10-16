import os, tempfile, unittest, time, hmac, hashlib
from unittest.mock import patch
import app

class OperatorApiTests(unittest.TestCase):
    def setUp(self):
        self.folder=tempfile.TemporaryDirectory()
        self.old=app.DB
        app.DB=self.folder.name+"/operator.sqlite3"
        self.client=app.app.test_client()
        self.env=patch.dict(os.environ,{"RAINSOFT_INTERNAL_SECRET":"a"*40})
        self.env.start()
    def tearDown(self):
        self.env.stop()
        app.DB=self.old
        self.folder.cleanup()
    def header(self,identity="admin"):
        stamp=str(int(time.time()))
        signature=hmac.new(("a"*40).encode(),(identity+":"+stamp).encode(),hashlib.sha256).hexdigest()
        return {"X-Rainsoft-Timestamp":stamp,"X-Rainsoft-Signature":signature}
    def test_anonymous_denied(self):
        self.assertEqual(self.client.get("/internal/operator/overview").status_code,401)
        self.assertEqual(self.client.get("/internal/operator/tenants").status_code,401)
    def test_cross_tenant_signature_denied(self):
        self.assertEqual(self.client.get("/internal/operator/overview",headers=self.header("other")).status_code,401)
    def test_admin_empty_overview(self):
        response=self.client.get("/internal/operator/overview",headers=self.header())
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["tenant_count"],0)
        self.assertEqual(response.json["paid_active_count"],0)
    def test_tenant_listing(self):
        with app.db() as c:
            c.execute("INSERT INTO tenants VALUES (?,?,?,?)",("sample","Pension Sample",'{}',int(time.time())))
        result=self.client.get("/internal/operator/tenants",headers=self.header())
        self.assertEqual(result.status_code,200)
        self.assertEqual(result.json["tenants"][0]["display_name"],"Pension Sample")
        self.assertFalse(result.json["tenants"][0]["access_active"])

if __name__=="__main__":unittest.main()
