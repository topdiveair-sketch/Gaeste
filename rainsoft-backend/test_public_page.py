import unittest,os,time,datetime,tempfile
from unittest.mock import patch
import app

class PublicPageTests(unittest.TestCase):
    def setUp(self):
        self.folder=tempfile.TemporaryDirectory()
        self.old=app.DB
        app.DB=self.folder.name+"/test.sqlite3"
        self.client=app.app.test_client()
        with app.db() as con:
            con.execute("INSERT INTO tenants VALUES (?,?,?,?)",("haus1","Haus <script>alert(1)</script>",'{"arrival":"Welcome <img src=x onerror=alert(1)>","parking":"","wifi_info":"","house_rules":"","extras":""}',int(time.time())))
    def tearDown(self):
        app.DB=self.old
        self.folder.cleanup()
    def test_no_unpaid_public_page(self):
        self.assertEqual(self.client.get("/g/haus1").status_code,404)
    def test_no_unpaid_public_api(self):
        self.assertEqual(self.client.get("/api/guest/haus1").status_code,404)
    def test_paid_public_page_and_safe_dom_template(self):
        now=datetime.datetime.now(datetime.timezone.utc).isoformat()
        with app.db() as con:
            con.execute("INSERT INTO subscriptions VALUES (?,?,?,?,?)",("sub1","haus1","ACTIVE",now,int(time.time())))
        with patch.object(app,"ready",return_value=True):
            page=self.client.get("/g/haus1")
            self.assertEqual(page.status_code,200)
            self.assertIn(b'textContent',page.data)
            self.assertNotIn(b'<script>alert(1)</script>',page.data)
            data=self.client.get("/api/guest/haus1")
            self.assertEqual(data.status_code,200)
    def test_invalid_tenant(self):
        self.assertEqual(self.client.get("/g/not%20valid").status_code,404)
if __name__=="__main__":unittest.main()
