(function () {
  "use strict";

  function addPiratensender() {
    if (document.getElementById("piratensender")) return;

    const main = document.querySelector("main");
    const books = document.getElementById("buecherwelt");
    if (!main) return;

    const section = document.createElement("section");
    section.id = "piratensender";
    section.className = "card";

    const kicker = document.createElement("div");
    kicker.className = "kicker";
    kicker.textContent = "🏴‍☠️ Die Wilden Wachauer Windis";

    const heading = document.createElement("h2");
    heading.textContent = "Wachauer Piratensender";

    const text = document.createElement("p");
    text.innerHTML = "<strong>Der Soundtrack für deinen Wachau-Urlaub.</strong> Musik, Natur, Freunde und Freiheit.";

    const actions = document.createElement("div");
    actions.className = "button-row";

    const link = document.createElement("a");
    link.className = "btn-link";
    link.href = "https://spotify.link/JqfpxX3Wq6b";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "🎧 Jetzt auf Spotify anhören";

    actions.appendChild(link);
    section.append(kicker, heading, text, actions);

    if (books && books.parentNode === main) {
      main.insertBefore(section, books);
    } else {
      main.appendChild(section);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addPiratensender);
  } else {
    addPiratensender();
  }
})();
