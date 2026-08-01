# Windi-Chronik V63 – Supabase verbunden

Die App ist mit dem bestehenden Supabase-Projekt `veqlrabxvwurwnezjstg` verbunden.

## Eingerichtet und geprüft

- Tabelle `public.chronicle_entries`
- Row Level Security mit vier Tabellenrichtlinien
- öffentlicher Bildspeicher `chronicle-photos`
- maximal 10 Bilder pro Beitrag und 8 MB pro Bild
- Gast darf nur ungeprüfte Beiträge einreichen
- nur `topdiveair@gmail.com` darf alle Beiträge lesen und moderieren
- Magic-Link-Anmeldung für die Administration
- Auth-Site-URL `https://topdiveair-sketch.github.io/Gaeste/`
- öffentlicher Publishable Key in `chronicle-config.js`; kein geheimer Schlüssel im Browser

Der technische Testbeitrag wurde nach erfolgreicher Prüfung wieder gelöscht.

## Veröffentlichung

Den Inhalt dieses Ordners auf GitHub Pages unter `/Gaeste/` veröffentlichen. Danach im Bereich **Administration** die E-Mail `topdiveair@gmail.com` eingeben. Supabase sendet einen sicheren Anmeldelink.
