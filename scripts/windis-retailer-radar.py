#!/usr/bin/env python3
"""Windis distributor radar: conservative HTTP checks, snapshots and change log.

No paid services, no logins, no checkout calls. A HTTP 200 alone is NOT a sale.
Only explicitly observed offers become green; uncertain checks stay yellow.
"""
from __future__ import annotations
import datetime as dt
import html
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "windis-radar.json"
SOURCE = "https://raw.githubusercontent.com/topdiveair-sketch/windi-chronik/main/data/windis-books.json"
UA = "Mozilla/5.0 (compatible; WindisRetailAudit/1.0; +https://topdiveair-sketch.github.io/Gaeste/windis-buch-radar.html)"
# This edition is known from the public Amazon product page. Its ISBN is not
# inferred from the other editions and must not be mixed with epubli listings.
EXTRA = [{
    "band": 15, "title": "Die wilden Windis auf dem Dürnsteiner Weihnachtsmarkt",
    "isbn": "9798274948708", "authors": "Pia Ordelia, Johann Prem",
    "retailers": [{"dealer": "Amazon.de", "url": "https://www.amazon.de/dp/B0G2RYG75Y"}]
}]
# Search links are NOT evidence of availability; merely convenient manual discovery.
SEARCH_SHOPS = {
    "Amazon.de": "https://www.amazon.de/s?k=",
    "Thalia.de": "https://www.thalia.de/suche?sq=",
    "Hugendubel": "https://www.hugendubel.de/de/search/advanced?searchValue=",
    "Osiander": "https://www.osiander.de/suche?sq=",
    "Galaxus.de": "https://www.galaxus.de/de/search?q=",
}
POSITIVE = [
    r"\bin den warenkorb\b", r"\bjetzt kaufen\b", r"\bin den einkaufswagen\b",
    r"\bin den warenkorb legen\b", r"\bsofort lieferbar\b",
    r"\bauf lager\b", r"\bsofort verfügbar\b", r"\bdirekt bestellen\b"
]
NEGATIVE = [
    r"\bderzeit nicht verfügbar\b", r"\bnicht lieferbar\b",
    r"\baktuell nicht verfügbar\b", r"\bnicht mehr erhältlich\b",
    r"\bnicht bestellbar\b", r"\bnicht mehr lieferbar\b",
]
def today():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

def request_text(url, timeout=12):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        ct = response.headers.get("Content-Type", "").lower()
        body = response.read(650000).decode("utf-8", errors="replace")
        return response.geturl(), response.status, ct, body

def normalized(text):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", text, flags=re.I | re.S)))).lower()

def product_structured_status(book, raw):
    """Only accept schema.org availability attached to this exact ISBN/title."""
    patterns = re.findall(
        r'<script\b[^>]*type=["\x27]application/ld\+json["\x27][^>]*>(.*?)</script>',
        raw, flags=re.I | re.S)
    wanted_isbn = re.sub(r"\D", "", str(book.get("isbn") or ""))
    title_words = [w for w in re.findall(r"\w+", book["title"].lower()) if len(w) > 4]
    nodes = []
    def traverse(obj):
        if isinstance(obj, list):
            for v in obj:
                traverse(v)
        elif isinstance(obj, dict):
            typ = obj.get("@type", "")
            types = [typ] if isinstance(typ, str) else typ if isinstance(typ, list) else []
            if any(v in ("Product", "Book", "IndividualProduct") for v in types):
                nodes.append(obj)
            for value in obj.values():
                if isinstance(value, (dict, list)):
                    traverse(value)
    for chunk in patterns:
        try:
            traverse(json.loads(html.unescape(chunk)))
        except (ValueError, TypeError):
            continue
    for node in nodes:
        identifiers = " ".join(str(node.get(k, "")) for k in ("isbn", "sku", "gtin13", "gtin", "productID"))
        matched_isbn = wanted_isbn and wanted_isbn in re.sub(r"\D", "", identifiers)
        label = str(node.get("name") or "").lower()
        matched_title = sum(w in label for w in title_words[:7]) >= min(2, len(title_words))
        if not (matched_isbn or matched_title):
            continue
        offers = node.get("offers", [])
        for offer in (offers if isinstance(offers, list) else [offers]):
            if not isinstance(offer, dict):
                continue
            availability = str(offer.get("availability") or "").lower().rsplit("/", 1)[-1]
            if availability in ("outofstock", "discontinued", "soldout"):
                return "rot", "Strukturierte Produktdaten: nicht bestellbar"
            if availability in ("instock", "preorder", "onlineonly"):
                return "gruen", "Strukturierte Produktdaten: bestellbar"
    return None, None

