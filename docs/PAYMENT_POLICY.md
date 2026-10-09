# Rainsoft Zahlungsrichtlinie (Stand 2026-10-09)

Betreiber: Rainsoft Johann Prem
Vom Betreiber angegebener PayPal-Empfaenger: topdiveair@gmail.com

## Einbahn-Zahlungsfluss
- Erlaubt: Kundenzahlungen und Auszahlungen von Verkaufsplattformen an das Betreiberkonto.
- Verboten: ausgehende Ueberweisungen, Massenauszahlungen, Abos, Einkaeufe, Lastschriften und automatische Rueckerstattungen durch Rainsoft-Anwendung oder KI.
- Keine Guthabenverwahrung durch die App; keine Zahlungsdaten von Gaesten speichern.
- Geschaeftskonto-/Empfaengerzuordnung muss vor Livebetrieb beim Zahlungsdienstleister verifiziert werden.
- Zahlungsabwicklung erst nach Gewerbe-, Steuer-, AGB-/Datenschutz- und Vertragspruefung freischalten.
- Einnahmen, Umsatz und Gewinn getrennt buchen; Umsatz nicht als Gewinn deklarieren.
- Server-seitig Transaktions-ID, Status, Betrag, Waehrung und Gebuehren nach verifizierten Webhooks protokollieren; idempotente Verarbeitung; keine Freigabe anhand Browser-Rueckleitung allein.
- PayPal-Anmeldedaten, Client Secrets und Zugangstokens NIE in GitHub ablegen.
- Unbekannte oder abweichende Zahlungsempfaenger blockieren und manuell pruefen.

Status: Konfiguration und Sicherheitsvorgaben dokumentiert. Keine PayPal-API angebunden, keine Zahlungsfunktion live, keine Kontoinhaberschaft bestaetigt.

## Betreibererklaerung 09.10.2026
Der Betreiber gibt an, dass Konto- und Rechtsfragen geklaert sind. Diese Angabe wird als Betreibererklaerung erfasst und nicht mit einer technischen PayPal-Verifizierung oder abgeschlossener API-Anbindung verwechselt. Freischaltung von Livezahlungen erst nach verifiziertem Zahlungsdienstleister-Onboarding, sicheren Server-Credentials, Webhook-Validierung und End-to-End-Zahlungstest. Bis dahin bleibt livePaymentsEnabled=false.
