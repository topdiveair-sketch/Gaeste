"""Security and completeness tests for isolated DIE ADER paid reader; no network or payments."""
import unittest, os, time, hmac, hashlib, json, tempfile
from unittest.mock import patch
import stripe_books as b
from app import app

class BookSecurityTests(unittest.TestCase):
    def setUp(self):
        self.client=app.test_client()

    def test_disabled_checkout_redirects_to_public_info(self):
        with patch.dict(os.environ, {"BOOKS_LIVE_ENABLED":"false", "BOOKS_TEST_ENABLED":"false"}):
            r=self.client.get("/books/die-ader")
            self.assertEqual(r.status_code,302)
            self.assertIn("die-ader-zukunftsthriller",r.location)

    def test_disabled_reader_refuses_no_cookie(self):
        with patch.dict(os.environ, {"BOOKS_LIVE_ENABLED":"false", "BOOKS_TEST_ENABLED":"false"}):
            r=self.client.get("/books/die-ader/read?page=1")
            self.assertEqual(r.status_code,503)
            self.assertNotIn(b"Wien",r.data)

    def test_disabled_activation_refuses_token(self):
        with patch.dict(os.environ, {"BOOKS_LIVE_ENABLED":"false", "BOOKS_TEST_ENABLED":"false"}):
            r=self.client.get("/books/die-ader/activate?session=cs_fake&token=fake")
            self.assertEqual(r.status_code,503)

    def test_disabled_checkout_refuses_post(self):
        with patch.dict(os.environ, {"BOOKS_LIVE_ENABLED":"false", "BOOKS_TEST_ENABLED":"false"}):
            r=self.client.post("/books/die-ader/checkout",data={"email":"foo@example.com"})
            self.assertEqual(r.status_code,503)

    def test_disabled_webhook_refuses(self):
        with patch.dict(os.environ, {"BOOKS_LIVE_ENABLED":"false", "BOOKS_TEST_ENABLED":"false"}):
            r=self.client.post("/books/stripe/webhook",data=b"{}",headers={"Stripe-Signature":"no"})
            self.assertEqual(r.status_code,503)

    def test_webhook_signature_correct_wrong_and_stale(self):
        body=b'{"id":"evt_123","type":"checkout.session.completed"}'
        secret="whsec_foobar"
        now=1780000000
        valid=hmac.new(secret.encode(),str(now).encode()+b"."+body,hashlib.sha256).hexdigest()
        self.assertTrue(b.verify_stripe(body, "t=%s,v1=%s"%(now,valid), secret,now=now))
        self.assertFalse(b.verify_stripe(body+b"tampered", "t=%s,v1=%s"%(now,valid), secret,now=now))
        self.assertFalse(b.verify_stripe(body, "t=%s,v1=%s"%(now,valid), secret,now=now+301))
        self.assertFalse(b.verify_stripe(body, "junk", secret,now=now))

    def test_exact_verified_paid_product_required(self):
        obj={"id":"cs_test_ok","mode":"payment","payment_status":"paid","currency":"eur",
             "amount_total":990,"metadata":{"book_slug":"die-ader"},"status":"complete"}
        self.assertTrue(b.is_paid(obj))
        for field,value in [("payment_status","unpaid"),("amount_total",999),("currency","usd"),("status","open"),("mode","subscription")]:
            invalid=dict(obj);invalid[field]=value
            self.assertFalse(b.is_paid(invalid),field)
        invalid=dict(obj);invalid["metadata"]={"book_slug":"other"}
        self.assertFalse(b.is_paid(invalid))

    def test_missing_page_or_secrets_never_enable_checkout(self):
        with patch.dict(os.environ,{"BOOKS_LIVE_ENABLED":"true","BOOKS_TEST_ENABLED":"false"},clear=True):
            self.assertFalse(b.settings_ready())
            self.assertFalse(b.ready())
        with patch.dict(os.environ,{"BOOKS_TEST_ENABLED":"true","BOOKS_LIVE_ENABLED":"false"},clear=True):
            self.assertFalse(b.test_ready())

    def test_verified_payment_grants_reader_and_refund_revokes(self):
        import urllib.parse
        with tempfile.TemporaryDirectory() as td:
            chunk=json.dumps([{"number":1,"text":"Geschütztes Buch: <script>nicht ausführen</script>"}])
            env={"RAINSOFT_DB":td+"/books.db","BOOKS_SESSION_SECRET":"t"*48,"BOOK_DIE_ADER_PAGES_01":chunk}
            sent=[]
            session={"id":"cs_test_paid123","mode":"payment","payment_status":"paid","currency":"eur","amount_total":990,
                "metadata":{"book_slug":"die-ader"},"status":"complete","payment_intent":"pi_test_abc",
                "customer_details":{"email":"buyer@example.org"}}
            with patch.dict(os.environ,env),patch.object(b,"ready",return_value=True),patch.object(b,"mail_access",side_effect=lambda email,link: sent.append((email,link))):
                with b.connect() as db:
                    db.execute("INSERT INTO book_orders(session_id,email,state,consent_version,created_at) VALUES (?,?,?,?,?)",
                       (session["id"],"buyer@example.org","pending","2026-11-12-v1",int(time.time())))
                self.assertTrue(b.fulfill(session))
                self.assertEqual(sent[0][0],"buyer@example.org")
                self.assertTrue(b.fulfill(session))
                self.assertEqual(len(sent),1,"Duplicate events must not send a second link")
                link=urllib.parse.urlsplit(sent[0][1])
                activated=self.client.get(link.path+"?"+link.query)
                self.assertEqual(activated.status_code,302)
                reader=self.client.get("/books/die-ader/read?page=1")
                self.assertEqual(reader.status_code,200)
                self.assertIn(b"Gesch",reader.data)
                self.assertNotIn(b"<script>",reader.data)
                with b.connect() as db:
                    db.execute("UPDATE book_orders SET state='revoked',revoked_at=? WHERE session_id=?",
                               (int(time.time()),session["id"]))
                revoked=self.client.get("/books/die-ader/read?page=1")
                self.assertEqual(revoked.status_code,403)

if __name__=="__main__":
    unittest.main()