def inspect(book, retailer):
    url = retailer.get("url", "")
    base = {"checked_at": today(), "url": url, "dealer": retailer["dealer"],
            "status": "gelb", "reason": "Nicht überprüft", "evidence": "Kein Kaufnachweis"}
    if not url.startswith("https://"):
        base["reason"] = "Kein gültiger HTTPS-Produktlink"
        return base
    try:
        final, status, ct, raw = request_text(url)
        base["final_url"] = final
        base["http_status"] = status
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as error:
        base["reason"] = "Händler technisch nicht prüfbar"
        base["evidence"] = type(error).__name__
        return base
    if "html" not in ct and "text" not in ct:
        base["reason"] = "Unerwarteter Seitentyp"
        return base
    structured, structured_evidence = product_structured_status(book, raw)
    if structured:
        base["status"] = structured
        base["reason"] = structured_evidence
        base["evidence"] = "schema.org Produktangebot"
        return base
    text = normalized(raw)
    isbn = str(book.get("isbn") or "")
    # Avoid matching a search page, store homepage, CAPTCHA, or unrelated item.
    title_words = [w for w in re.findall(r"\w+", book["title"].lower()) if len(w) > 4]
    title_match = sum(w in text for w in title_words[:7]) >= min(2, len(title_words))
    isbn_match = len(isbn) >= 10 and (isbn in text or re.sub(r"\D", "", isbn) in re.sub(r"\D", "", text))
    product_match = isbn_match or title_match
    if not product_match:
        base["reason"] = "Buchtitel/ISBN auf Zielseite nicht eindeutig bestätigt"
        return base
    neg = next((p for p in NEGATIVE if re.search(p, text)), None)
    pos = next((p for p in POSITIVE if re.search(p, text)), None)
    # Negative terms anywhere on a long page can refer to unrelated products.
    # Never mark red on unstructured vendor text. Require manual verification.
    if neg and not pos:
        base["status"] = "gelb"
        base["reason"] = "Möglicher Verfügbarkeitsverlust – manuell nachprüfen"
        base["evidence"] = "Hinweis auf Nichtverfügbarkeit"
    elif pos and not neg:
        base["status"] = "gruen"
        base["reason"] = "Produkttext und Kaufmöglichkeit gefunden"
        base["evidence"] = "Buchtitel/ISBN sowie Kaufsignal"
    elif pos and neg:
        base["reason"] = "Widersprüchliche Kaufsignale auf Händlerseite"
    else:
        base["reason"] = "Produkt gefunden, aber keine sichere Bestellbestätigung"
    return base

def clean_books(raw):
    items = []
    for book in raw.get("books", []) + EXTRA:
        identifier = str(book.get("isbn") or "").strip()
        if not identifier or not book.get("title"):
            continue
        retailers = []
        for e in book.get("retailers", []):
            if e.get("url", "").startswith("https://"):
                retailers.append({"dealer": e.get("dealer") or "Unbekannt", "url": e["url"]})
        items.append({"id": identifier, "isbn": identifier, "band": book.get("band"),
                      "title": book["title"], "authors": book.get("authors") or "",
                      "retailers": retailers})
    return items

def build(previous, feed, checker=inspect, now=None):
    moment = now or today()
    old = {(v["book_id"], v["dealer"], v["url"]): v
           for v in previous.get("offers", []) if all(x in v for x in ("book_id", "dealer", "url"))}
    offers, changes = [], []
    books = clean_books(feed)
    for book in books:
        for retailer in book["retailers"]:
            entry = checker(book, retailer)
            entry["book_id"] = book["id"]
            entry["title"] = book["title"]
            entry["band"] = book["band"]
            entry["isbn"] = book["isbn"]
            key = (entry["book_id"], entry["dealer"], entry["url"])
            before = old.get(key)
            # A failed network check must not claim a delisting.
            if before and before.get("status") != entry["status"]:
                if before.get("status") == "gruen" and entry["status"] == "gelb":
                    kind = "prüfung_offen"
                elif entry["status"] == "gruen":
                    kind = "wieder_bestätigt"
                elif entry["status"] == "rot":
                    kind = "nicht_mehr_bestellbar"
                else:
                    kind = "statuswechsel"
                changes.append({"at": moment, "kind": kind, "book_id": book["id"],
                                "title": book["title"], "dealer": entry["dealer"],
                                "before": before["status"], "after": entry["status"], "url": entry["url"]})
            elif previous.get("generated_at") and not before:
                changes.append({"at": moment, "kind": "neu_im_monitor",
                                "book_id": book["id"], "title": book["title"], "dealer": entry["dealer"],
                                "before": None, "after": entry["status"], "url": entry["url"]})
            offers.append(entry)
    # If feed drops a retailer, flag as a data-source removal, not lost distribution.
    if previous.get("generated_at"):
        current_keys = {(v["book_id"], v["dealer"], v["url"]) for v in offers}
        for key, past in old.items():
            if key not in current_keys:
                changes.append({"at": moment, "kind": "aus_datenquelle_entfernt",
                                "book_id": past["book_id"], "title": past["title"], "dealer": past["dealer"],
                                "before": past["status"], "after": None, "url": past["url"]})
    history = (previous.get("history", []) + changes)[-250:]
    return {"version": 1, "generated_at": moment,
            "source_generated_at": feed.get("generated_at"),
            "source": SOURCE, "books": [{"id": b["id"], "isbn": b["isbn"], "band": b["band"],
                                        "title": b["title"], "authors": b["authors"]} for b in books],
            "offers": offers, "changes": changes, "history": history,
            "discovery": {shop: prefix for shop, prefix in SEARCH_SHOPS.items()},
            "notice": "Nur bekannte Produktlinks automatisiert geprüft. Händler-Suche ist kein Angebotsnachweis. Rot erfordert explizite Einzelbestätigung."}

def main():
    try:
        feed = json.loads(request_text(SOURCE, timeout=20)[3])
    except Exception as error:
        print("SOURCE_UNAVAILABLE: feed not updated:", type(error).__name__)
        return 1
    previous = {}
    if OUTPUT.exists():
        previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
    updated = build(previous, feed)
    OUTPUT.write_text(json.dumps(updated, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    total = len(updated["offers"])
    colors = {k: sum(o["status"] == k for o in updated["offers"]) for k in ("gruen", "gelb", "rot")}
    print("Checked", len(updated["books"]), "books,", total, "known retailer URLs:", colors,
          "| changes:", len(updated["changes"]))
    return 0

if __name__ == "__main__":
    sys.exit(main())
