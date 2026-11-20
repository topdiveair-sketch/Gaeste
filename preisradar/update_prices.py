#!/usr/bin/env python3
"""Read public Heisse Preise dataset and publish compact, explicitly qualified online prices."""
import datetime as dt
import json
import pathlib
import re
import urllib.request

ROOT=pathlib.Path(__file__).resolve().parent
CATALOG=json.loads((ROOT/"produkte.json").read_text(encoding="utf-8"))
OUTPUT=ROOT/"online-preise.json"
URL="https://heisse-preise.io/data/latest-canonical.json"
now=dt.datetime.now(dt.timezone.utc)
result={"updated_at":now.isoformat(timespec="seconds"),"source":URL,"scope":"Austria chain online prices; no branch or stock verification","items":[],"status":"unavailable"}
try:
    req=urllib.request.Request(URL,headers={"User-Agent":"MelkPreisradar/1.0","Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=90) as response:
        if response.status!=200: raise ValueError("HTTP "+str(response.status))
        data=json.load(response)
    if not isinstance(data,list): raise ValueError("Unexpected source data")
    for product in CATALOG["products"]:
        needle=product["query"].casefold()
        for item in data:
            if not isinstance(item,dict):continue
            name=str(item.get("name",""))
            if needle not in name.casefold():continue
            # Require pack size for a meaningful, like-for-like comparison.
            unit=str(item.get("unit",""))
            quantity=str(item.get("quantity",""))
            compare=(name+" "+unit+" "+quantity).lower()
            if product.get("pack_regex") and not re.search(product["pack_regex"],compare,re.I):continue
            price=item.get("price")
            try:price=float(price)
            except (TypeError,ValueError):continue
            if not 0<price<1000:continue
            store=str(item.get("store","")).upper()
            if store not in ("SPAR","BILLA","HOFER","PENNY","LIDL","MPREIS","DM"):continue
            history=item.get("priceHistory",[])
            latest=history[0].get("date") if isinstance(history,list) and history and isinstance(history[0],dict) else None
            if not latest:continue
            try:age=(now.date()-dt.date.fromisoformat(str(latest)[:10])).days
            except ValueError:continue
            if not 0<=age<=2:continue
            result["items"].append({"product_id":product["id"],"shop":store,"name":name,"price":price,"unit":unit,"quantity":quantity,"checked_at":now.isoformat(timespec="seconds"),"source_date":latest,"status":"online_price","source_url":URL})
    result["items"].sort(key=lambda x:(x["product_id"],x["price"]))
    result["status"]="ok"
except Exception as e:
    result["error"]=str(e)[:180]
OUTPUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("status:",result["status"],"matches:",len(result["items"]))
