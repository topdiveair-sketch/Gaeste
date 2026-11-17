#!/usr/bin/env python3
"""Offline regression tests: no retailer network calls."""
import importlib.util
import pathlib
import tempfile
import unittest

PATH = pathlib.Path(__file__).with_name("windis-retailer-radar.py")
spec = importlib.util.spec_from_file_location("radar", PATH)
radar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(radar)

FEED = {"generated_at": "2026-09-17T07:53:54", "books": [
    {"isbn": "9783565232116", "title": "Das Geheimnis am Bach", "band": 2,
     "retailers": [{"dealer": "epubli", "url": "https://www.epubli.com/shop/test"}]}
]}

def checker(status):
    def check(book, retailer):
        return {"checked_at": "2026-11-17T10:00:00Z", "dealer": retailer["dealer"],
                "url": retailer["url"], "status": status, "reason": "mock"}
    return check

class RadarTests(unittest.TestCase):
    def test_first_run_does_not_invent_new_retailers(self):
        r = radar.build({}, FEED, checker("gelb"), now="2026-11-17T10:00:00Z")
        self.assertFalse(r["changes"])
        self.assertEqual(len(r["offers"]), 2)  # book from feed + holiday edition

    def test_blocked_shop_not_counted_as_removed(self):
        a = radar.build({}, FEED, checker("gruen"), now="2026-11-17T10:00:00Z")
        b = radar.build(a, FEED, checker("gelb"), now="2026-11-18T10:00:00Z")
        self.assertTrue(all(x["kind"] == "prüfung_offen" for x in b["changes"]))
        self.assertNotIn("nicht_mehr_bestellbar", [x["kind"] for x in b["changes"]])

    def test_new_retailer_is_changed(self):
        a = radar.build({}, FEED, checker("gelb"))
        expanded = {"generated_at": FEED["generated_at"], "books": [dict(FEED["books"][0])]}
        expanded["books"][0]["retailers"] = FEED["books"][0]["retailers"] + [
            {"dealer": "Thalia.de", "url": "https://www.thalia.de/shop/test"}]
        b = radar.build(a, expanded, checker("gelb"))
        self.assertEqual([x["kind"] for x in b["changes"]], ["neu_im_monitor"])

    def test_retired_feed_entry_is_not_delisting(self):
        a = radar.build({}, FEED, checker("gruen"))
        reduced = {"books": [], "generated_at": FEED["generated_at"]}
        b = radar.build(a, reduced, checker("gelb"))
        self.assertIn("aus_datenquelle_entfernt", [x["kind"] for x in b["changes"]])

    def test_structured_red_only_for_matching_book(self):
        product = '<script type="application/ld+json">' + (
            '{"@type":"Product","name":"Das Geheimnis am Bach",'
            '"offers":{"availability":"https://schema.org/OutOfStock"}}'
        ) + '</script>'
        status, _ = radar.product_structured_status(FEED["books"][0], product)
        self.assertEqual(status, "rot")
        other = product.replace("Das Geheimnis am Bach", "Unbekanntes Buch")
        status, _ = radar.product_structured_status(FEED["books"][0], other)
        self.assertIsNone(status)

    def test_no_false_price_claims(self):
        r = radar.build({}, FEED, checker("gelb"))
        self.assertNotIn("price", r["offers"][0])

    def test_detection_requires_book_match(self):
        book = FEED["books"][0]
        retailer = book["retailers"][0]
        old = radar.request_text
        radar.request_text = lambda *_args, **_kw: ("https://www.epubli.com/shop/test", 200, "text/html",
                                                     "<html><h1>Fremdes Produkt</h1><button>Jetzt kaufen</button></html>")
        try:
            r = radar.inspect(book, retailer)
            self.assertEqual(r["status"], "gelb")
        finally:
            radar.request_text = old

if __name__ == "__main__":
    unittest.main()
