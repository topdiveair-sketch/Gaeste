Zuhause am Bach Gäste-App V77 – Komoot-Komfortimport

NEU
- Je Tour neuer Hauptbutton „🟢 In Komoot öffnen“.
- Die App lädt die offizielle GPX-Datei und versucht sie über die systemeigene Teilen-/Öffnen-Funktion an eine installierte App zu übergeben.
- Wenn Dateifreigabe im Browser nicht unterstützt wird, wird die GPX automatisch gespeichert.
- Separater Fallback „📥 GPX speichern“ bleibt immer sichtbar.
- Komoot-Anleitung direkt in der App:
  Profil → Geplante Touren → Importieren → Datei importieren → Importieren und planen.
- Bei Nachfrage zur Routenführung wird für die offiziell geprüften GPX-Routen „An Originalroute festhalten“ empfohlen.
- Hinweis zur Offline-Nutzung vor Tourstart ergänzt.

WARUM KEIN VOLL-AUTOMATISCHER KONTOIMPORT?
Komoot stellt laut offizieller Dokumentation keine öffentlich zugängliche API bereit.
Ein automatischer Schreibzugriff in das persönliche Komoot-Konto wäre daher nicht stabil/offiziell.
V77 nutzt den offiziell unterstützten GPX-Dateiimport.

TECHNIK
- Web Share API / Dateiübergabe wird genutzt, wenn Browser + Betriebssystem sie unterstützen.
- Fallback ist normaler GPX-Download.
- Keine Zugangsdaten oder Komoot-Logins werden in Zuhause am Bach gespeichert.
