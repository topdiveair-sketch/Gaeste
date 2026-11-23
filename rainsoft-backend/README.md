# Rainsoft checkout implementation (not live)

Separate service. Does not change booking payments. Requires PayPal BUSINESS REST API client ID/secret, subscription plan ID created under intended merchant, webhook ID, and separate Railway service with persistent /data volume.

Set PAYPAL_MODE=live, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_PLAN_ID, PAYPAL_WEBHOOK_ID, PUBLIC_ORIGIN, RAINSOFT_DB=/data/rainsoft.sqlite3, RAINSOFT_LIVE_ENABLED=true, RAINSOFT_TENANT_AUTH_READY=true only AFTER implementing/verifying tenant authentication.

Start: gunicorn -b 0.0.0.0:$PORT app:app

Security: no embedded credentials, no automatic payouts, subscription approval does NOT unlock access. A verified PayPal webhook queries PayPal canonical subscription and records last_payment. For production, add authenticated tenant lookup, entitlement expiry verification, failed-payment logic, refund/reversal tracking, transactional event processing, security tests, billing emails and merchant verification. These blockers intentionally prevent checkout going live.

IMPORTANT: A PAYPAL_EMAIL string in the old booking service does not imply PayPal REST API credentials or a subscription plan for Rainsoft.
