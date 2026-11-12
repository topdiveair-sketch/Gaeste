"""Isolated, fail-closed one-time Stripe checkout for the DIE ADER reader.
Never import this module into the room booking service.
Requires explicit BOOKS_LIVE_ENABLED plus all Stripe, SMTP and reader secrets.
"""
import os, json, time, hmac, hashlib, secrets, sqlite3, smtplib, html, urllib.parse, urllib.request, re
from email.message import EmailMessage
from flask import Blueprint, request, jsonify, redirect, make_response, render_template_string
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

bp = Blueprint("rainsoft_books", __name__)
SLUG = "die-ader"
PRICE = 990
DAYS = 730
READER_PAGE_COUNT = 258
ORIGIN = os.getenv("BOOKS_ORIGIN", "").rstrip("/")
PUBLIC = "https://topdiveair-sketch.github.io/Gaeste/"
WEBHOOK_LIMIT = 128 * 1024
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
BOOK_TITLE = "DIE ADER – Ein Zukunftsthriller"

def settings_ready():
    names = ("STRIPE_BOOK_SECRET_KEY", "STRIPE_BOOK_WEBHOOK_SECRET",
             "BOOKS_SESSION_SECRET", "BOOKS_SMTP_HOST", "BOOKS_SMTP_USER",
             "BOOKS_SMTP_PASSWORD", "BOOKS_MAIL_FROM", "BOOKS_ORIGIN")
    if os.getenv("BOOKS_LIVE_ENABLED") != "true":
        return False
    if any(not os.getenv(k) for k in names):
        return False
    if not ORIGIN.startswith("https://"):
        return False
    if len(os.getenv("BOOKS_SESSION_SECRET", "")) < 32:
        return False
    if not os.getenv("STRIPE_BOOK_SECRET_KEY", "").startswith("sk_live_"):
        return False
    if not os.getenv("STRIPE_BOOK_WEBHOOK_SECRET", "").startswith("whsec_"):
        return False
    return all(os.getenv("BOOK_DIE_ADER_PAGES_%02d" % n) for n in range(1, 27))

def test_ready():
    names = ("STRIPE_BOOK_SECRET_KEY", "STRIPE_BOOK_WEBHOOK_SECRET",
             "BOOKS_SESSION_SECRET", "BOOKS_SMTP_HOST", "BOOKS_SMTP_USER",
             "BOOKS_SMTP_PASSWORD", "BOOKS_MAIL_FROM", "BOOKS_ORIGIN")
    return (os.getenv("BOOKS_TEST_ENABLED") == "true"
        and all(os.getenv(k) for k in names)
        and os.getenv("STRIPE_BOOK_SECRET_KEY", "").startswith("sk_test_")
        and os.getenv("STRIPE_BOOK_WEBHOOK_SECRET", "").startswith("whsec_")
        and len(os.getenv("BOOKS_SESSION_SECRET", "")) >= 32
        and ORIGIN.startswith("https://")
        and all(os.getenv("BOOK_DIE_ADER_PAGES_%02d" % n) for n in range(1, 27)))

def ready():
    return settings_ready() or test_ready()

def serializer():
    key = os.getenv("BOOKS_SESSION_SECRET", "")
    if len(key) < 32:
        raise RuntimeError("Reader session key not configured")
    return URLSafeTimedSerializer(key, salt="rainsoft-book-reader-v1")

def connect():
    path = os.getenv("RAINSOFT_DB", "/data/rainsoft.sqlite3")
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    db = sqlite3.connect(path, timeout=20)
    db.execute("""CREATE TABLE IF NOT EXISTS book_orders(
       session_id TEXT PRIMARY KEY, email TEXT NOT NULL,
       state TEXT NOT NULL, payment_intent TEXT,
       secret_hash TEXT, bought_at INTEGER, revoked_at INTEGER,
       email_sent_at INTEGER, consent_version TEXT NOT NULL,
       created_at INTEGER NOT NULL)""")
    db.commit()
    return db

