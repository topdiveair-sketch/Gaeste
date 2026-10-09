"""Rainsoft subscription backend. Run separately from the Zuhause am Bach booking system."""
import os, sqlite3, json, time, secrets, urllib.request, urllib.error, hmac, hashlib, datetime
from flask import Flask, jsonify, request, redirect
app=Flask(__name__)
DB=os.getenv("RAINSOFT_DB","/data/rainsoft.sqlite3")
API="https://api-m.paypal.com" if os.getenv("PAYPAL_MODE")=="live" else "https://api-m.sandbox.paypal.com"
ORIGIN=os.getenv("PUBLIC_ORIGIN","http://localhost:8080").rstrip("/")
PLAN=os.getenv("PAYPAL_PLAN_ID","")
ENABLED=os.getenv("RAINSOFT_LIVE_ENABLED")=="true"
def db():
    os.makedirs(os.path.dirname(os.path.abspath(DB)),exist_ok=True)
    c=sqlite3.connect(DB,timeout=15)
    c.execute("CREATE TABLE IF NOT EXISTS subscriptions (paypal_id TEXT PRIMARY KEY, tenant_id TEXT UNIQUE NOT NULL, status TEXT NOT NULL, last_payment TEXT, updated_at INTEGER NOT NULL)")
    c.execute("CREATE TABLE IF NOT EXISTS events (event_id TEXT PRIMARY KEY, received_at INTEGER NOT NULL)")
    c.execute("CREATE TABLE IF NOT EXISTS tenants (tenant_id TEXT PRIMARY KEY, display_name TEXT NOT NULL, guest_info TEXT NOT NULL, created_at INTEGER NOT NULL)")
    c.commit()
    return c
def paypal(method,path,payload=None,token=None):
    headers={"Accept":"application/json"}
    if token: headers["Authorization"]="Bearer "+token
    if payload is not None: headers["Content-Type"]="application/json"
    data=json.dumps(payload).encode() if payload is not None else None
    req=urllib.request.Request(API+path,data=data,headers=headers,method=method)
    with urllib.request.urlopen(req,timeout=20) as res:
        return json.loads(res.read())
