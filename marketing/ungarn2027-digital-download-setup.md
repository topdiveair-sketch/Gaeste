# Ungarn 2027 | 29-EUR-Digitalpaket | Creator Store: Verkaufsfreigabeprotokoll

**Status: vorbereitet, NICHT LIVE.** Stand: 2026-11-05. Keine echten Abbuchungen, kein freigeschalteter Dateidownload.

## Zahlung und Produktstatus (Kontrollstand 2026-11-05, 11:25 MEZ)
- **PayPal für EUR in Systeme.io bestätigt:** `get_available_payment_methods(eur)` gibt `["paypal-rest"]` zurück. Der Nutzer hat eine PayPal-Bestätigungsseite geliefert. Welche E-Mail-Adresse und welcher rechtliche Verkäufer am PayPal-Gateway hinterlegt sind, wurde über die Schnittstelle **nicht unabhängig bestätigt**. Gewünschte PayPal-Adresse: `topdiveair@gmail.com`.
- **Preisplan tatsächlich angelegt und rückgelesen:** ID `3529200`, `one_shot`, `2900` Euro-Cent, `eur`, `taxBehavior=inclusive`, Descriptor `JFX PREM UNGARN`. Die korrekte Steuerbehandlung ist vor dem ersten echten Verkauf zu prüfen.
- **Digitalprodukt tatsächlich angelegt und rückgelesen:** ID `3474080`, Name `Ungarn 2027 – Entscheidungs- und Budgetpaket`, `source=digital-store`, verknüpft mit Preisplan `3529200`.
- **HARTER AUSLIEFERUNGSBLOCKER:** `resources=[]`, `confirmationEmailId=null`, Systeme.io-Dateimanager `items=[]`. Das Produkt hat **keine** hinterlegte Download-Datei und **keine** bestätigte automatische Liefer-E-Mail.
- **SICHERHEITSSTATUS:** Produkt derzeit **nicht als geprüft bestellbar bezeichnet**; keinen öffentlichen Checkout-Link setzen oder Verkauf bewerben. Ein bezahlter Testkauf wurde nicht durchgeführt.
- Die verfügbare Systeme.io-MCP-Schnittstelle bietet `get_files`, aber **keine passende Upload-Aktion für lokale ZIP-Dateien**; Opera-Browserconnector ist derzeit nur lesend/navigierend. Die Datei muss über Creator Store → Digital Download im eingeloggten Systeme.io-Editor hochgeladen und der Bestellablauf dort komplettiert werden.
- **ZIP-Prüfung erneut ausgeführt:** `unzip -t` meldet drei fehlerfreie Dateien, SHA-256 wie unten dokumentiert.

## Quelle des Produkts
- Produkt: **Ungarn 2027 – Entscheidungs- und Budgetpaket**
- Autor: J.F.X. Prem
- Preis: **29,00 EUR, einmalig, kein Abonnement**. Die steuerliche Einordnung und Bruttopreis-Behandlung sind vor Freischaltung anhand der tatsächlichen Verkäuferdaten zu bestätigen.
- Datei: `Ungarn_2027_Entscheidungspaket_TESTFASSUNG.zip` (enthält PDF, XLSX, README).
- ZIP-Gesamtgröße: **64.817 Bytes**.
- ZIP SHA-256: `dcf8880d8e566ef228b23a79c5a32fc46d6d47ac441450d76970aeb1d2b64a68`.
- ZIP-Integrität: CRC-Prüfung **bestanden** (Python zipfile.testzip() => None).
- Datei **nicht öffentlich** im GitHub-Repository ablegen; keine frei zugänglichen Kaufdateien auf einer Dankeseite verlinken.

## Was der Kunde erhält
1. Achtseitiger PDF-Praxisleitfaden zum Ruhestand in Ungarn mit Fragen und Behördenquellen.
2. XLSX-Kostenrechner mit sechs Tabellenblättern und Eingabefeldern zur persönlichen Planung.
3. Kurze README-Anleitung zum Lieferumfang.
4. Keine individuelle Steuer-, Rechts- oder Krankenversicherungsberatung, keine aktualisierten Daten auf Abruf, kein Abonnement.

## Aktueller technischer Befund
- Systeme.io: `get_available_payment_methods(currency=eur)` liefert **[paypal-rest]**; Zahlungs-Gateway nun erkannt, aber Verkäuferidentität nicht geprüft.
- Systeme.io File Manager: `get_files(types=document)` liefert **0** Dateien.
- Über Stripe verbunden: ausschließlich `Zuhause am Bach Sandbox`, `livemode=false`; kein verifiziertes Live-Konto des tatsächlichen Verkäufers.
- Systeme.io Public-API/MCP: `downloadable_file` kann **nicht** als File-Resource in einem über die API konfigurierten Funnel-Offer verwendet werden. Für fertige Downloadprodukte laut Anbieter die **Creator Store / Digital download**-Oberfläche nutzen.
- Deshalb bewusst **kein** nicht funktionsfähiger Sale-Funnel, kein Konto mit falschem Rechtsträger, keine öffentlich aktive Bezahlseite.

