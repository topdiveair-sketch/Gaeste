# UFO-Reader: Stripe -> Systeme.io, abgesicherte Freischaltung

Stand 13. November 2026. **Status: Code vorbereitet, nicht deployed, nicht live getestet.**

## Verifizierte Buch- und Zahlungskennungen
- Stripe Live Payment Link: `plink_1UbGkS3PvFqHVzZFgAUMOJp5`
- Stripe Preis: `price_1UbGkH3PvFqHVzZFL3siH4e9`, 9,90 EUR einmalig
- Systeme.io Kurs: `703718`
- Alleiniges freizuschaltendes Modul: `2893054` (UFOs und die nukleare Welt, V7.6)
- Vorhandener Railway-Testdienst: `rainsoft-backend-test`, Projekt `rainsoft-gastkompass-test`
- Webhookroute (nach gesonderter Bereitstellung): `/integrations/ufo/stripe-webhook`
- Zustandsroute: `/integrations/ufo/health`

## Aktivierungsbedingungen (alle fehlen derzeit)
1. Beim Betreiber in Systeme.io unter **Einstellungen -> MCP & API-Schlüssel** einen eigenen Public-API-Schlüssel für die Integration erstellen. Den Schlüssel **niemals** im GitHub-Repository, Chat oder Frontend veröffentlichen. Die API-Kontakt- und Moduleinschreibungsformate müssen gegen die aktuelle Herstellerdokumentation und einen autorisierten Testkontakt bestätigt werden.
2. In Stripe einen eigens auf diese Integration beschränkten Live-Schlüssel zum serverseitigen Lesen von Checkout Sessions und Line Items sicher konfigurieren. Kein Schlüssel im Repository.
3. Railway: Variablen `STRIPE_UFO_SECRET_KEY`, `SYSTEME_UFO_API_KEY`, `UFO_FULFILLMENT_DB=/data/ufo-fulfillment.sqlite3`, zunächst `UFO_FULFILLMENT_ENABLED=false`.
4. Feature-Branch getrennt deployen, ohne vorhandene Gastzimmer-Buchungsdienste zu verändern. Vorher Tests und Live-Betriebsfreigabe.
5. Danach Stripe-Webhooks für **checkout.session.completed** auf das HTTPS-Ziel konfigurieren, dessen eigenes Signaturgeheimnis als `STRIPE_UFO_WEBHOOK_SECRET` sicher in Railway hinterlegen. Webhook-Signatur, die kanonische Stripe-Session, den spezifischen Payment-Link, den Preis, den Betrag und die Käufer-E-Mail gegen Stripe überprüfen.
6. Erst nach erfolgreichen Sicherheitstests und korrekter Teilzugangs-Einschreibung `UFO_FULFILLMENT_ENABLED=true` schalten.

## Abnahmetests, noch nicht durchgeführt
- Falsche / abgelaufene Stripe-Signatur -> 400, **kein Zugriff**
- Zahlung eines anderen Produkts oder falscher Betrag -> **kein Zugriff**
- Echtes bezahltes UFO-Checkout -> ausschließlich Modul 2893054, niemals Gesamtzugang
- Doppelte Stripe-Events -> keine doppelte ungewollte Berechtigung
- Bestehender Systeme.io-Kontakt und neuer Kontakt -> korrekte Verknüpfung
- fehlgeschlagene Systeme.io-API -> Retry statt falscher Erfolgsmeldung
- Käufer-E-Mail und erfolgreicher persönlicher Login in Systeme.io
- Storno/Rückerstattung und gesetzliche Rücktritts- und Zugangsregeln müssen vor Vollbetrieb separat umgesetzt werden.

**WICHTIG:** Der bestehende öffentliche Kaufbutton bleibt bis dahin beim manuellen Freischaltungs-Hinweis. Dieser Branch ist eine ungetestete Implementierungsvorbereitung, keine bestätigte Automatik. Das Systeme.io-Tariflimit für neue Tags verhindert die alternative Tag-Automatisierung, ein kostenpflichtiges Upgrade wird nicht ausgelöst.
