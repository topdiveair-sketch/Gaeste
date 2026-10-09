"""Customer password and browser sessions: separate from internal signed admin API."""
import os, secrets, re
from functools import wraps
from flask import Blueprint, request, jsonify, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash

def mount_customer_dashboard(app, db, tenant_paid, internal_authorised):
    app.config.update(SECRET_KEY=os.environ.get("RAINSOFT_SESSION_SECRET") or secrets.token_hex(32),
                      SESSION_COOKIE_HTTPONLY=True,
                      SESSION_COOKIE_SAMESITE="Lax",
                      SESSION_COOKIE_SECURE=os.getenv("APP_ENV")=="production",
                      PERMANENT_SESSION_LIFETIME=3600)
    bp=Blueprint("customer_dashboard",__name__)
    def valid(t): return bool(re.fullmatch(r"[A-Za-z0-9_-]{3,64}",t))
    def owner(t): return valid(t) and session.get("tenant")==t and session.get("authenticated") is True
    def check_origin():
        origin=request.headers.get("Origin")
        if not origin:return False
        return origin.rstrip("/")==os.environ.get("PUBLIC_ORIGIN","").rstrip("/")
    @bp.post("/internal/tenants/<tenant>/password")
    def set_password(tenant):
        if not valid(tenant) or not internal_authorised(tenant):return jsonify(error="unauthorised"),401
        obj=request.get_json(silent=True) or {}
        password=obj.get("password","")
        if not isinstance(password,str) or not 14<=len(password)<=128:return jsonify(error="Password must have 14-128 characters"),400
        with db() as c:
            if not c.execute("SELECT 1 FROM tenants WHERE tenant_id=?",(tenant,)).fetchone():return jsonify(error="unknown tenant"),404
            c.execute("CREATE TABLE IF NOT EXISTS customer_credentials(tenant_id TEXT PRIMARY KEY, password_hash TEXT NOT NULL)")
            c.execute("INSERT INTO customer_credentials VALUES (?,?) ON CONFLICT(tenant_id) DO UPDATE SET password_hash=excluded.password_hash",(tenant,generate_password_hash(password)))
        return jsonify(updated=True)
    @bp.post("/api/host/<tenant>/login")
    def login(tenant):
        if not valid(tenant) or not check_origin():return jsonify(error="unauthorised"),401
        obj=request.get_json(silent=True) or {}
        password=obj.get("password")
        if not isinstance(password,str):return jsonify(error="unauthorised"),401
        with db() as c:
            c.execute("CREATE TABLE IF NOT EXISTS customer_credentials(tenant_id TEXT PRIMARY KEY, password_hash TEXT NOT NULL)")
            row=c.execute("SELECT password_hash FROM customer_credentials WHERE tenant_id=?",(tenant,)).fetchone()
        if not row or not check_password_hash(row[0],password):return jsonify(error="unauthorised"),401
        session.clear()
        session["tenant"]=tenant
        session["authenticated"]=True
        session.permanent=True
        return jsonify(authenticated=True)
    @bp.post("/api/host/<tenant>/logout")
    def logout(tenant):
        if not check_origin():return jsonify(error="forbidden"),403
        session.clear()
        return jsonify(ok=True)
    @bp.route("/api/host/<tenant>/guide",methods=["GET","PUT"])
    def guide(tenant):
        if not owner(tenant):return jsonify(error="unauthorised"),401
        if request.method=="PUT" and not check_origin():return jsonify(error="forbidden"),403
        with db() as c:
            row=c.execute("SELECT display_name,guest_info FROM tenants WHERE tenant_id=?",(tenant,)).fetchone()
            if not row:return jsonify(error="unknown tenant"),404
            if request.method=="PUT":
                obj=request.get_json(silent=True)
                keys={"arrival","parking","wifi_info","house_rules","extras"}
                if not isinstance(obj,dict) or set(obj)!=keys or any(not isinstance(v,str) or len(v)>1000 for v in obj.values()):return jsonify(error="invalid content"),400
                import json
                c.execute("UPDATE tenants SET guest_info=? WHERE tenant_id=?",(json.dumps(obj),tenant))
                return jsonify(saved=True)
            import json
            return jsonify(display_name=row[0],guest_info=json.loads(row[1]),paid=bool(tenant_paid(tenant)))
    @bp.get("/host")
    def host_ui():return send_from_directory(os.path.dirname(__file__),"dashboard.html")
    app.register_blueprint(bp)
