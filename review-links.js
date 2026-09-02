(function () {
  "use strict";

  const GOOGLE_URL = "https://www.google.com/maps/search/?api=1&query=Zuhause%20am%20Bach%20Wachau%20Aggsbach%20Markt%2082%2C%203641%20Aggsbach%20Markt";
  const HOLIDAYCHECK_URL = "https://www.holidaycheck.at/wcf/hotelreview/contribution/d66cc36b-7f57-4db0-8211-e5f75fcc669a";

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addReviewFunnel);
  } else {
    addReviewFunnel();
  }
})();
