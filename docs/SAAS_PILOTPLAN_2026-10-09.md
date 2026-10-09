# Gaeste-App SaaS: Produkt- und Pilotkonzept (9.10.2026)

Status: ENTWURF auf separatem Entwicklungsbranch. Keine produktiven Aenderungen, keine aktiven Abos, keine Kundenkontakte.

## Ziel
Eine mehrmandantenfaehige, mobile Gaeste-Web-App fuer kleine Unterkuenfte in AT/DACH. Messbarer Nutzen statt nur digitaler Infomappe: weniger Rueckfragen, einfachere Pflege, mehr Zusatzverkaeufe.

## Bestand
Das bestehende Gaeste-Repo ist eine spezialisierte Wachau-Web-App (index.html, app.js, i18n.js, style.css), mit PWA-Manifest, lokalen Inhalten und Supabase-basierten Chronikfunktionen. Das bestehende Angebot darf durch die Produktentwicklung nicht beeintraechtigt werden.

## MVP (Pilot)
1. Mandanten-Trennung: tenant_id, Unterkunftsprofil, Branding, Berechtigungen/RLS; kein Zugriff zwischen Kunden.
2. Gaesteansicht ohne Login: Anreise, Check-in, WLAN, Parken, Ausstattung, FAQ, Kontakt, Ausfluege, Sprachen DE/EN.
3. Gastgeber-Editor mit Inhaltsvorschau, Versionsverlauf und Freigabe.
4. Individuelle URL und druckbarer QR-Code.
5. Feedback ohne personenbezogene Zwangsangaben; datensparsame Auswertung.
6. Keine PayPal- oder Kundenzahlungsdaten im Browser speichern.
7. Kein Live-Event/Verkehrshinweis ohne Datum, Quelle, Gueltigkeitspruefung.
8. Kein automatisches Versenden von Kundennachrichten ohne Einwilligung und Test.

## Differenzierung
- Setup fuer eine Unterkunft in unter 30 Minuten (Ziel, muss getestet werden).
- Verifizierte lokale Hinweise optional, klar vom Stammcontent getrennt.
- Einsparpotenzial an Gaesteanfragen und Zusatzangebote messbar.
- Keine Pflicht-Appinstallation, QR-Link.

## Preistest statt Zusagen
Starter 9 EUR/Monat fuer Grundfunktionen; Plus 19 EUR/Monat mit Feedback und Mehrsprachigkeit; Pro 39 EUR/Monat nur bei echtem Zusatznutzen. Preise sind Hypothesen. Referenz: Touch Stay, Chekin haben guenstige Konkurrenzangebote.

## Pilot und Go/No-Go
- 10 Interviews mit Vermietern, 3 nachvollziehbare Kaufabsichten mit Preis.
- 3 Pilotunterkuenfte, 2 Wochen echter Gaestebetrieb mit Zustimmung.
- Null Datenschutzlecks, null tenant-uebergreifende Daten, klare Backup-/Restoreprobe.
- Kaufabschluss nur mit Betreiberfreigabe, geklaertem Gewerbe/Steuer-/Datenschutzsetup.

## Reihenfolge
1. Sicherheitsreview vorhandener Dateien, Abhaengigkeiten, Secrets und Supabase-Zugriff.
2. Neue SaaS-Komponenten strikt getrennt von bestehender Gaeste-App.
3. Inhaltsmodell und Editor-Prototyp auf Entwicklungsbranch.
4. Automatisierte Tests inkl. Isolation, Accessibility und Mobilgeraete.
5. Preis-/Landingpage-Test, dann Pilot.
6. Abrechnung erst nach Gewerbe-/Datenschutz-/Vertragsfreigabe; Zahlungsanbieter zahlt direkt an Betreiber.

## Betrieb und Support
FAQ, Supportformular mit Ticketnummer, Autoeingangsantwort, Prioritaeten, Rueckmeldungen. Ein KI-Assistent darf Entwuerfe erstellen, aber keine unbeaufsichtigten verbindlichen Aussagen, Erstattungen oder Vertragsveraenderungen durchfuehren. Automatisierte taegliche und woechentliche Reports nach Einrichtung separat.

## KPI
Leads, Demoanfragen, Pilotaktivierung, zahlende Kunden, MRR, Churn, Supportminuten je Kunde, aktive Gaeste, Zusatzverkaeufe, Provisionen, Refunds, Nettobeitrag.

## Fehlende Freigaben / Voraussetzungen
Betreiberdaten, Gewerbe-/Steuerstatus, Datenschutzvertraege, Markenpruefung, Zahlungsvertrag und eigene PayPal-Business-Verknuepfung. Keine fremden Zahlungen auf ein KI-Konto oder manuelle Gewinnueberweisungen.

## Betreiberangaben (vom Auftraggeber am 09.10.2026 festgelegt)
- Geschäftsbezeichnung: Rainsoft Johann Prem.
- Unternehmer/Vertragspartner: Johann Prem persönlich.
- Geschäftsadresse: bisherige Adresse unverändert; exakte postalische Schreibweise für Impressum/Rechnungen noch gegen bestätigte Stammdaten prüfen.
- Rechtlicher Status der Geschäftsbezeichnung und erforderliche Gewerbeberechtigung vor Verkauf prüfen. Keine Behauptung einer Firmenbucheintragung.
- Zahlungsabwicklung und Auszahlungen ausschließlich über vom Betreiber freigegebene, auf ihn lautende Geschäftskonten; keine Zahlungsdaten im öffentlichen Repository.

## Gewerbe- und Steuerstatus (Rueckmeldung vom 09.10.2026)
- Auftraggeber moechte vorerst im umsatzsteuerlichen Kleinunternehmermodell arbeiten.
- Eine aufrechte IT-Gewerbeberechtigung wurde nicht bestaetigt (Antwort: 'vorerst nicht').
- Bis Klaerung keine entgeltlichen Kundenvertraege, Rechnungen oder Live-Zahlungsabwicklung aktivieren.
- WKO-Pruefung: Das freie Gewerbe 'Dienstleistungen in der automatischen Datenverarbeitung und Informationstechnik' kann Softwareentwicklung und Vertrieb abdecken; eine Anmeldung ist unabhaengig von der Kleinunternehmerregelung erforderlich, soweit die Taetigkeit der GewO unterliegt.
- Die Grenze von 55.000 EUR ist eine Umsatzsteuerregel, nicht automatisch eine Befreiung von Gewerbe und SVS.
