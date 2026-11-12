# Rainsoft-Book – technischer Gesamtaudit (12.11.2026)

**Prüfumfang:** GitHub-Repository topdiveair-sketch/Gaeste (58 HTML-Dateien, 45 Datensätze in prem-digital-katalog.json, 193 GitHub-Tree-Dateieinträge), lokale href/src-Verweise nach Auflösung von ../, dynamische Katalog-Genrelogik, öffentliche Haupt-Katalogseite via Opera, Systeme.io-Kursmodule, Produktverknüpfungen und fünf ausgewählte Kassen-Editoren. Kein neuer kostenpflichtiger Kauf ausgelöst. Keine Live-Kundenanmeldung simuliert.

## Bestätigte Befunde
- **Kategorisierung live korrekt:** „UNTER UNS“ unter Science-Fiction & Fantasy, „DIE STADT DARUNTER“ unter Krimi & Thriller; Auswanderer-Preisgruppen enthalten die Romane nicht mehr. Das wurde nach GitHub-Pages-Deployment im Opera-Zugänglichkeitsbaum bestätigt.
- **Interne statische Dateiverweise:** Für die 58 HTML-Dateien wurden href/src-Pfade mit GitHub-Dateiliste abgeglichen. Keine fehlenden lokal referenzierten Buchseiten oder Cover erkannt. Als Sonderfälle wurden dynamische JavaScript-Templates und Links wie sms: oder Verzeichnislinks ./ nicht als fehlende Dateien gewertet. Externe HTTP-Ziele und Klickpfade sind davon nicht erfasst.
- **45 Katalogeinträge:** 5 mit Status pilot_sale_active; 2 mit Status buch_verfuegbar, aber ohne bestätigte Kaufmöglichkeit. Beide ungetesteten Romanprodukte müssen von tatsächlich geprüften Kaufangeboten getrennt bleiben.
- **Kursmodule:** „UNTER UNS“ – 7/7 aktive Leseabschnitte, ausschließlich Modul 2891182 im Produkt 3481073, Preisplan 9,90 €. „DIE STADT DARUNTER“ – 12/12 aktive Leseabschnitte, ausschließlich Modul 2891115 im Produkt 3481056, Preisplan 9,90 €. Die bloße Modulaktivierung beweist keinen erfolgreichen Käufer-Login.
- **UNTER UNS:** Kein eigener aktiver Checkout/Funnel-Schritt vorhanden, daher Direktkauf/automatischer persönlicher Reader-Zugang nicht bestätigt.
- **DIE STADT DARUNTER:** Checkout mit Produkt und 9,90 EUR vorhanden; echter End-to-End-Test und eigene Dankeseite nicht nachgewiesen. Zwei ausdrückliche Erklärungen wurden zusätzlich zum Kaufhinweise-Kästchen am 12.11. im Editor angelegt und geprüft, Pflichtfeldverhalten ungeprüft. Produktspezifische Vertragsmail verknüpft, deren automatischer Versand nicht belegt.
- **45 Jahre:** Vorhandene 9,90-EUR-Kasse; zwei ausdrückliche Zustimmungskästchen am 12.11. angelegt und geprüft, deren Pflichtfeldverhalten ungeprüft. Produktspezifische Vertragsmail verknüpft, automatischer Versand noch nicht belegt. Erfolgreicher persönlicher Käuferzugang im Audit nicht nachgewiesen.
- **Griechenland, Bulgarien, Bali:** In den geprüften Kassen jeweils zwei getrennte Einverständnis-Kästchen vorhanden, **Pflichtfeldvalidierung durch tatsächlichen Checkout in diesem Audit nicht getestet**.
- **Produktbestätigungs-E-Mails:** Für „UNTER UNS“, „DIE STADT DARUNTER“ und „45 Jahre“ sind neue individuelle Vertragsmails erstellt und im Produkt als confirmationEmailId zugeordnet. Der Mailstatistik-Test zeigt jeweils 0 zugestellte/versendete Mails; die tatsächliche automatische Vertragsbestätigung bleibt unbewiesen.
- **Buchcover:** „DIE STADT DARUNTER“ – im Repo 13.824 Bytes; aus dem Original erstellte verkleinerte WebP-Ausgabe, nicht die hochwertige Originalauflösung. „UNTER UNS“ – 125.644 Bytes; Dateien vorhanden, aber Bildschärfe in unterschiedlichen Bildschirmgrößen nicht separat visuell getestet.
- **Rechts-/Kaufhinweise:** Die separate Kaufhinweise-Seite benennt ausdrücklich vier Auswandererbücher und deren Produkte. Für verkaufbare Romane wie „45 Jahre“ ist zu prüfen, dass Vertragsinformationen den konkreten Roman und den Kaufablauf abdecken.
- **Darstellungsfehler korrigiert:** In der DIE-STADT-DARUNTER-Kasse fünf nicht belegte Bewertungssterne entfernt; korrigierte Text-Entity via Systeme.io erneut gelesen.