def stripe(method, path, params=None):
    key = os.getenv("STRIPE_BOOK_SECRET_KEY", "")
    if not key:
        raise RuntimeError("Stripe not configured")
    payload = urllib.parse.urlencode(params, doseq=True).encode() if params else None
    req = urllib.request.Request("https://api.stripe.com/v1/" + path, data=payload,
        headers={"Authorization": "Bearer " + key,
                 "Content-Type": "application/x-www-form-urlencoded"},
        method=method)
    with urllib.request.urlopen(req, timeout=18) as res:
        return json.load(res)

def verify_stripe(raw, sig, secret, now=None):
    now = int(time.time()) if now is None else int(now)
    pairs = {}
    for item in sig.split(","):
        if "=" in item:
            key, val = item.split("=", 1)
            pairs.setdefault(key, []).append(val)
    try: stamp = int(pairs["t"][0])
    except (ValueError, KeyError, IndexError): return False
    if abs(stamp - now) > 300: return False
    expected = hmac.new(secret.encode(), (str(stamp)+".").encode()+raw, hashlib.sha256).hexdigest()
    return any(hmac.compare_digest(expected, s) for s in pairs.get("v1", []))

def is_paid(obj):
    return (obj.get("mode") == "payment" and
        obj.get("payment_status") == "paid" and
        obj.get("currency") == "eur" and obj.get("amount_total") == PRICE and
        (obj.get("metadata") or {}).get("book_slug") == SLUG and
        obj.get("status") == "complete")

def mail_access(email, link):
    msg = EmailMessage()
    msg["Subject"] = "DIE ADER – Ihr geschützter Rainsoft-Book-Zugang"
    msg["From"] = os.environ["BOOKS_MAIL_FROM"]
    msg["To"] = email
    msg.set_content("Vielen Dank für Ihren Kauf von DIE ADER für 9,90 EUR.\n"
        "Persönlicher Buchzugang: " + link + "\n"
        "Bitte diesen Link nicht weitergeben. Der Reader ist für mindestens 24 Monate zugänglich.\n"
        "Bei Fragen: topdiveair@gmail.com\n"
        "Vertrags- und Rücktrittshinweise: " + PUBLIC + "digitalbuch-kaufhinweise.html")
    with smtplib.SMTP_SSL(os.environ["BOOKS_SMTP_HOST"], int(os.getenv("BOOKS_SMTP_PORT","465")), timeout=12) as server:
        server.login(os.environ["BOOKS_SMTP_USER"], os.environ["BOOKS_SMTP_PASSWORD"])
        server.send_message(msg)

def fulfill(session):
    if not is_paid(session): return False
    sid = session["id"]
    with connect() as db:
        row = db.execute("SELECT email,state,secret_hash,revoked_at,email_sent_at FROM book_orders WHERE session_id=?", (sid,)).fetchone()
        if not row or row[3]: return False
        email, state, digest, _revoked, sent = row
        buyer = ((session.get("customer_details") or {}).get("email") or session.get("customer_email") or "").lower()
        if buyer != email: return False
        intent = session.get("payment_intent")
        db.execute("UPDATE book_orders SET state='paid',payment_intent=?,bought_at=COALESCE(bought_at,?) WHERE session_id=?",
                   (intent, int(time.time()), sid))
        if sent: return True
        token = secrets.token_urlsafe(32)
        db.execute("UPDATE book_orders SET secret_hash=? WHERE session_id=?",
                   (hashlib.sha256(token.encode()).hexdigest(), sid))
        db.commit()
        link = ORIGIN + "/books/die-ader/activate?session=" + urllib.parse.quote(sid) + "&token=" + token
        try:
            mail_access(email, link)
        except Exception:
            return False  # retry on subsequent verified event; no activation link exposed publicly
        db.execute("UPDATE book_orders SET email_sent_at=? WHERE session_id=?", (int(time.time()), sid))
    return True

@bp.get("/books/die-ader/health")
def book_health():
    return jsonify(book=SLUG, enabled=ready(), live=settings_ready(),
                   reader_complete=all(os.getenv("BOOK_DIE_ADER_PAGES_%02d" % n) for n in range(1,27)))