## Verkäuferaktion für die Einrichtung
1. Im passenden Systeme.io-Account zu **Profil > Einstellungen > Zahlungs-Gateways > Stripe: Verbinden** gehen (alternativ PayPal Business). Im Zahlungsdienst den korrekten rechtlichen Verkäufer autorisieren. **Keine** Zugangsdaten in GitHub oder Chat schreiben.
2. Von Systeme.io den erfolgreichen EUR-Zahlungsgateway-Status bestätigen lassen; anschließend API-Abfrage `get_available_payment_methods(eur)` wiederholen.
3. In **Creator Store** Produkt `Digital download` erstellen, Titel/29 EUR einmalig eintragen und das **lokale ZIP** hochladen. Ein ausgefülltes Checkout-Formular benötigt die verlangten Kontaktangaben.
4. Checkout mit rechtlich richtigen Anbieter-/Steuerdaten, Preisinformation, elektronischem Download, Widerrufsbedingungen und Datenschutzhinweisen fertigstellen.
5. Den automatischen Kaufbestätigungsbrief mit einer nur nach bezahltem Checkout nutzbaren Dateifreigabe konfigurieren. Vor Veröffentlichung mit einem sicheren Testkauf prüfen: bezahlt, E-Mail empfangen, Download funktioniert, falsche bzw. unbezahlt aufgerufene Bestellung erhält **keinen** Zugriff.
6. Erst nach erfolgreichen Tests Produkt veröffentlichen und die Live-Kauf-URL auf `ungarn-2027-entscheidungspaket.html` eintragen sowie deren `noindex`-Kennzeichnung nur auf ausdrückliche Freigabe entfernen.

## Vorbereitete Bestelltexte

**Kurzname:** Ungarn 2027: Entscheidungs- und Budgetpaket

**Produktbeschreibung:** Für alle, die ihren Ruhestand in Ungarn planen und vor einem Umzug die eigenen Einnahmen, laufenden Kosten, Rücklagen und Behördenfragen strukturiert durchgehen möchten. Enthalten sind ein PDF-Leitfaden, eine ausfüllbare Excel-Arbeitsmappe mit sechs Tabellenblättern und eine kurze Anleitung. Das Paket nutzt keine pauschalen Einsparungsversprechen und ersetzt keine persönliche Steuer-, Rechts- oder Versicherungsberatung.

**Preistext:** 29,00 EUR einmalig. Kein Abo. Gegebenenfalls rechtlich notwendige Umsatzsteuerangaben müssen im Checkout korrekt ausgewiesen werden.

**Bestellbestätigung, Betreff:** Dein Ungarn-2027-Entscheidungspaket

**Bestellbestätigung, Haupttext:** Vielen Dank für deine Bestellung. Du erhältst das digitale Ungarn-2027-Entscheidungspaket als ZIP-Datei mit PDF-Leitfaden, Excel-Kostenrechner und README. Nutze bitte den geschützten Download in dieser Bestellbestätigung. Bitte prüfe die Angaben für deinen konkreten Wohnort und deine persönliche Renten- und Krankenversicherungssituation bei den zuständigen Stellen. Wenn beim Download etwas nicht funktioniert, verwende den auf der Bestellseite angegebenen Verkäuferkontakt.

## Unvollständige Pflichtangaben, die NICHT erfunden werden dürfen
- Tatsächlicher Verkäufer / rechtlicher Unternehmensname, ladungsfähige Anschrift, Steuer- und USt-Behandlung.
- Tatsächlich funktionierender Kundensupport-Kontakt und korrekt verlinktes Impressum/Datenschutz.
- Verifizierte Live-Zahlungsanbindung und sichere Dateizustellung.
- Endgültige rechtlich geprüfte Belehrung für sofortige digitale Bereitstellung.
- Freigegebene Endfassung der Produktdateien (derzeit **TESTFASSUNG**).

## Offizielle Anleitungen
- Stripe-Anbindung: https://help.systeme.io/article/225-how-to-connect-your-stripe-account-to-systeme-io
- PayPal-Anbindung: https://help.systeme.io/article/132-paypal-integration
- Creator Store / Digital Download: https://help.systeme.io/article/3861-how-to-set-up-a-creator-store

**Marketing-Status:** Kostenlose Vorschau unter `https://topdiveair-sketch.github.io/Gaeste/ungarn-2027-entscheidungspaket.html`; kein Bestellbutton. Bei Live-Freigabe Zahlungs- und Auslieferungskette neu prüfen.