## Priorität und Abgrenzung
1. **Hoch:** Keine zusätzlichen Verkaufsbuttons oder Gebühren aktivieren, bevor funktionsfähiger Checkout mit individueller Berechtigung, Rechnung/Zugang und Vertragsinformation gesichert ist. Besonders „45 Jahre“ gesondert prüfen.
2. **Hoch:** „UNTER UNS“ hat trotz Reader und Preisprodukt noch keine Kasse. „DIE STADT DARUNTER“ hat Kasse, aber keinen nachgewiesenen Kaufabschluss mit E-Mail und Login.
3. **Mittel:** Kaufhinweise und Einwilligungsprotokoll für Romane; Produktbestätigungs-E-Mails; fehlende editorseitige Pflichtfeld- und Versandtests.
4. **Mittel:** Cover „DIE STADT DARUNTER“ durch qualitätsgeprüfte höher aufgelöste Originalvorderseite ersetzen und Live-Schärfe testen.
5. **Niedriger:** Browser-/Mobilansichten aller 58 HTML-Dateien und externe Link-Ziele umfassend durchklicken; Suchmaschinenindexierung und Nutzungsmessung separat prüfen.

**Wichtig:** Keine dieser Prüfungen ersetzt einen regulären Bezahl- und Leserzugangstest. Tests der fünf öffentlichen Checkout-Seiten erfolgten überwiegend anhand der verbundenen Administrationsdaten, nicht durch kostenpflichtige Buchung. Die vorhandenen GitHub-Aktions-Tests prüfen keinen persönlichen Leserlogin.

**Geändert während des Audits und der Nachbesserung:** Unbelegte fünf Bewertungssterne auf der Stadt-Darunter-Kasse entfernt; getrennte Rücktrittserklärungen in zwei Roman-Kassen ergänzt; drei individuelle Vertragsmails erstellt und zugeordnet; Kaufhinweise um drei Romane erweitert; öffentliche Zahl der Kaufangebote transparenter formuliert. Bestehende Kassenangebote und Kursberechtigungen unverändert gelassen.

## Nachprüfung der Nachbesserungen – 12.11.2026
- Systeme.io: Bestätigungs-Mail-IDs 13420893 (Stadt), 13420894 (Unter Uns), 13420896 (45 Jahre) an die richtigen Produkte gekoppelt; je eine zugeordnete Kursressource unverändert, 9,90 EUR unverändert.
- Zwei explizite Checkboxen sowohl bei „DIE STADT DARUNTER“ als auch „45 Jahre“ im Editor nach dem Speichern erneut ausgelesen. Rechtliche Wirksamkeit und Checkout-Pflichtfeldvalidierung noch offen.
- **15 von 15** kostenlosen Funnel-Schritten sind belegt (9 Griechenland-Reader, 4 Ungarn-Paket, 2 Griechenland-Paket), alle drei Funnels aktiv. Kein zusätzlicher Schritt angelegt oder bestehender Schritt gelöscht.
- Die kostenlosen/alternativen Shops wurden recherchiert, aber kein vollautomatischer Käuferzugang für „UNTER UNS“ eingerichtet. Eine fremde Kasse als Ersatz wäre keine korrekte Produktauslieferung.
- Vertragsmails in Systeme.io erstellt, aber Statistik jeweils **0 versendet**: Verknüpfung ist noch kein Funktionsnachweis. Steuer- und Händlerdaten wurden nicht verändert.
