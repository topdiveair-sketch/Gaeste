# Rainsoft-Book: kostenfreie Vertragsmail-Automatisierung – Sicherheitsplan
Stand: 2026-11-11. Status: VORBEREITET, NICHT AKTIVIERT.

## Bereits nachgewiesen
- Bali: bezahlter Selbsttest 9,90 EUR am 11.11.2026, Stripe-Beleg und Rechnung, Systeme.io-Zugangsmail und tatsächlicher Readerzugriff auf ersten und letzten Abschnitt.
- Die einmalig manuell gesendete Bali-Vertragsbestätigung ist im Outlook-Postfach eingegangen.
- Systeme.io bietet im verbundenen Plan keine weitere Automationsregel und keinen weiteren Workflow. Bestehende Griechenland-Regel und Ungarn-Workflow dürfen nicht ersetzt werden.
- Die Verkäuferbenachrichtigung 'Herzlichen Glückwunsch ... neuer Verkauf' enthält Titel und Betrag, **nicht** die E-Mail-Adresse des Käufers.
- Resend-Domains zuhauseambach-wachau.at (failed) und diewildenwachauerwindis.at (not_started) sind nicht verifiziert; aktuell kein bestätigter Versandkanal.
- Stripe-Plugin hat nur ein Sandbox-Konto; Live-Konto ist derzeit nicht freigegeben.

## Sicherheitsanforderungen an eine spätere Automation
1. Ausschließlich verifizierte Live-Zahlungen als Auslöser (signierter Stripe-Webhook oder unabhängig abgeglichener API-Kaufdatensatz), keine unverifizierte Verkäufer-E-Mail.
2. Eine eindeutige Bestell- oder Zahlungs-ID als Deduplizierungsschlüssel, bei Wiederholungen keine zweite E-Mail.
3. Käuferadresse nur aus verifizierter Bestellung; kein Raten oder Zuordnen anhand ähnlich aussehender Namen.
4. Produktzuordnung strikt nach geprüften Preis-/Produkt-/Offer-IDs: Griechenland, Ungarn, Bulgarien, Bali. Unbekanntes Produkt => kein Versand und Alarm an Betreiber.
5. Nur nach erfolgreicher, nicht rückgängig gemachter Zahlung versenden. Zugriffsmail und Rechnung bleiben Aufgabe von Systeme.io.
6. Versand erst mit bestätigter Absenderdomain und tatsächlichem Testempfang aktivieren.
7. Jede E-Mail enthält konkret bestellten Titel, Gesamtpreis, Verkäuferidentität, Vertrags- und Rücktrittsinformation sowie die Zugangserklärung. Die Rechtstexte und steuerlichen Angaben bedürfen einer abschließenden Prüfung; nicht behaupten, dass Zustimmung/Verlust des Rücktrittsrechts bewiesen sei, wenn keine protokollierte Zustimmung vorliegt.
8. Protokoll: Zeit, pseudonymisierte Bestell-ID, Titel, gesendet/Fehler (keine Kreditkarten-, Passwort- oder API-Geheimnisse).
9. Nach Freigabe: zunächst ein kontrollierter Test ohne erneute echte Zahlung, dann einmaliger Kleintest mit dokumentierter Zustellung; automatische Überwachung und Fehlermeldungen.
10. Keine neuen kostenpflichtigen Dienste, kein Tarifwechsel, keine Änderung der bestehenden Checkout- und Kurs-Zuordnung ohne separate Funktionsprüfung.

## Nächste notwendige Freigaben
- Das Stripe-Live-Konto in der bestehenden Stripe-Verbindung freigeben oder einen anderen verifizierten Auftragsdaten-/Webhook-Zugang bereitstellen.
- Eine Absenderdomain verifizieren (ggf. DNS-Zugriff) oder eine andere nachweislich funktionierende Versandmethode festlegen.
- Rechnungseditor in Systeme.io über den authentifizierten Betreiberzugang korrigieren (Anschrift, steuerliche Behandlung nach Prüfung).

## Statusdefinition
VORBEREITET: Diese technische Sicherheitsbeschreibung ist im Repository gespeichert.
NICHT AKTIVIERT: Kein Live-Webhook, kein automatisches Versenden neuer Vertragsmails und kein E-Mail-Versand über Resend eingerichtet.
