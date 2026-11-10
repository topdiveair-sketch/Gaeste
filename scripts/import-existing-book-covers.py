#!/usr/bin/env python3
"""Import author catalog's historically matched covers as local GitHub Pages assets.

A safety gate: only covers whose historical ASIN matches their image URL and
whose downloaded bytes pass image validation are used. No checkout URLs change.
"""
import concurrent.futures
import datetime
import html
import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / 'prem-digital-katalog.json'
OLD_HTML = ROOT / 'buecher.html'
SHOP_HTML = ROOT / 'prem-digital-editionen.html'
IMAGES = ROOT / 'images' / 'ebooks'
REPORT = ROOT / 'marketing' / 'cover-import-report.json'

MAX_BYTES = 12 * 1024 * 1024
ALLOWED_IMAGE_DOMAINS = {'m.media-amazon.com'}  # provenance: owner's historical catalogue


def historical_sources(document):
    # Existing archive labels each article with its ASIN and a specific image.
    mapping = {}
    for article in re.findall(r'<article\b[^>]*>.*?</article>', document, re.I | re.S):
        asin = re.search(r'\bASIN\s+(B0[A-Z0-9]{8})\b', article)
        img = re.search(r'<img\b[^>]*\bsrc="([^"]+)"', article, re.I)
        if not asin or not img:
            continue
        candidate = html.unescape(img.group(1))
        host = urllib.parse.urlsplit(candidate).hostname
        path = urllib.parse.urlsplit(candidate).path
        if not candidate.startswith('https://') or host not in ALLOWED_IMAGE_DOMAINS:
            continue
        # Match the image's ASIN to the ASIN printed with that specific article.
        if asin.group(1) not in path:
            continue
        if asin.group(1) in mapping and mapping[asin.group(1)] != candidate:
            continue
        mapping[asin.group(1)] = candidate
    return mapping


def get_image(payload):
    book_id, asin, address = payload
    req = urllib.request.Request(address,headers={
        'User-Agent':'Mozilla/5.0 (compatible; PremAuthorCoverArchive/1.0)',
        'Accept':'image/avif,image/webp,image/png,image/jpeg,image/*',
    })
    try:
        with urllib.request.urlopen(req, timeout=13) as response:
            final = urllib.parse.urlsplit(response.geturl())
            if final.scheme != 'https' or final.hostname not in ALLOWED_IMAGE_DOMAINS:
                return (book_id, asin, None, 'redirected outside allowed CDN')
            declared = response.headers.get('Content-Length')
            if declared and int(declared) > MAX_BYTES:
                return (book_id, asin, None, 'image above size limit')
            raw = response.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            return (book_id, asin, None, 'image above size limit')
        im = Image.open(io.BytesIO(raw))
        im.load()
        if im.width < 210 or im.height < 315:
            return (book_id, asin, None, 'image dimensions too small')
        ratio = im.width / im.height
        if not 0.45 <= ratio <= 0.9:
            return (book_id, asin, None, 'unexpected cover aspect ratio')
        im = ImageOps.exif_transpose(im).convert('RGB')
        im.thumbnail((630,1040),Image.Resampling.LANCZOS)
        bio=io.BytesIO()
        im.save(bio,format='JPEG',quality=83,optimize=True,progressive=True)
        return (book_id, asin, bio.getvalue(), '')
    except (OSError,ValueError,UnidentifiedImageError,TimeoutError) as exc:
        return (book_id, asin, None, type(exc).__name__+': '+str(exc)[:140])


def update_static(html_source, book):
    """Update only static fallback cover for an exact, escaped book title."""
    title = html.escape(book['title'], quote=True)
    pattern = (
        r'(<article class="book">)'
        r'(<div class="book-cover no-original"[^>]*>.*?</div></div>)'
        r'(<h3>' + re.escape(title) + r'</h3>)'
    )
    alt=html.escape(book.get('cover_alt') or ('Originalcover: '+book['title']),quote=True)
    url=html.escape(book['cover_url'],quote=True)
    replacement=(r'\1'+f'<div class="book-cover"><img src="{url}" alt="{alt}" loading="lazy" width="460"></div>'+r'\3')
    next_html, changed = re.subn(pattern,lambda m:m.group(1)+f'<div class="book-cover"><img src="{url}" alt="{alt}" loading="lazy" width="460"></div>'+m.group(3),html_source,count=1,flags=re.S)
    return next_html, changed


def main():
    catalog=json.loads(CATALOG.read_text(encoding='utf-8'))
    history=historical_sources(OLD_HTML.read_text(encoding='utf-8'))
    existing_local={b.get('legacy_asin') for b in catalog['books'] if b.get('cover_url')}
    candidates=[]
    used=set()
    for b in catalog['books']:
        asin=b.get('legacy_asin')
        if b.get('cover_url') or not asin or asin not in history or asin in used:
            continue
        used.add(asin)
        candidates.append((b['id'],asin,history[asin]))
    candidates.sort()
    IMAGES.mkdir(parents=True,exist_ok=True)
    imported=[];failed=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        for book_id,asin,picture,reason in pool.map(get_image,candidates):
            if picture is None:
                failed.append({'book_id':book_id,'asin':asin,'reason':reason})
                continue
            filename=f'legacy-{asin.lower()}.jpg'
            target=IMAGES/filename
            target.write_bytes(picture)
            entry=next(b for b in catalog['books'] if b['id']==book_id)
            entry['cover_url']=f'images/ebooks/{filename}'
            entry['cover_alt']='Originalcover laut bisherigem Autoren-Buchkatalog: '+entry['title']
            entry['cover_source']='Aus bisherigem Autorenbuchverzeichnis zugehöriger ASIN-Bildlink; als eigene Datei gespeichert'
            entry['cover_verified']=False
            entry['cover_match']='ASIN und Bildpfad stimmen überein; Motiv noch nicht mit lokaler Originaldatei abgeglichen'
            entry['cover_imported_at']='2026-11-10'
            imported.append({'book_id':book_id,'asin':asin,'filename':filename,'size':len(picture)})
    if imported:
        raw=SHOP_HTML.read_text(encoding='utf-8')
        replaced=0
        for b in catalog['books']:
            if b.get('cover_url'):
                raw,changed=update_static(raw,b)
                replaced+=changed
        SHOP_HTML.write_text(raw,encoding='utf-8')
        CATALOG.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    else:
        replaced=0
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps({
      'date':'2026-11-10',
      'source':'Existing buecher.html historical cover images, not the inaccessible Windows folder',
      'candidate_count':len(candidates),
      'downloaded_count':len(imported),
      'static_html_patched_count':replaced,
      'imported':imported,
      'failed':failed,
      'caveat':'Current publication and exact-edition cover are not independently verified. No checkout links enabled.'
    },ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Candidate covers: {len(candidates)} | imported: {len(imported)} | errors: {len(failed)} | fallback cards updated: {replaced}')
    for entry in failed:print('Cover unavailable:', entry['book_id'], entry['reason'][:120])


if __name__=='__main__': main()