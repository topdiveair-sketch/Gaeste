#!/usr/bin/env python3
"""Update online reference prices; never infer branch-specific availability."""
import datetime as dt
import html
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
CONFIG = ROOT / "produkte.json"
OUTPUT = ROOT / "online-preise.json"
TODAY = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; MelkPreisradar/1.0; price-check)", "Accept-Language": "de-AT,de;q=0.9"}
def price_from_text(s):
    s = re.sub(r"<script[^>]*>.*?</script>", " ", s, flags=re.I|re.S)
    s = re.sub(r"<style[^>]*>.*?</style>", " ", s, flags=re.I|re.S)
    return html.unescape(re.sub(r"<[^>]+>", " ", s))
def extract(text, shop, marker):
    pos = text.lower().find(marker.lower())
    if pos < 0: raise ValueError("product marker missing")
    # Search price directly after the product title, before ingredients or related products.
    area=text[pos:pos+1400]
    if shop == "BILLA":
        match = re.search(r"(\d{1,3}[,.]\d{2})\s*€", area)
        if not match: raise ValueError("BILLA price not recognized")
    elif shop == "SPAR":
        # SPAR displays either "statt 8,70 5,94" or "8,70 Per 500 ml 1,45"
        match=re.search(r"(?:statt\s+\d{1,3}[,.]\d{2}\s+)?(\d{1,3}[,.]\d{2})\s*(?:Per\s+500|Niedrigster|Aktion|Artikelnummer)", area, re.I)
        if not match:
            match=re.search(r"(?:statt\s+\d{1,3}[,.]\d{2}\s+)?(\d{1,3}[,.]\d{2})\s+Per\s+500",area,re.I)
        if not match: raise ValueError("SPAR price not recognized")
    else: raise ValueError("unsupported shop")
    value=float(match.group(1).replace(",","."))
    if value <= 0 or value > 100: raise ValueError("implausible price")
    return value
def main():
    catalog=json.loads(CONFIG.read_text(encoding="utf-8"))
    results={"updated_at":TODAY, "scope":"chain_online_prices_not_branch_inventory", "items":[]}
    for p in catalog["products"]:
        for source in p.get("sources",[]):
            item={"product_id":p["id"],"shop":source["shop"],"url":source["url"],"checked_at":TODAY,"status":"unavailable","price":None,"unit":p["unit"],"note":"Kein Filialpreis oder Lagerbestand bestätigt"}
            try:
                req=urllib.request.Request(source["url"],headers=HEADERS)
                with urllib.request.urlopen(req,timeout=18) as r:
                    if r.status!=200: raise ValueError("HTTP "+str(r.status))
                    data=r.read(3_000_000).decode("utf-8","replace")
                text=price_from_text(data)
                # Require product name close to the listing, not just a suggested product.
                item["price"]=extract(text,source["shop"],source["marker"])
                item["status"]="online_price"
            except Exception as e:
                item["error"]=str(e)[:180]
            results["items"].append(item)
    OUTPUT.write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps([{"product":i["product_id"],"shop":i["shop"],"status":i["status"],"price":i["price"]} for i in results["items"]],ensure_ascii=False))
if __name__=="__main__": main()