@bp.get("/books/die-ader")
def book_landing():
    if not ready(): return redirect(PUBLIC + "die-ader-zukunftsthriller.html", 302)
    csrf = serializer().dumps({"purpose":"checkout","nonce":secrets.token_urlsafe(12)})
    body = """<!doctype html><html lang=de><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>DIE ADER – 9,90 €</title>
    <style>body{font:17px/1.6 system-ui;max-width:640px;margin:50px auto;padding:20px}input{padding:12px}label{display:block;margin:16px 0}button{background:#134e70;color:white;padding:15px 30px;border:0;border-radius:8px}</style>
    <h1>DIE ADER – Ein Zukunftsthriller</h1><p>Geschützter Online-Reader · einmalig 9,90 € · kein Abonnement.</p>
    <form action="/books/die-ader/checkout" method=post><input type=hidden name=csrf value="{{ csrf }}">
    <label>Ihre E-Mail: <input name=email type=email required maxlength=254></label>
    <label><input type=checkbox name=consent_early value=yes required> Ich stimme der sofortigen Bereitstellung digitaler Inhalte vor Ablauf der Rücktrittsfrist ausdrücklich zu.</label>
    <label><input type=checkbox name=consent_loss value=yes required> Ich bestätige, dass ich das mögliche Erlöschen meines gesetzlichen Rücktrittsrechts bei Vorliegen aller gesetzlichen Voraussetzungen zur Kenntnis genommen habe.</label>
    <p><a href="https://topdiveair-sketch.github.io/Gaeste/digitalbuch-kaufhinweise.html">Kauf- und Verbraucherinformationen</a></p>
    <button type=submit>Zahlung für 9,90 € starten</button></form></html>"""
    return render_template_string(body, csrf=csrf)

@bp.post("/books/die-ader/checkout")
def checkout():
    if not ready(): return jsonify(error="checkout_not_ready"),503
    try: data = serializer().loads(request.form.get("csrf",""), max_age=1200)
    except (BadSignature, SignatureExpired): return jsonify(error="expired_checkout_form"),400
    if data.get("purpose")!="checkout": return jsonify(error="invalid_form"),400
    email = request.form.get("email","").strip().lower()
    if len(email)>254 or not EMAIL_PATTERN.fullmatch(email): return jsonify(error="invalid_email"),400
    if request.form.get("consent_early")!="yes" or request.form.get("consent_loss")!="yes":
        return jsonify(error="explicit_consent_required"),400
    sidnonce = secrets.token_urlsafe(12)
    form = {
      "mode":"payment", "customer_email":email,
      "line_items[0][price_data][currency]":"eur",
      "line_items[0][price_data][unit_amount]":str(PRICE),
      "line_items[0][price_data][product_data][name]":BOOK_TITLE,
      "line_items[0][quantity]":"1",
      "payment_method_types[0]":"card",
      "metadata[book_slug]":SLUG,
      "metadata[consent_version]":"2026-11-12-v1",
      "metadata[consent_early]":"yes",
      "metadata[consent_loss]":"yes",
      "success_url":ORIGIN+"/books/die-ader/complete?session_id={CHECKOUT_SESSION_ID}",
      "cancel_url":ORIGIN+"/books/die-ader",
      "client_reference_id":sidnonce,
    }
    try: session = stripe("POST", "checkout/sessions", form)
    except Exception: return jsonify(error="payment_service_unavailable"),503
    with connect() as db:
        db.execute("INSERT INTO book_orders(session_id,email,state,consent_version,created_at) VALUES (?,?,?,?,?)",
           (session["id"], email, "pending", "2026-11-12-v1", int(time.time())))
    return redirect(session["url"],303)

