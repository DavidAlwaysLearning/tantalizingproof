/* Site menu. Add a destination by appending one entry.
   The open menu lists every other destination.
   Subscribe confirmation and thank-you pages are not destinations.
   Scores is the shared library on Lackadaisical Perfection. */
(function () {
  var pages = [
    { href: "/", label: "Album" },
    { href: "https://lackadaisicalperfection.com/scores/", label: "Scores", blank: true }
  ];

  function siteBase() {
    if (location.origin && location.origin !== "null") return location.origin;
    return "https://tantalizingproof.com";
  }

  function normalize(path) {
    var p = path || "/";
    try {
      p = new URL(p, siteBase()).pathname;
    } catch (err) {
      p = "/";
    }
    if (p === "/index.html" || p.slice(-11) === "/index.html") {
      p = p.slice(0, -10);
    }
    if (p.charAt(p.length - 1) !== "/") p += "/";
    return p;
  }

  function isExcluded(href) {
    var path = normalize(href);
    return /\/(confirmed|confirmation|thank-you|thanks)\//.test(path);
  }

  function samePage(href) {
    var url;
    try {
      url = new URL(href, siteBase());
    } catch (err) {
      return false;
    }
    var hereOrigin = location.origin && location.origin !== "null" ? location.origin : "";
    if (hereOrigin && url.origin !== hereOrigin) return false;
    return normalize(url.pathname) === normalize(location.pathname);
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Newest first. Titles, years, and domains come from each album repo. */
  var albums = [
    { href: "https://lackadaisicalperfection.com/", title: "Lackadaisical Perfection", file: "lackadaisical-perfection" },
    { href: "https://pianoreveries.com/", title: "Piano Reveries and Phantasies", file: "piano-reveries" },
    { href: "https://smittenwiththemuses.com/", title: "Smitten with the Muses", file: "smitten-with-the-muses" },
    { href: "https://whereintheworldisdiane.com/", title: "Where In The World Is Diane", file: "where-in-the-world-is-diane" },
    { href: "https://cleancalmpiano.com/", title: "Clean Calm Piano", file: "clean-calm-piano" },
    { href: "https://tantalizingproof.com/", title: "Tantalizing Proof", file: "tantalizing-proof" },
    { href: "https://pianoincolors.com/", title: "Piano In Colors", file: "piano-in-colors" },
    { href: "https://melodicsubtlety.com/", title: "Melodic Subtlety \u2013 Solo Piano", file: "melodic-subtlety" }
  ];

  function currentHost() {
    var host = (location.hostname || "").replace(/^www\./, "").toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return "tantalizingproof.com";
    }
    return host;
  }

  function albumHost(href) {
    try {
      return new URL(href).hostname.replace(/^www\./, "").toLowerCase();
    } catch (err) {
      return "";
    }
  }

  function coverImg(file) {
    var cover = document.createElement("img");
    cover.src = "/assets/albums/" + file + ".jpg";
    cover.srcset = "/assets/albums/" + file + ".jpg 1x, /assets/albums/" + file + "@2x.jpg 2x";
    cover.width = 48;
    cover.height = 48;
    cover.alt = "";
    cover.decoding = "async";
    return cover;
  }

  function albumsSection() {
    var here = currentHost();
    var albumList = document.createElement("ul");
    albumList.className = "album-list";
    albumList.setAttribute("role", "list");

    albums.forEach(function (album) {
      var item = document.createElement("li");
      var title = document.createElement("span");
      title.className = "album-title";
      title.textContent = album.title;

      if (albumHost(album.href) === here) {
        item.setAttribute("aria-current", "page");
        var row = document.createElement("div");
        row.className = "album-current";
        var copy = document.createElement("span");
        copy.className = "album-copy";
        var note = document.createElement("span");
        note.className = "album-here";
        note.textContent = "You\u2019re here";
        copy.appendChild(title);
        copy.appendChild(note);
        row.appendChild(coverImg(album.file));
        row.appendChild(copy);
        item.appendChild(row);
      } else {
        var link = document.createElement("a");
        link.href = album.href;
        link.target = "_blank";
        link.rel = "noopener";
        link.appendChild(coverImg(album.file));
        link.appendChild(title);
        item.appendChild(link);
      }
      albumList.appendChild(item);
    });

    var label = document.createElement("p");
    label.id = "menu-albums-label";
    label.className = "menu-albums-label";
    label.textContent = "Albums";

    var section = document.createElement("section");
    section.className = "menu-albums";
    section.setAttribute("aria-labelledby", "menu-albums-label");
    section.appendChild(label);
    section.appendChild(albumList);
    return section;
  }

  var links = pages.filter(function (page) {
    if (isExcluded(page.href)) return false;
    return !samePage(page.href);
  });

  var button = document.createElement("button");
  button.type = "button";
  button.className = "nav-toggle";
  button.setAttribute("aria-label", "Open menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "site-menu");

  var img = document.createElement("img");
  img.src = "/assets/david-with-lp.jpg";
  img.srcset = "/assets/david-with-lp.jpg 1x, /assets/david-with-lp@2x.jpg 2x";
  img.width = 160;
  img.height = 160;
  img.alt = "";
  img.decoding = "async";
  button.appendChild(img);

  var list = document.createElement("ul");
  list.setAttribute("role", "list");
  links.forEach(function (page) {
    var item = document.createElement("li");
    var link = document.createElement("a");
    link.href = page.href;
    link.textContent = page.label;
    if (page.blank) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    item.appendChild(link);
    list.appendChild(item);
  });

  var menu = document.createElement("nav");
  menu.id = "site-menu";
  menu.className = "site-menu";
  menu.setAttribute("aria-label", "Pages");
  menu.hidden = true;
  menu.appendChild(list);
  menu.appendChild(albumsSection());

  document.body.appendChild(button);
  document.body.appendChild(menu);

  var generation = 0;
  var open = false;

  function setOpenState(next) {
    open = next;
    button.setAttribute("aria-expanded", next ? "true" : "false");
    button.setAttribute("aria-label", next ? "Close menu" : "Open menu");
  }

  function finishClose(gen) {
    if (gen !== generation || open) return;
    menu.hidden = true;
    if ("inert" in menu) menu.inert = true;
  }

  function openMenu() {
    generation += 1;
    menu.hidden = false;
    if ("inert" in menu) menu.inert = false;
    if (reducedMotion()) {
      menu.classList.add("is-open");
    } else {
      menu.classList.remove("is-open");
      void menu.offsetWidth;
      menu.classList.add("is-open");
    }
    setOpenState(true);
  }

  function closeMenu(restoreFocus) {
    var gen = generation += 1;
    setOpenState(false);
    menu.classList.remove("is-open");
    if ("inert" in menu) menu.inert = true;
    if (reducedMotion()) {
      finishClose(gen);
    } else {
      var timer = setTimeout(function () { finishClose(gen); }, 400);
      menu.addEventListener("transitionend", function onEnd(event) {
        if (event.target !== menu || event.propertyName !== "opacity") return;
        menu.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        finishClose(gen);
      });
    }
    if (restoreFocus) button.focus();
  }

  button.addEventListener("click", function (event) {
    event.stopPropagation();
    if (open) closeMenu(false);
    else openMenu();
  });

  document.addEventListener("click", function (event) {
    if (!open) return;
    if (menu.contains(event.target)) return;
    closeMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    closeMenu(true);
  });
})();