def access_token():
    import base64
    a=os.getenv("PAYPAL_CLIENT_ID","");b=os.getenv("PAYPAL_CLIENT_SECRET","")
    if not (a and b): raise RuntimeError("PayPal credentials not configured")
    auth=base64.b64encode((a+":"+b).encode()).decode()
    req=urllib.request.Request(API+"/v1/oauth2/token",data=b"grant_type=client_credentials",headers={"Authorization":"Basic "+auth,"Content-Type":"application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req,timeout=20) as res: return json.loads(res.read())["access_token"]
def parse_time(value):
    if not value:return None
    try:return int(datetime.datetime.fromisoformat(value.replace("Z","+00:00")).timestamp())
    except (ValueError,TypeError):return None

def allowed(status,last,now=None):
    now=int(time.time()) if now is None else now
    payment=parse_time(last)
    max_age=int(os.getenv("RAINSOFT_MAX_PAYMENT_AGE_DAYS","35"))*86400
    return status=="ACTIVE" and payment is not None and 0<=now-payment<=max_age

def internal_authorised(tenant):
    key=os.getenv("RAINSOFT_INTERNAL_SECRET","")
    stamp=request.headers.get("X-Rainsoft-Timestamp","")
    signature=request.headers.get("X-Rainsoft-Signature","")
    if len(key)<32 or not stamp.isdigit() or not signature:return False
    if abs(int(time.time())-int(stamp))>120:return False
    digest=hmac.new(key.encode(),(tenant+":"+stamp).encode(),hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest,signature)

def ready():
    return ENABLED and bool(PLAN and os.getenv("PAYPAL_WEBHOOK_ID") and os.getenv("PAYPAL_CLIENT_ID") and os.getenv("PAYPAL_CLIENT_SECRET") and os.getenv("PUBLIC_ORIGIN"))
@app.get("/health")
def health(): return jsonify(status="ok",paypal_live=bool(ready() and os.getenv("PAYPAL_MODE")=="live"))
@app.post("/api/subscribe")
def subscribe():
    if not ready(): return jsonify(error="Payments not configured"),503
    obj=request.get_json(silent=True) or {}
    tenant=obj.get("tenant_id","")
    if not isinstance(tenant,str) or not (3<=len(tenant)<=64) or not all(c.isalnum() or c in "_-" for c in tenant): return jsonify(error="Invalid tenant"),400
    if not internal_authorised(tenant):return jsonify(error="unauthorised"),401
    with db() as c:
        if not c.execute("SELECT 1 FROM tenants WHERE tenant_id=?",(tenant,)).fetchone():return jsonify(error="Unknown tenant"),404
    token=access_token()
    result=paypal("POST","/v1/billing/subscriptions",{
        "plan_id":PLAN,"custom_id":tenant,
        "application_context":{"brand_name":"Rainsoft GastKompass","user_action":"SUBSCRIBE_NOW","return_url":ORIGIN+"/return","cancel_url":ORIGIN+"/cancel"}
    },token)
    approve=next((l["href"] for l in result.get("links",[]) if l.get("rel")=="approve"),None)
    if not approve:return jsonify(error="Approval link missing"),502
    return jsonify(approval_url=approve,subscription_id=result["id"])
def verified(event):
    token=access_token()
    result=paypal("POST","/v1/notifications/verify-webhook-signature",{
        "auth_algo":request.headers.get("PAYPAL-AUTH-ALGO",""),
        "cert_url":request.headers.get("PAYPAL-CERT-URL",""),
        "transmission_id":request.headers.get("PAYPAL-TRANSMISSION-ID",""),
        "transmission_sig":request.headers.get("PAYPAL-TRANSMISSION-SIG",""),
        "transmission_time":request.headers.get("PAYPAL-TRANSMISSION-TIME",""),
        "webhook_id":os.environ["PAYPAL_WEBHOOK_ID"],
        "webhook_event":event
    },token)
    return result.get("verification_status")=="SUCCESS"
@app.post("/webhooks/paypal")
def webhook():
    if not ready():return jsonify(error="disabled"),503
    if request.content_length and request.content_length>100000:return "",413
    event=request.get_json(silent=True)
    if not isinstance(event,dict) or not event.get("id"):return "",400
    if not verified(event):return "",401
    eventid=event["id"]
    with db() as c:
        if c.execute("SELECT 1 FROM events WHERE event_id=?",(eventid,)).fetchone():return "",200
    resource=event.get("resource") or {}
    subscription_id=resource.get("id") if event.get("event_type","").startswith("BILLING.SUBSCRIPTION") else (resource.get("billing_agreement_id") or resource.get("subscription_id"))
    if not subscription_id:return "",200
    # Fetch canonical subscription instead of trusting notification content.
    details=paypal("GET","/v1/billing/subscriptions/"+subscription_id,token=access_token())
    if details.get("plan_id")!=PLAN:return "",200
    tenant=details.get("custom_id")
    if not tenant:return "",200
    status=details.get("status","UNKNOWN")
    last=((details.get("billing_info") or {}).get("last_payment") or {}).get("time")
    # ACTIVE without a completed payment does not grant service access.
    with db() as c:
        c.execute("""INSERT INTO subscriptions VALUES (?,?,?,?,?)
          ON CONFLICT(paypal_id) DO UPDATE SET status=excluded.status,last_payment=excluded.last_payment,updated_at=excluded.updated_at""",
          (subscription_id,tenant,status,last,int(time.time())))
        c.execute("INSERT OR IGNORE INTO events VALUES (?,?)",(eventid,int(time.time())))
    return "",200
@app.get("/internal/entitlement/<tenant>")
def entitlement(tenant):
    if not internal_authorised(tenant):return jsonify(error="unauthorised"),401
    if not ready():return jsonify(active=False,reason="service_not_ready"),503
    with db() as c:
        row=c.execute("SELECT status,last_payment,updated_at FROM subscriptions WHERE tenant_id=?",(tenant,)).fetchone()
    if not row:return jsonify(active=False,reason="not_subscribed")
    status,last,updated=row
    if int(time.time())-updated>86400:return jsonify(active=False,reason="reconciliation_required"),503
    active=allowed(status,last)
    return jsonify(active=active,reason="paid" if active else "inactive_or_unpaid")

def valid_tenant(tenant):
    return isinstance(tenant,str) and 3<=len(tenant)<=64 and all(c.isascii() and (c.isalnum() or c in "_-") for c in tenant)

def tenant_paid(tenant):
    if not ready():return False
    with db() as c:
        row=c.execute("SELECT status,last_payment,updated_at FROM subscriptions WHERE tenant_id=?",(tenant,)).fetchone()
    return bool(row and int(time.time())-row[2]<86400 and allowed(row[0],row[1]))

@app.post("/internal/tenants")
def create_tenant():
    obj=request.get_json(silent=True) or {}
    tenant=obj.get("tenant_id")
    if not valid_tenant(tenant):return jsonify(error="Invalid tenant"),400
    if not internal_authorised(tenant):return jsonify(error="unauthorised"),401
    name=obj.get("display_name","")
    if not isinstance(name,str) or not 1<=len(name)<=80:return jsonify(error="Invalid name"),400
    data=json.dumps({"arrival":"","parking":"","wifi_info":"","house_rules":"","extras":""})
    with db() as c:
        try:c.execute("INSERT INTO tenants VALUES (?,?,?,?)",(tenant,name,data,int(time.time())))
        except sqlite3.IntegrityError:return jsonify(error="Already exists"),409
    return jsonify(tenant_id=tenant),201

@app.route("/internal/tenants/<tenant>/guide",methods=["GET","PUT"])
def manage_guide(tenant):
    if not valid_tenant(tenant) or not internal_authorised(tenant):return jsonify(error="unauthorised"),401
    with db() as c:
        row=c.execute("SELECT display_name,guest_info FROM tenants WHERE tenant_id=?",(tenant,)).fetchone()
        if not row:return jsonify(error="Not found"),404
        if request.method=="PUT":
            obj=request.get_json(silent=True)
            keys={"arrival","parking","wifi_info","house_rules","extras"}
            if not isinstance(obj,dict) or set(obj)!=keys or any(not isinstance(v,str) or len(v)>1000 for v in obj.values()):return jsonify(error="Invalid guest guide"),400
            c.execute("UPDATE tenants SET guest_info=? WHERE tenant_id=?",(json.dumps(obj),tenant))
            return jsonify(saved=True)
        return jsonify(display_name=row[0],guest_info=json.loads(row[1]))

@app.get("/api/guest/<tenant>")
def guest_guide(tenant):
    if not valid_tenant(tenant) or not tenant_paid(tenant):return jsonify(error="Unavailable"),404
    with db() as c:
        row=c.execute("SELECT display_name,guest_info FROM tenants WHERE tenant_id=?",(tenant,)).fetchone()
    if not row:return jsonify(error="Unavailable"),404
    return jsonify(display_name=row[0],guest_info=json.loads(row[1]))

@app.get("/return")
def returned():
    return "PayPal authorisation received. Activation only follows verified successful payment.",200
@app.get("/cancel")
def cancel():return "Payment cancelled. No subscription access activated.",200
from customer_dashboard import mount_customer_dashboard
mount_customer_dashboard(app,db,tenant_paid,internal_authorised)
from operator_api import mount_operator_api
mount_operator_api(app,db,internal_authorised,ready,allowed)

if __name__=="__main__":app.run(host="0.0.0.0",port=int(os.getenv("PORT","8080")))
