(function () {
  "use strict";

  const GOOGLE_URL = "https://www.google.com/maps/search/?api=1&query=Zuhause%20am%20Bach%20Wachau%20Aggsbach%20Markt%2082%2C%203641%20Aggsbach%20Markt";
  const HOLIDAYCHECK_URL = "https://www.holidaycheck.at/wcf/hotelreview/contribution/d66cc36b-7f57-4db0-8211-e5f75fcc669a";
  const PIRATENSENDER_URL = "https://spotify.link/JqfpxX3Wq6b";
  const GEMEINDE_URL = "https://www.aggsbach.gv.at/";

  function addAggsbachHeute() {
    if (document.getElementById("aggsbach-heute")) return;

    const main = document.querySelector("main");
    const welcome = document.querySelector(".welcome");
    if (!main) return;

    const section = document.createElement("section");
    section.id = "aggsbach-heute";
    section.className = "card local-hub-card";
    section.innerHTML = `
      <div class="kicker">📍 Service von Zuhause am Bach</div>
      <h2>Aggsbach aktuell</h2>
      <p class="local-hub-lead">Aktuelle Informationen aus Aggsbach Markt für unsere Gäste – und für alle, die wissen möchten, was heute los ist.</p>
      <div class="local-hub-grid">
        <a href="#tratsch-glatsch"><strong>🗞️ Tagesgeschehen</strong><span>Lokale Neuigkeiten, Veranstaltungen und Tipps des Tages.</span></a>
        <a href="${GEMEINDE_URL}" target="_blank" rel="noopener noreferrer"><strong>🏛️ Gemeinde aktuell</strong><span>Offizielle Mitteilungen und Bürgerservice von Aggsbach Markt.</span></a>
        <a href="#wetter"><strong>🌦️ Wetter & Warnungen</strong><span>Wetterlage und Hinweise für den heutigen Tag.</span></a>
        <a href="#heurigen"><strong>🍷 Heute geöffnet?</strong><span>Heurige, Gastronomie und regionale Genussmöglichkeiten.</span></a>
        <a href="#service"><strong>🚂 Mobilität & Service</strong><span>Fähren, Wachaubahn, Gepäcktransport und weitere Hilfe.</span></a>
        <a href="#notfall"><strong>🆘 Wichtig & Notfall</strong><span>Gastgeber, Rettung, Polizei, Feuerwehr und Bergrettung.</span></a>
      </div>
      <p class="small local-hub-note"><strong>Zuhause am Bach – Wachau</strong> bündelt hier hilfreiche Ortsinformationen als zusätzlichen Service zur Gäste-App. Bei kurzfristigen Änderungen gilt immer die verlinkte Originalquelle.</p>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .local-hub-card{background:linear-gradient(160deg,#fffdf8,#f8f2e7);border:1px solid #d9c8af;box-shadow:0 10px 26px rgba(65,45,28,.08)}
      .local-hub-card h2{color:#4a2a14}
      .local-hub-lead{font-size:1.08rem;max-width:900px}
      .local-hub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}
      .local-hub-grid a{display:flex;flex-direction:column;gap:7px;min-height:116px;padding:16px;border-radius:16px;background:#fff;border:1px solid #eadcc8;text-decoration:none;box-shadow:0 5px 14px rgba(40,30,20,.05)}
      .local-hub-grid a:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(40,30,20,.09)}
      .local-hub-grid strong{font-size:1.05rem;color:#5b371c}
      .local-hub-grid span{color:#655647;line-height:1.45}
      .local-hub-note{margin-bottom:0}
      .local-nav{background:#6a3f1e!important;color:#fff!important;font-weight:900!important}
      @media(max-width:800px){.local-hub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:560px){.local-hub-grid{grid-template-columns:1fr}.local-hub-grid a{min-height:0}}
    `;
    document.head.appendChild(style);

    if (welcome && welcome.parentNode === main) {
      welcome.insertAdjacentElement("afterend", section);
    } else {
      main.insertBefore(section, main.firstChild);
    }

    const nav = document.querySelector(".quick-nav");
    if (nav && !nav.querySelector(".local-nav")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "local-nav";
      button.textContent = "📍 Aggsbach aktuell";
      button.addEventListener("click", () => section.scrollIntoView({behavior:"smooth", block:"start"}));
      const bookingButton = nav.querySelector(".important-nav");
      if (bookingButton && bookingButton.nextSibling) {
        nav.insertBefore(button, bookingButton.nextSibling);
      } else {
        nav.appendChild(button);
      }
    }
  }

  function addPiratensender() {
    if (document.getElementById("piratensender")) return;

    const main = document.querySelector("main");
    const books = document.getElementById("buecherwelt");
    if (!main) return;

    const section = document.createElement("section");
    section.id = "piratensender";
    section.className = "card pirate-radio-card";

    const kicker = document.createElement("div");
    kicker.className = "kicker";
    kicker.textContent = "🏴‍☠️ Die Wilden Wachauer Windis";

    const title = document.createElement("h2");
    title.textContent = "Wachauer Piratensender";

    const text = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Der Soundtrack für deinen Wachau-Urlaub. ";
    text.appendChild(strong);
    text.appendChild(document.createTextNode("Musik, Natur, Freunde und Freiheit."));

    const actions = document.createElement("div");
    actions.className = "button-row";

    const link = document.createElement("a");
    link.className = "btn-link pirate-radio-button";
    link.href = PIRATENSENDER_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "🎧 Jetzt auf Spotify anhören";

    actions.appendChild(link);
    section.append(kicker, title, text, actions);

    const style = document.createElement("style");
    style.textContent = ".pirate-radio-card{border:1px solid rgba(49,91,69,.16);background:linear-gradient(135deg,#fffaf0,#f7f4e8)}.pirate-radio-card h2{margin-bottom:8px}.pirate-radio-card p{margin-bottom:14px}.pirate-radio-button{background:#1db954!important;color:#fff!important;border-radius:999px!important;font-weight:900!important}@media(max-width:640px){.pirate-radio-button{width:100%;box-sizing:border-box}}";
    document.head.appendChild(style);

    if (books && books.parentNode === main) {
      main.insertBefore(section, books);
    } else {
      main.appendChild(section);
    }
  }

  function addReviewFunnel() {
    if (document.getElementById("gast-bewertung")) return;

    const main = document.querySelector("main");
    if (!main) return;

    const section = document.createElement("section");
    section.id = "gast-bewertung";
    section.className = "card review-card";
    section.innerHTML = `
      <div class="kicker">⭐ Nach dem Aufenthalt</div>
      <h2>Hat Ihnen der Aufenthalt gefallen?</h2>
      <p>Eine ehrliche Bewertung hilft anderen Gästen, Zuhause am Bach – Wachau zu finden. Bitte bewerten Sie uns nur, wenn Sie tatsächlich bei uns zu Gast waren.</p>
      <div class="review-actions">
        <a class="review-google" href="${GOOGLE_URL}" target="_blank" rel="noopener">⭐ Bei Google bewerten</a>
        <a class="review-holidaycheck" href="${HOLIDAYCHECK_URL}" target="_blank" rel="noopener">🏨 Bei HolidayCheck bewerten</a>
      </div>
      <p class="small">Vielen Dank. Es gibt keine Gegenleistung oder Belohnung für Bewertungen.</p>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .review-card{border:2px solid rgba(49,91,69,.18);background:linear-gradient(180deg,#fffef9,#f5f9f5)}
      .review-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
      .review-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:900}
      .review-google{background:#1f6b4d;color:#fff}
      .review-holidaycheck{background:#fff3cc;color:#5e4710;border:1px solid #e1c45e}
      .review-nav{font-weight:900}
      @media(max-width:640px){.review-actions a{width:100%}}
    `;
    document.head.appendChild(style);

    main.appendChild(section);

    const nav = document.querySelector(".quick-nav");
    if (nav && !nav.querySelector(".review-nav")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "review-nav";
      button.textContent = "⭐ Bewerten";
      button.addEventListener("click", () => section.scrollIntoView({behavior:"smooth", block:"start"}));
      nav.appendChild(button);
    }
  }

  function initializeExtras() {
    addAggsbachHeute();
    addPiratensender();
    addReviewFunnel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExtras);
  } else {
    initializeExtras();
  }
})();
