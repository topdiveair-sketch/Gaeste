"""Offline end-to-end contract checks for Windows -> Rainsoft -> PayPal event -> guest access.
No real PayPal requests or billable infrastructure."""
import datetime, hashlib, hmac, os, tempfile, time, unittest
from unittest.mock import patch
import app

class FullFlowTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.previous=app.DB
        app.DB=self.temp.name+"/integration.sqlite3"
        self.settings=patch.dict(os.environ,{"RAINSOFT_INTERNAL_SECRET":"I"*48,"PUBLIC_ORIGIN":"https://rainsoft-test.invalid"},clear=False)
        self.settings.start()
        self.client=app.app.test_client()
    def tearDown(self):
        app.DB=self.previous
        self.settings.stop()
        self.temp.cleanup()
    def headers(self,tenant):
        ts=str(int(time.time()))
        digest=hmac.new(("I"*48).encode(),(tenant+":"+ts).encode(),hashlib.sha256).hexdigest()
        return {"X-Rainsoft-Timestamp":ts,"X-Rainsoft-Signature":digest}
    def test_full_customer_to_windows_to_paypal_to_guest_flow(self):
        tenant="pilot123"
        create=self.client.post("/internal/tenants",headers=self.headers(tenant),json={"tenant_id":tenant,"display_name":"Pilot Wachau"})
        self.assertEqual(create.status_code,201)
        content={"arrival":"15 Uhr","parking":"Innenhof","wifi_info":"Fragen beim Gastgeber","house_rules":"Nichtraucher","extras":"Fruehstueck"}
        edit=self.client.put("/internal/tenants/"+tenant+"/guide",headers=self.headers(tenant),json=content)
        self.assertEqual(edit.status_code,200)
        self.assertEqual(self.client.get("/api/guest/"+tenant).status_code,404)
        self.assertEqual(self.client.get("/g/"+tenant).status_code,404)
        with patch.object(app,"ready",return_value=True):
            with patch.object(app,"verified",return_value=True):
                with patch.object(app,"access_token",return_value="fake"):
                    details={"plan_id":"P-SANDBOX","custom_id":tenant,"status":"ACTIVE","billing_info":{"last_payment":{"time":datetime.datetime.now(datetime.timezone.utc).isoformat()}}}
                    with patch.object(app,"paypal",return_value=details):
                        with patch.object(app,"PLAN","P-SANDBOX"):
                            event={"id":"EV-001","event_type":"BILLING.SUBSCRIPTION.ACTIVATED","resource":{"id":"I-SUB123"}}
                            response=self.client.post("/webhooks/paypal",json=event)
                            self.assertEqual(response.status_code,200)
                            self.assertEqual(self.client.post("/webhooks/paypal",json=event).status_code,200)
            win=self.client.get("/internal/operator/overview",headers=self.headers("admin"))
            self.assertEqual(win.status_code,200)
            self.assertEqual(win.json["paid_active_count"],1)
            tenants=self.client.get("/internal/operator/tenants",headers=self.headers("admin"))
            self.assertTrue(tenants.json["tenants"][0]["access_active"])
            self.assertEqual(self.client.get("/api/guest/"+tenant).json["guest_info"]["parking"],"Innenhof")
            self.assertEqual(self.client.get("/g/"+tenant).status_code,200)
        with app.db() as c:
            self.assertEqual(c.execute("SELECT COUNT(*) FROM events").fetchone()[0],1)
        with app.db() as c:
            c.execute("UPDATE subscriptions SET status='CANCELLED' WHERE tenant_id=?",(tenant,))
        with patch.object(app,"ready",return_value=True):
            self.assertEqual(self.client.get("/api/guest/"+tenant).status_code,404)
            self.assertEqual(self.client.get("/g/"+tenant).status_code,404)
    def test_fake_webhook_must_not_activate(self):
        tenant="pilot123"
        self.client.post("/internal/tenants",headers=self.headers(tenant),json={"tenant_id":tenant,"display_name":"Pilot"})
        with patch.object(app,"ready",return_value=True):
            with patch.object(app,"verified",return_value=False):
                resp=self.client.post("/webhooks/paypal",json={"id":"EV-FAKE","event_type":"BILLING.SUBSCRIPTION.ACTIVATED","resource":{"id":"I-BAD"}})
            self.assertEqual(resp.status_code,401)
            self.assertEqual(self.client.get("/api/guest/"+tenant).status_code,404)

if __name__=="__main__":unittest.main()
