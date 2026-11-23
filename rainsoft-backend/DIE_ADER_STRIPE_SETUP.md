# DIE ADER – eigener Stripe-Kauf und geschützter Reader (Stand 12.11.2026)

## Tatsächlich umgesetzt

- Isolierte Flask-Routen unter `/books/die-ader` auf dem bestehenden Railway-Rainsoft-TEST-Dienst. Keine Änderungen an den Buchungskassen von Zuhause am Bach.
- Volltext der bereitgestellten 258-seitigen Autor-PDF in **26 nicht öffentlichen** Railway-Umgebungsvariablen `BOOK_DIE_ADER_PAGES_01` bis `26`. Die Datei selbst wurde nicht in einem öffentlich lesbaren GitHub-Repository veröffentlicht.
- Bereits vorhandenes separates Systeme.io-Modul mit 13 aktiven Lektionen bleibt unberührt. Die neue Railway-Berechtigung ist **eine Alternative** zur Systeme.io-Freischaltung, keine behauptete automatische Einschreibung in Systeme.io.
- Stripe-hosted Checkout: 9,90 EUR einmalig, 1 Produkt, kein Abo, zwei getrennte ausdrückliche aktive Erklärungen.
- Stripe-Signaturprüfung für Webhooks mit Zeitfenster; vollständige serverseitige Nachprüfung der Checkout-Session mittels Stripe-API vor Entitlement-Erstellung.
- Für Entitlement müssen E-Mail, Produktkennung, Betrag, Währung, Zahlungsstatus und Checkout-Status exakt passen.
- Persönlicher Token über E-Mail, gehashter Token in SQLite, sichere HttpOnly/SameSite-Cookie, serverseitig geprüfter Paid-Status auf jeder Seite, Escape von Text, Sperre bei Rückerstattung/Dispute, Zeitraum mindestens 24 Monate (732 Tage).
- Railsafe Start: kein Buchcheckout, keine Zugangserteilung und keine Zahlung ohne vollständige Konfiguration.
- GitHub Actions `Rainsoft backend security tests` und `Static app smoke test` laufen erfolgreich; Offline-Simulation deckt bezahlte Bestellung → Mail-Link → Reader-Zugriff → Widerruf/Sperre ab.
- Stripe-Test-WebHook unter `https://rainsoft-backend-test-test.up.railway.app/books/stripe/webhook` registriert, Secret über Railway hinterlegt, **Webhook in Stripe anschließend deaktiviert**.
- Test-Health öffentlich erreichbar: `/books/die-ader/health` meldete nach Deployment `reader_complete:true`, `enabled:false`, `live:false`.
- Kein echter Kauf, kein Sandbox-Kauf und kein echter E-Mail-Versand durchgeführt.

## Blocker zur Aktivierung

1. **Stripe API-Key** ist über die verbundenen Tools nicht als Schlüssel zur sicheren Ablage im neuen Railway-Dienst abrufbar. Die bisherige Testumgebung im anderen Railway-Projekt weist zwar `STRIPE_SECRET_KEY` als Variablennamen aus, liefert den geheimen Wert aber absichtlich nicht. Zugangsdaten nie in Chat oder GitHub posten.
2. **Verifizierter Versender:** Bei der Prüfung im verbundenen Resend-Konto standen die beiden vorhandenen Domains auf `failed` beziehungsweise `not_started`. Daher fehlt ein nachweislich funktionsfähiger SMTP-/E-Mail-Anbieter für Käufer-Zugangslinks. Der Code erwartet `BOOKS_SMTP_HOST`, `BOOKS_SMTP_PORT` (standardmäßig 465), `BOOKS_SMTP_USER`, `BOOKS_SMTP_PASSWORD`, `BOOKS_MAIL_FROM`.
3. **Getrennter Händler:** Das angeschlossene Stripe-Live-Konto trägt bisher den Namen „Zuhause am Bach“. Vor Buchverkäufen wirtschaftlichen Zahlungsempfänger, Rechnungs-/Ausstellerdaten und Steuerbehandlung prüfen; kein stillschweigender Verkauf der Autorenbücher über den Zimmerbetrieb.
4. **Checkout-Abnahme**: Sandbox-Zahlung mit gültiger Testkarte, Webhook-Zustellung, E-Mail-Empfang, Login zur ersten/letzten Buchseite, Rückerstattungs-/Dispute-Sperre, Pflichtcheckboxen und Vertragsbestätigung müssen Ende-zu-Ende bestätigt sein.
5. **Rechtliche Prüfung:** Das Produkt nutzt derzeit einen generischen 9,90-EUR-Einmalpreis, ohne Stripe-Tax. Verkäuferangaben, UID/Kleinunternehmerregel, VAT-/USt.-Behandlung und die konkrete Rechtmäßigkeit des Einwilligungs-/Rücktrittsablaufs sind zu klären, bevor ein öffentlicher Kaufbutton erscheint.

## Environment (nicht in GitHub speichern)

- `BOOKS_ORIGIN=https://rainsoft-backend-test-test.up.railway.app` (Test)
- `BOOKS_SESSION_SECRET` zufälliger 64-Zeichen-Schlüssel (gesetzt)
- `BOOK_DIE_ADER_PAGES_01..26` (gesetzt, serverseitig)
- `STRIPE_BOOK_WEBHOOK_SECRET` (Test, gesetzt; Stripe-WebHook noch deaktiviert)
- `STRIPE_BOOK_SECRET_KEY` (Test: `sk_test_...`; noch nicht gesetzt)
- `BOOKS_SMTP_HOST`, `BOOKS_SMTP_USER`, `BOOKS_SMTP_PASSWORD`, `BOOKS_MAIL_FROM` (noch nicht gesetzt)
- `BOOKS_TEST_ENABLED=false`, `BOOKS_LIVE_ENABLED=false` (gesetzt)
- Test niemals mit Live-Key; Live nur nach separate Händler-/Abnahmeprüfung. `BOOKS_LIVE_ENABLED=true` benötigt passenden `sk_live_`-Schlüssel und signierten Live-Webhook mit eigenem Secret.

**Korrekte Bedeutung von „vorbereitet“:** Der Quellcode ist geschrieben, Tests sind grün und der Testdienst blockiert ungeprüfte Zugriffe. Ein öffentlich verkaufbares Produkt mit bewiesener automatischer Auslieferung besteht noch NICHT.

## Nächster Schritt
Sichere Konfiguration eines passenden Stripe-Test-API-Keys und eines verifizierten Maildiensts unmittelbar in Railway (nie per Chat), dann Webhook aktivieren und einen isolierten echten Stripe-Testmodus-End-to-End-Kauf ohne Kosten durchführen. Erst danach über die Freigabe eines öffentlichen Kaufbuttons entscheiden.
