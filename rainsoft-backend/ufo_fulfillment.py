"""Fail-closed Stripe -> Systeme.io fulfillment for ONE UFO digital book.

This endpoint is disabled until API keys and webhook signing secret are configured.
Do not grant whole-course access: module 2893054 only.
"""
import hashlib
import hmac
import json
import os
import re
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request

from flask import Blueprint, jsonify, request

ufo = Blueprint("rainsoft_ufo_fulfillment", __name__)

PAYMENT_LINK = "plink_1UbGkS3PvFqHVzZFgAUMOJp5"
PRICE_ID = "price_1UbGkH3PvFqHVzZFL3siH4e9"
COURSE_ID = 703718
MODULE_ID = 2893054
AMOUNT = 990
RE_SESSION = re.compile(r"^cs_(?:live|test)_[a-zA-Z0-9]+$")
RE_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def configured():
    return (
        os.getenv("UFO_FULFILLMENT_ENABLED") == "true"
        and os.getenv("STRIPE_UFO_SECRET_KEY", "").startswith(("sk_live_", "rk_live_"))
        and os.getenv("STRIPE_UFO_WEBHOOK_SECRET", "").startswith("whsec_")
        and bool(os.getenv("SYSTEME_UFO_API_KEY"))
    )


def signature_ok(payload, header, secret, now=None):
    fields = {}
    for part in (header or "").split(","):
        if "=" in part:
            key, value = part.split("=", 1)
            fields.setdefault(key, []).append(value)
    try:
        timestamp = int(fields["t"][0])
    except (KeyError, ValueError, IndexError):
        return False
    if abs((int(time.time()) if now is None else now) - timestamp) > 300:
        return False
    mac = hmac.new(secret.encode("utf-8"), str(timestamp).encode() + b"." + payload, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(mac, candidate) for candidate in fields.get("v1", []))


def send(method, url, headers, data=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
                                 headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as response:
        body = response.read(512 * 1024)
        return json.loads(body) if body else {}


def stripe_get(path):
    return send("GET", "https://api.stripe.com/v1/" + path, {
        "Authorization": "Bearer " + os.environ["STRIPE_UFO_SECRET_KEY"]
    })


def systeme(method, path, data=None):
    base = os.getenv("SYSTEME_UFO_API_BASE", "https://api.systeme.io/api").rstrip("/")
    if base != "https://api.systeme.io/api":
        raise RuntimeError("Unexpected Systeme.io API origin")
    return send(method, base + path, {
        "X-API-Key": os.environ["SYSTEME_UFO_API_KEY"],
        "Content-Type": "application/json",
        "Accept": "application/json"
    }, data)


def validated_buyer(session_id):
    if not RE_SESSION.fullmatch(session_id):
        return None
    sid = urllib.parse.quote(session_id, safe="")
    session = stripe_get("checkout/sessions/" + sid)
    if not (
        session.get("livemode") is True
        and session.get("payment_link") == PAYMENT_LINK
        and session.get("mode") == "payment"
        and session.get("status") == "complete"
        and session.get("payment_status") == "paid"
        and session.get("currency") == "eur"
        and session.get("amount_total") == AMOUNT
    ):
        return None
    items = stripe_get("checkout/sessions/" + sid + "/line_items?limit=20")
    lines = items.get("data") or []
    if len(lines) != 1 or items.get("has_more"):
        return None
    line = lines[0]
    price = line.get("price") or {}
    price_id = price.get("id") if isinstance(price, dict) else price
    if not (price_id == PRICE_ID and line.get("quantity") == 1):
        return None
    email = ((session.get("customer_details") or {}).get("email") or session.get("customer_email") or "").strip().lower()
    if not RE_EMAIL.fullmatch(email) or len(email) > 254:
        return None
    return email


def db_connect():
    filename = os.getenv("UFO_FULFILLMENT_DB", "/data/ufo-fulfillment.sqlite3")
    os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
    db = sqlite3.connect(filename, timeout=10)
    db.execute("CREATE TABLE IF NOT EXISTS ufo_fulfillments (session_id TEXT PRIMARY KEY, email TEXT NOT NULL, state TEXT NOT NULL, updated INTEGER NOT NULL)")
    db.commit()
    return db


def upsert_contact(email):
    # API response formats may vary across API versions: do not infer IDs without validation.
    result = systeme("GET", "/contacts?email=" + urllib.parse.quote(email, safe=""))
    collection = result.get("items", result.get("data", []))
    if not isinstance(collection, list):
        raise RuntimeError("Unexpected contacts response")
    matching = [x for x in collection if isinstance(x, dict) and str(x.get("email", "")).lower() == email]
    if len(matching) > 1:
        raise RuntimeError("Ambiguous contact")
    if matching:
        contact = matching[0]
    else:
        contact = systeme("POST", "/contacts", {"email": email, "locale": "de"})
    contact_id = contact.get("id")
    if not isinstance(contact_id, int) or contact_id < 1:
        raise RuntimeError("No validated Systeme.io contact ID")
    return contact_id


def enroll(email):
    contact_id = upsert_contact(email)
    # IMPORTANT: full_access is forbidden; the buyer only acquires the UFO book.
    result = systeme("POST", "/school/courses/" + str(COURSE_ID) + "/enrollments",
                     {"contactId": contact_id, "accessType": "partial_access", "modules": [MODULE_ID]})
    if not isinstance(result, dict) or not isinstance(result.get("id"), int):
        raise RuntimeError("Enrollment not confirmed")


@ufo.get("/integrations/ufo/health")
def health():
    return jsonify(service="ufo-stripe-systeme", configured=configured(), auto_fulfillment_live=False, end_to_end_tested=False, status="preproduction")


@ufo.post("/integrations/ufo/stripe-webhook")
def stripe_webhook():
    if not configured():
        return jsonify(error="not_configured"), 503
    if request.content_length is None or request.content_length > 131072:
        return "", 413
    raw = request.get_data()
    if not signature_ok(raw, request.headers.get("Stripe-Signature", ""),
                        os.environ["STRIPE_UFO_WEBHOOK_SECRET"]):
        return "", 400
    try:
        event = json.loads(raw)
    except (ValueError, TypeError):
        return "", 400
    if event.get("type") != "checkout.session.completed":
        return "", 200
    session_id = ((event.get("data") or {}).get("object") or {}).get("id")
    if not isinstance(session_id, str) or not RE_SESSION.fullmatch(session_id):
        return "", 400
    try:
        buyer = validated_buyer(session_id)
    except (urllib.error.URLError, ValueError, KeyError):
        return "", 503
    if buyer is None:
        return "", 200  # A different checkout must never grant this book.
    with db_connect() as db:
        row = db.execute("SELECT state FROM ufo_fulfillments WHERE session_id=?", (session_id,)).fetchone()
        if row and row[0] == "enrolled":
            return "", 200
        db.execute("INSERT INTO ufo_fulfillments(session_id,email,state,updated) VALUES(?,?,?,?) "
                   "ON CONFLICT(session_id) DO UPDATE SET updated=excluded.updated",
                   (session_id, buyer, "pending", int(time.time())))
    try:
        enroll(buyer)
    except (urllib.error.URLError, ValueError, RuntimeError, KeyError):
        return "", 503  # Stripe must retry; never acknowledge an unfulfilled purchase.
    with db_connect() as db:
        db.execute("UPDATE ufo_fulfillments SET state='enrolled',updated=? WHERE session_id=?",
                   (int(time.time()), session_id))
    return "", 200
