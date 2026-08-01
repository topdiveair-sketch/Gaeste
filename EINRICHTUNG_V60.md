# Windi-Chronik V60 einrichten

1. In Supabase ein neues Projekt anlegen.
2. Den Inhalt von `supabase-schema.sql` im SQL Editor ausführen.
3. Unter **Authentication → Users** das Administratorkonto anlegen.
4. Unter **Project Settings → API** Projekt-URL und öffentlichen `anon`-Schlüssel kopieren.
5. Beide Werte in `chronicle-config.js` eintragen.
6. Alle Dateien wie bisher auf GitHub Pages veröffentlichen.

Ohne diese Werte läuft die Chronik im klar gekennzeichneten Demo-Betrieb. Beiträge werden dann nicht gespeichert.

## Enthalten

- öffentliche, moderierte Gäste-Chronik
- Einreichung mit maximal 10 Fotos à 8 MB
- Kategorien und anonyme Veröffentlichung
- geschützter Adminbereich mit Freigeben, Bearbeiten und Ablehnen
- eigene URL und QR-Code je freigegebenem Beitrag
- Sprachwechsel DE, EN, CZ, SK, HU, ES und FR für den neuen Hauptbereich

Die Jahresbuch-Funktion ist als nächster Ausbauschritt vorgesehen, sobald echte freigegebene Beiträge vorhanden sind.
