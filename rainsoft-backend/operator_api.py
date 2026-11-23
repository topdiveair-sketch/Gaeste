"""Read-only operator monitoring API, HMAC-authenticated and data-minimized."""
import os,time
from flask import Blueprint,jsonify,request

def mount_operator_api(app,db,internal_authorised,ready,allowed):
    bp=Blueprint("rainsoft_operator",__name__)
    @bp.get("/internal/operator/overview")
    def overview():
        if not internal_authorised("admin"):return jsonify(error="unauthorised"),401
        with db() as c:
            customers=c.execute("SELECT count(*) FROM tenants").fetchone()[0]
            subscriptions=c.execute("SELECT tenant_id,status,last_payment,updated_at FROM subscriptions").fetchall()
            events=c.execute("SELECT count(*) FROM events").fetchone()[0]
        now=int(time.time())
        active=sum(1 for _,status,last,updated in subscriptions if now-updated<=86400 and allowed(status,last,now))
        return jsonify(service="Rainsoft GastKompass",payments_configured=bool(ready()),
                       live_payments_enabled=os.getenv("RAINSOFT_LIVE_ENABLED")=="true",
                       paypal_mode=os.getenv("PAYPAL_MODE","sandbox"),
                       tenant_count=customers,subscriptions_count=len(subscriptions),
                       paid_active_count=active,webhook_events_count=events,
                       timestamp=now)
    @bp.get("/internal/operator/tenants")
    def tenants():
        if not internal_authorised("admin"):return jsonify(error="unauthorised"),401
        with db() as c:
            rows=c.execute("""SELECT t.tenant_id,t.display_name,s.status,s.last_payment,s.updated_at
                FROM tenants t LEFT JOIN subscriptions s ON s.tenant_id=t.tenant_id
                ORDER BY t.tenant_id LIMIT 500""").fetchall()
        return jsonify(tenants=[dict(tenant_id=id,display_name=name,subscription_status=status or "NONE",
                      access_active=bool(status and updated and int(time.time())-updated<=86400 and allowed(status,last))) for id,name,status,last,updated in rows])
    app.register_blueprint(bp)
