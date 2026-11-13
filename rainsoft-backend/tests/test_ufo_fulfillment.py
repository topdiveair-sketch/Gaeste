"""Safety regression tests for isolated UFO webhook. Run: python -m unittest discover -s tests -p 'test_ufo_fulfillment.py' -v

No external calls and no real Stripe charges. Must be run before deployment.
"""
import hashlib
import hmac
import json
import os
import tempfile
import time
import unittest
from unittest import mock
from flask import Flask
from ufo_fulfillment import ufo, signature_ok, validated_buyer


class TestUFOFulfillment(unittest.TestCase):
    def test_signature_verification(self):
        now = int(time.time())
        payload = b'{"type":"checkout.session.completed"}'
        digest = hmac.new(b"whsec_test_secret", str(now).encode() + b"." + payload, hashlib.sha256).hexdigest()
        self.assertTrue(signature_ok(payload, f"t={now},v1={digest}", "whsec_test_secret", now))
        self.assertFalse(signature_ok(payload + b"x", f"t={now},v1={digest}", "whsec_test_secret", now))
        self.assertFalse(signature_ok(payload, f"t={now-301},v1={digest}", "whsec_test_secret", now))
        self.assertFalse(signature_ok(payload, "", "whsec_test_secret", now))

    @mock.patch("ufo_fulfillment.stripe_get")
    def test_exact_payment_and_exact_book(self, api):
        valid = {
            "id": "cs_live_123ABC", "livemode": True, "payment_link": "plink_1UbGkS3PvFqHVzZFgAUMOJp5",
            "mode": "payment", "status": "complete", "payment_status": "paid",
            "currency": "eur", "amount_total": 990,
            "customer_details": {"email": "buyer@example.invalid"}
        }
        line_items = {"data": [{"price": {"id": "price_1UbGkH3PvFqHVzZFL3siH4e9"}, "quantity": 1}], "has_more": False}
        api.side_effect = [valid, line_items]
        self.assertEqual(validated_buyer("cs_live_123ABC"), "buyer@example.invalid")
        for changed in [{"amount_total": 999}, {"payment_link": "plink_OTHER"}, {"payment_status": "unpaid"}, {"livemode": False}]:
            api.reset_mock()
            api.return_value = dict(valid, **changed)
            self.assertIsNone(validated_buyer("cs_live_123ABC"))

    def test_disabled_returns_503_no_enrollment(self):
        app = Flask(__name__)
        app.register_blueprint(ufo)
        with mock.patch("ufo_fulfillment.configured", return_value=False):
            with mock.patch("ufo_fulfillment.enroll") as enroll:
                res = app.test_client().post("/integrations/ufo/stripe-webhook", data="{}")
                self.assertEqual(res.status_code, 503)
                enroll.assert_not_called()

    def test_bad_signature_never_enrolls(self):
        app = Flask(__name__)
        app.register_blueprint(ufo)
        with mock.patch("ufo_fulfillment.configured", return_value=True):
            with mock.patch.dict(os.environ, {"STRIPE_UFO_WEBHOOK_SECRET": "whsec_fake"}):
                with mock.patch("ufo_fulfillment.enroll") as enroll:
                    res = app.test_client().post("/integrations/ufo/stripe-webhook", data="{}",
                                               headers={"Stripe-Signature": "t=1,v1=bad"})
                    self.assertEqual(res.status_code, 400)
                    enroll.assert_not_called()

    def test_valid_paid_event_is_idempotent(self):
        app = Flask(__name__)
        app.register_blueprint(ufo)
        event = json.dumps({"type": "checkout.session.completed", "data": {"object": {"id": "cs_live_123ABC"}}})
        with tempfile.TemporaryDirectory() as folder:
            with mock.patch.dict(os.environ, {"STRIPE_UFO_WEBHOOK_SECRET": "whsec_fake",
                        "UFO_FULFILLMENT_DB": os.path.join(folder, "orders.sqlite3")}):
                with mock.patch("ufo_fulfillment.configured", return_value=True):
                    with mock.patch("ufo_fulfillment.signature_ok", return_value=True):
                        with mock.patch("ufo_fulfillment.validated_buyer", return_value="buyer@example.invalid"):
                            with mock.patch("ufo_fulfillment.enroll") as enroll:
                                for i in range(2):
                                    res = app.test_client().post("/integrations/ufo/stripe-webhook", data=event,
                                                headers={"Stripe-Signature": "stub"})
                                    self.assertEqual(res.status_code, 200)
                                enroll.assert_called_once_with("buyer@example.invalid")

    def test_systeme_failure_is_retried(self):
        app = Flask(__name__)
        app.register_blueprint(ufo)
        event = json.dumps({"type": "checkout.session.completed", "data": {"object": {"id": "cs_live_456DEF"}}})
        with tempfile.TemporaryDirectory() as folder:
            with mock.patch.dict(os.environ, {"STRIPE_UFO_WEBHOOK_SECRET": "whsec_fake",
                    "UFO_FULFILLMENT_DB": os.path.join(folder, "orders.sqlite3")}):
                with mock.patch("ufo_fulfillment.configured", return_value=True):
                    with mock.patch("ufo_fulfillment.signature_ok", return_value=True):
                        with mock.patch("ufo_fulfillment.validated_buyer", return_value="buyer@example.invalid"):
                            with mock.patch("ufo_fulfillment.enroll", side_effect=RuntimeError("API unavailable")):
                                res = app.test_client().post("/integrations/ufo/stripe-webhook", data=event,
                                                   headers={"Stripe-Signature": "stub"})
                                self.assertEqual(res.status_code, 503)


if __name__ == "__main__":
    unittest.main()
