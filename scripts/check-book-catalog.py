#!/usr/bin/env python3
"""Check catalog content and real HTML links, locally or in downloaded Pages HTML."""

import argparse
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import urljoin, urlsplit, urlunsplit

BASE = "https://topdiveair-sketch.github.io/Gaeste/"
PAGES = ("index.html", "buecher-johann-prem.html", "buecher.html", "books.html")
VOID = set("area base br col embed hr img input link meta param source track wbr".split())


def destination(page, href):
    url = urlsplit(urljoin(urljoin(BASE, page), href))
    path = url.path.removesuffix("index.html")
    return urlunsplit((url.scheme, url.netloc, path, "", ""))


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.anchors = []
        self.metadata = []
        self.text = []
        self.language = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        style = re.sub(r"\s+", "", attrs.get("style", "").lower())
        blocked = (any(frame[1] for frame in self.stack)
                   or tag in {"script", "style", "template"}
                   or "hidden" in attrs or "inert" in attrs
                   or attrs.get("aria-hidden") == "true"
                   or "display:none" in style or "visibility:hidden" in style)
        anchor = None
        if tag == "html":
            self.language = attrs.get("lang")
        if tag == "link":
            self.metadata.append(attrs)
        if tag == "a" and attrs.get("href") and not blocked:
            anchor = {**attrs, "text": []}
            self.anchors.append(anchor)
        if tag not in VOID:
            self.stack.append((tag, blocked, anchor))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        if any(frame[1] for frame in self.stack):
            return
        self.text.append(data)
        for _, _, anchor in self.stack:
            if anchor is not None:
                anchor["text"].append(data)

    def links(self):
        # Comments, script strings and metadata are not clickable navigation.
        return [a for a in self.anchors
                if "".join(a["text"]).strip() or a.get("aria-label", "").strip()]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def check(root):
    pages = {name: Page((root / name).read_text(encoding="utf-8")) for name in PAGES}
    names = {destination(name, ""): name for name in PAGES}
    graph = {name: {names[url] for a in page.links()
                    if (url := destination(name, a["href"])) in names}
             for name, page in pages.items()}

    routes = {"index.html": ["index.html"]}
    pending = deque(routes)
    while pending:
        name = pending.popleft()
        for target in sorted(graph[name]):
            if target not in routes:
                routes[target] = routes[name] + [target]
                pending.append(target)

    for name, language, marker in (
        ("buecher.html", "de", "Die Bücherwelten aus der Wachau"),
        ("books.html", "en", "English-language paperback"),
    ):
        page = pages[name]
        require(marker in " ".join(page.text), f"{name}: expected catalog content missing")
        require(page.language == language, f"{name}: wrong HTML language")
        require(name in routes, f"index.html: no clickable route to {name}")
        print("Navigation: " + " -> ".join(routes[name]))
        require("buecher-johann-prem.html" in graph[name], f"{name}: book selection return link missing")
        for lang, target in (("de", "buecher.html"), ("en", "books.html")):
            require(any("alternate" in link.get("rel", "").split()
                        and link.get("hreflang") == lang
                        and link.get("href")
                        and destination(name, link.get("href", "")) == destination(target, "")
                        for link in page.metadata), f"{name}: hreflang {lang} points to wrong/missing page")
        require(any("canonical" in link.get("rel", "").split()
                    and link.get("href")
                    and destination(name, link.get("href", "")) == destination(name, "")
                    for link in page.metadata), f"{name}: wrong/missing canonical URL")
        other = "books.html" if language == "de" else "buecher.html"
        require(other in graph[name], f"{name}: clickable language switch to {other} missing")
        amazon = {a["href"] for a in page.links()
                  if urlsplit(a["href"]).hostname == "www.amazon.de"}
        require(amazon, f"{name}: no Amazon book links")
        require(all(re.fullmatch(r"https://www\.amazon\.de/dp/[A-Z0-9]{10}(?:[/?#].*)?", url)
                    for url in amazon), f"{name}: malformed Amazon product link")
        print(f"{name}: content, language links, canonical and {len(amazon)} Amazon URL formats verified")
    print("Catalog checks passed (Amazon stock, prices and product contents are not checked).")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent.parent)
    args = parser.parse_args()
    try:
        check(args.root)
    except (OSError, ValueError) as error:
        print(f"Catalog check failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
