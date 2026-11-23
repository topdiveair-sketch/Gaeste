import os, tempfile, unittest
from unittest.mock import patch
import app

class TenantSecurityTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.old=app.DB
        app.DB=self.tmp.name+"/test.sqlite3"
        app.app.config["TESTING"]=True
        self.client=app.app.test_client()
    def tearDown(self):
        app.DB=self.old
        self.tmp.cleanup()
    def test_creation_rejects_anonymous(self):
        r=self.client.post("/internal/tenants",json={"tenant_id":"test01","display_name":"Testhaus"})
        self.assertEqual(r.status_code,401)
    def test_guest_unpaid_denied(self):
        r=self.client.get("/api/guest/test01")
        self.assertEqual(r.status_code,404)
    def test_invalid_tenant(self):
        self.assertFalse(app.valid_tenant("../other"))
        self.assertFalse(app.valid_tenant("gäste"))
    def test_signed_access_and_separate_guides(self):
        import hmac,hashlib,time
        with patch.dict(os.environ,{"RAINSOFT_INTERNAL_SECRET":"x"*40}):
            def headers(tenant):
                stamp=str(int(time.time()))
                sig=hmac.new(("x"*40).encode(),(tenant+":"+stamp).encode(),hashlib.sha256).hexdigest()
                return {"X-Rainsoft-Timestamp":stamp,"X-Rainsoft-Signature":sig}
            for tenant in ("haus1","haus2"):
                r=self.client.post("/internal/tenants",json={"tenant_id":tenant,"display_name":tenant},headers=headers(tenant))
                self.assertEqual(r.status_code,201)
            guide={"arrival":"Ab 15 Uhr","parking":"","wifi_info":"","house_rules":"","extras":""}
            r=self.client.put("/internal/tenants/haus1/guide",json=guide,headers=headers("haus1"))
            self.assertEqual(r.status_code,200)
            r=self.client.get("/internal/tenants/haus2/guide",headers=headers("haus2"))
            self.assertEqual(r.json["guest_info"]["arrival"],"")
            self.assertEqual(self.client.get("/internal/tenants/haus2/guide",headers=headers("haus1")).status_code,401)
if __name__=="__main__":unittest.main()
