#!/usr/bin/env python3
"""Import ISBN-specific cover images for titles with independently matched book pages.

Only two allowlisted sources are used. Never enable checkout links or mutate prices.
"""
from __future__ import annotations
import io
import json
import re
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "prem-digital-katalog.json"
PAGE = ROOT / "prem-digital-editionen.html"
IMAGES = ROOT / "images" / "ebooks"
REPORT = ROOT / "marketing" / "isbn-cover-import-report.json"
SOURCES = [
    {
        "id": "bestand-auswandern-bulgarien",
        "isbn": "9783565378111",
        "source": "https://diebuchsuche.de/c-9783565378111-0.jpg",
        "listing": "https://diebuchsuche.at/buch-isbn-9783565378111.html"
    },
    {
        "id": "bestand-auslandshund",
        "isbn": "9783565264742",
        "source": "https://diebuchsuche.de/c-9783565264742-0.jpg",
        "listing": "https://diebuchsuche.at/buch-isbn-9783565264742.html"
    },
]

def retrieve(item):
    source = item["source"]
    assert re.fullmatch(r"https://diebuchsuche\.de/c-\d{13}-0\.jpg",source)
    req = urllib.request.Request(source,headers={"User-Agent":"Mozilla/5.0","Accept":"image/jpeg,image/*"})
    with urllib.request.urlopen(req,timeout=15) as response:
        if not response.geturl().startswith("https://diebuchsuche.de/"):
            raise ValueError("Untrusted redirect")
        raw=response.read(8_000_001)
    if len(raw)>8_000_000:
        raise ValueError("Image too large")
    im=Image.open(io.BytesIO(raw))
    im.load()
    if im.width<180 or im.height<250:
        raise ValueError(f"Insufficient resolution {im.width}x{im.height}")
    ratio=im.width/im.height
    if not (0.46<=ratio<=0.88):
        raise ValueError(f"Not a vertical full-front cover (ratio {ratio:.3f}); refusing crop")
    im=ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((640,1000),Image.Resampling.LANCZOS)
    out=io.BytesIO()
    im.save(out,format="JPEG",quality=87,optimize=True,progressive=True)
    return out.getvalue(),(im.width,im.height)

def patch_static(markup, title, cover_url):
    import html
    title=html.escape(title,quote=True)
    image=f'<div class="book-cover"><img src="{html.escape(cover_url,quote=True)}" alt="Cover zu {title} (ISBN-geprüfte Bildzuordnung)" loading="lazy" width="460"></div>'
    pattern=re.compile(r'<article class="book">[\s\S]*?</article>')
    count=[0]
    def patch(m):
        card=m.group(0)
        if '<h3>'+title+'</h3>' not in card:
            return card
        revised,n=re.subn(r'<div class="book-cover no-original"[^>]*><div class="no-original-cover">[\s\S]*?</div></div>',image,card,count=1)
        count[0]+=n
        return revised
    return pattern.sub(patch,markup),count[0]

def main():
    db=json.loads(CATALOG.read_text(encoding="utf-8"))
    web=PAGE.read_text(encoding="utf-8")
    imported=[];failed=[];changed=0
    for item in SOURCES:
        book=next((b for b in db["books"] if b["id"]==item["id"]),None)
        if not book:
            failed.append({"id":item["id"],"reason":"Unknown book id"});continue
        if book.get("cover_url"):
            continue
        try:
            image,dimensions=retrieve(item)
            dest=IMAGES/("isbn-"+item["isbn"]+".jpg")
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_bytes(image)
            cover_url="images/ebooks/"+dest.name
            web,n=patch_static(web,book["title"],cover_url)
            if n!=1:
                dest.unlink(missing_ok=True)
                raise ValueError(f"Expected exactly one matching placeholder, found {n}")
            book["cover_url"]=cover_url
            book["cover_alt"]="ISBN-bezogenes Cover: "+book["title"]
            book["cover_source"]=item["listing"]
            book["cover_match"]="ISBN der Buchseite und Bilddatei stimmen überein; Abgleich mit eigener Druckvorlage noch offen"
            book["cover_verified"]=False
            book["cover_imported_at"]="2026-11-10"
            imported.append({"id":item["id"],"isbn":item["isbn"],"dimensions":dimensions,"bytes":len(image),"file":cover_url})
            changed+=n
        except Exception as exc:
            failed.append({"id":item["id"],"reason":type(exc).__name__+": "+str(exc)[:160]})
    if imported:
        CATALOG.write_text(json.dumps(db,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        PAGE.write_text(web,encoding="utf-8")
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps({"imported":imported,"failed":failed,"source":"Matched by ISBN in named public catalog, not original Windows files","verified_edition":False},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Extra ISBN cover import: {len(imported)} imported, {len(failed)} not imported, {changed} updated cards")
    for bad in failed:
        print("NOT IMPORTED:",bad)

if __name__=="__main__":main()
