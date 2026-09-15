(function () {
  "use strict";

  const GOOGLE_URL = "https://www.google.com/maps/search/?api=1&query=Zuhause%20am%20Bach%20Wachau%20Aggsbach%20Markt%2082%2C%203641%20Aggsbach%20Markt";
  const HOLIDAYCHECK_URL = "https://www.holidaycheck.at/wcf/hotelreview/contribution/d66cc36b-7f57-4db0-8211-e5f75fcc669a";
  const PIRATENSENDER_URL = "https://spotify.link/JqfpxX3Wq6b";

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
    addPiratensender();
    addReviewFunnel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExtras);
  } else {
    initializeExtras();
  }
})();
