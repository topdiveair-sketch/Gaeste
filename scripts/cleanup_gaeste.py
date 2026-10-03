from pathlib import Path
import re

p = Path("index.html")
s = p.read_text(encoding="utf-8")

replacements = {
    'content="Wachau-Gästeguide von Zuhause am Bach in Aggsbach Markt:': 'content="Wachau-Gästeguide von Zuhause am Bach – Wachau in Aggsbach Markt:',
    'content="Zuhause am Bach"': 'content="Zuhause am Bach – Wachau"',
    '"name":"Zuhause am Bach",': '"name":"Zuhause am Bach – Wachau",',
    '"dateModified":"2026-08-10"': '"dateModified":"2026-09-02"',
    'Welterbesteig-Wanderer, Donauradweg-Radfahrer, Familien und Ruhesuchende': 'Welterbesteig-Wanderer, Donauradweg-Radfahrer, Aktivgäste und Ruhesuchende',
    'href="https://topdiveair-sketch.github.io/Direcktbuchungen/index"': 'href="https://topdiveair-sketch.github.io/Direcktbuchungen/"',
    '<span>✅ Sofortige Bestätigung</span>': '<span>✅ Direkt bei den Gastgebern</span>',
}
for old, new in replacements.items():
    s = s.replace(old, new)

replacement = '''<section id="zimmer" class="card">
  <div class="kicker">🛏️ Ihr Zimmer</div>
  <h2>Gartenzimmer</h2>
  <div class="room-grid">
    <article><h3>🌿 Gartenzimmer</h3><p>Gemütliches Doppelzimmer für maximal zwei Personen. Das eigene private Badezimmer liegt direkt gegenüber und ist ausschließlich für die Gäste dieses Zimmers bestimmt.</p></article>
  </div>
  <p class="small"><strong>Zur Klarstellung:</strong> Die Unterkunft ist kein ganzes Ferienhaus. Es gibt keinen Whirlpool, keinen Innenpool, keine Gästeküche und keine Klimaanlage. Ein umweltbewusster Luftraumbefeuchter ist vorhanden.</p>
</section>'''

s, n = re.subn(r'<section id="zimmer" class="card">.*?</section>', replacement, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit("Zimmer-Abschnitt nicht eindeutig gefunden")

p.write_text(s, encoding="utf-8")
