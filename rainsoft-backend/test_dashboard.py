import os,tempfile,unittest,time,hmac,hashlib
from unittest.mock import patch
import app

class DashboardTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.old=app.DB
        app.DB=self.tmp.name+"/db.sqlite3"
        app.app.config.update(TESTING=True,SECRET_KEY="test-session-secret")
        self.client=app.app.test_client()
        self.env=patch.dict(os.environ,{"RAINSOFT_INTERNAL_SECRET":"s"*40,"PUBLIC_ORIGIN":"http://localhost:8080"})
        self.env.start()
        stamp=str(int(time.time()))
        self.headers={"X-Rainsoft-Timestamp":stamp,"X-Rainsoft-Signature":hmac.new(("s"*40).encode(),("kunde1:"+stamp).encode(),hashlib.sha256).hexdigest()}
        assert self.client.post("/internal/tenants",headers=self.headers,json={"tenant_id":"kunde1","display_name":"Gastgeber"}).status_code==201
        assert self.client.post("/internal/tenants/kunde1/password",headers=self.headers,json={"password":"long-enough-password-123"}).status_code==200
        self.origin={"Origin":"http://localhost:8080"}
    def tearDown(self):
        self.env.stop()
        app.DB=self.old
        self.tmp.cleanup()
    def test_login_wrong_password(self):
        self.assertEqual(self.client.post("/api/host/kunde1/login",headers=self.origin,json={"password":"wrong"}).status_code,401)
    def test_login_correct_and_edit(self):
        self.assertEqual(self.client.post("/api/host/kunde1/login",headers=self.origin,json={"password":"long-enough-password-123"}).status_code,200)
        data={"arrival":"Check-in 15 Uhr","parking":"","wifi_info":"","house_rules":"","extras":""}
        self.assertEqual(self.client.put("/api/host/kunde1/guide",headers=self.origin,json=data).status_code,200)
        self.assertEqual(self.client.get("/api/host/kunde1/guide").json["guest_info"]["arrival"],"Check-in 15 Uhr")
        self.assertEqual(self.client.get("/api/host/kunde2/guide").status_code,401)
    def test_reject_cross_origin(self):
        self.assertEqual(self.client.post("/api/host/kunde1/login",headers={"Origin":"https://evil.invalid"},json={"password":"long-enough-password-123"}).status_code,401)
    def test_subscribe_disabled_without_live_setup(self):
        self.client.post("/api/host/kunde1/login",headers=self.origin,json={"password":"long-enough-password-123"})
        with patch.object(app,"ENABLED",False):
            self.assertEqual(self.client.post("/api/host/kunde1/subscribe",headers=self.origin,json={}).status_code,503)
    def test_subscribe_rejects_no_login(self):
        self.assertEqual(self.client.post("/api/host/kunde1/subscribe",headers=self.origin,json={}).status_code,401)
    def test_public_view_unpaid(self):
        self.assertEqual(self.client.get("/api/guest/kunde1").status_code,404)
    def test_logout(self):
        self.client.post("/api/host/kunde1/login",headers=self.origin,json={"password":"long-enough-password-123"})
        self.client.post("/api/host/kunde1/logout",headers=self.origin,json={})
        self.assertEqual(self.client.get("/api/host/kunde1/guide").status_code,401)
if __name__=="__main__":unittest.main()