@bp.post("/books/stripe/webhook")
def stripe_webhook():
    if not ready(): return "",503
    if request.content_length and request.content_length>WEBHOOK_LIMIT:return "",413
    raw=request.get_data()
    if not verify_stripe(raw,request.headers.get("Stripe-Signature",""),os.environ["STRIPE_BOOK_WEBHOOK_SECRET"]):return "",400
    try: event=json.loads(raw)
    except ValueError:return "",400
    kind=event.get("type")
    obj=(event.get("data") or {}).get("object") or {}
    if kind=="checkout.session.completed":
        try: canonical=stripe("GET","checkout/sessions/"+urllib.parse.quote(obj.get("id",""),safe=""))
        except Exception:return "",503
        if not fulfill(canonical): return "",503
    if kind in ("charge.refunded","charge.dispute.created"):
        intent=obj.get("payment_intent")
        if intent:
            with connect() as db:
                db.execute("UPDATE book_orders SET state='revoked',revoked_at=? WHERE payment_intent=?",(int(time.time()),intent))
    return "",200

@bp.get("/books/die-ader/complete")
def completed():
    return "Vielen Dank. Der geschützte Zugangslink wird nach bestätigter Zahlung an Ihre E-Mail-Adresse gesendet.",200

@bp.get("/books/die-ader/activate")
def activate():
    if not ready(): return "Buchzugang noch nicht freigeschaltet",503
    sid=request.args.get("session","")
    token=request.args.get("token","")
    with connect() as db:
        row=db.execute("SELECT secret_hash,state,revoked_at,bought_at FROM book_orders WHERE session_id=?",(sid,)).fetchone()
    if not row or row[1]!="paid" or row[2] or not row[0] or not hmac.compare_digest(row[0],hashlib.sha256(token.encode()).hexdigest()):
        return "Zugang ungültig oder noch nicht freigeschaltet",403
    if not row[3] or int(time.time())>row[3]+DAYS*86400:
        return "Zugangsdauer abgelaufen – bitte Kontakt aufnehmen",403
    res=redirect("/books/die-ader/read?page=1")
    res.set_cookie("rainsoft_ader",serializer().dumps({"session":sid}),max_age=DAYS*86400,
       httponly=True,secure=True,samesite="Lax",path="/books/die-ader")
    return res

@bp.get("/books/die-ader/read")
def read_book():
    if not ready(): return "Buchzugang noch nicht freigeschaltet",503
    cookie=request.cookies.get("rainsoft_ader","")
    try: data=serializer().loads(cookie,max_age=DAYS*86400)
    except (BadSignature,SignatureExpired): return "Bitte Ihren persönlichen Zugangslink aus der E-Mail verwenden",401
    sid=data.get("session","")
    with connect() as db:
        row=db.execute("SELECT state,revoked_at,bought_at FROM book_orders WHERE session_id=?",(sid,)).fetchone()
    if not row or row[0]!="paid" or row[1] or not row[2] or time.time()>row[2]+DAYS*86400:
        return "Kein aktiver Buchzugang",403
    try: page=int(request.args.get("page","1"))
    except ValueError:return "",400
    if not 1<=page<=READER_PAGE_COUNT:return "",404
    idx=(page-1)//10+1
    try:
        chunk=json.loads(os.environ["BOOK_DIE_ADER_PAGES_%02d"%idx])
        record=chunk[(page-1)%10]
        if record["number"]!=page:raise ValueError("bad page")
    except (KeyError,ValueError,IndexError): return "Buchseite derzeit nicht verfügbar",503
    link=lambda n: "/books/die-ader/read?page="+str(n)
    navigation=("<a href='"+link(page-1)+"'>← Zurück</a> " if page>1 else "")+(" <a href='"+link(page+1)+"'>Weiter →</a>" if page<READER_PAGE_COUNT else "")
    return ('<!doctype html><html lang=de><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">'
        '<title>DIE ADER – Buchseite '+str(page)+'</title><style>body{font:19px/1.8 Georgia,serif;max-width:750px;padding:25px;margin:auto}main{white-space:pre-wrap}nav{font:17px system-ui;padding:16px 0}</style>'
        '<h1>DIE ADER</h1><p>Seite '+str(page)+' von 258</p><nav>'+navigation+'</nav><main>'+html.escape(record["text"])+'</main><nav>'+navigation+'</nav></html>')
