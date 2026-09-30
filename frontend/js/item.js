// Item page: viewer, descriptive metadata, citation, and related items.
(function () {
  if (typeof ACIS_ITEMS === "undefined") return;

  var id = new URLSearchParams(window.location.search).get("id");
  var item = id ? getItemById(id) : null;
  var content = document.getElementById("item-content");

  if (!item) {
    content.hidden = true;
    document.getElementById("item-not-found").hidden = false;
    document.getElementById("breadcrumb-collection").parentNode.hidden = true;
    return;
  }

  var collection = getCollectionBySlug(item.collectionSlug);
  var seriesItems = getItemsByCollectionSlug(item.collectionSlug)
    .slice()
    .sort(function (a, b) { return a.dateSort.localeCompare(b.dateSort); });
  var pos = seriesItems.indexOf(item);
  var prev = seriesItems[pos - 1];
  var next = seriesItems[pos + 1];
  var cite = citations(item);

  document.title = item.title + " | ACIS Digital Archive";
  var crumb = document.getElementById("breadcrumb-collection");
  crumb.textContent = item.type;
  crumb.href = seriesUrl(item.collectionSlug);
  document.getElementById("breadcrumb-current").textContent = item.title;

  var icon = function (path) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + path + "</svg>";
  };

  var subjects = (item.keywords || [])
    .map(function (k) {
      return '<li><a href="browse.html?q=' + encodeURIComponent(k) + '">' + esc(k.charAt(0).toUpperCase() + k.slice(1)) + "</a></li>";
    })
    .join("");

  var strip = "";
  for (var i = 0; i < Math.min(item.pages, 6); i++) strip += thumbMarkup(item, "xs");

  var row = function (label, value) {
    return '<tr><th scope="row">' + label + "</th><td>" + value + "</td></tr>";
  };

  content.innerHTML =
    '<div class="item-head" style="padding-top:0">' +
      '<p class="item-head__series"><a href="' + seriesUrl(item.collectionSlug) + '">' + esc(collection.series) + " · " + esc(item.type) + "</a></p>" +
      "<h1>" + esc(item.title) + "</h1>" +
      '<p class="item-head__sub">' + esc(item.date) + " · " + item.pages + " pages · " + esc(item.identifier) + "</p>" +
    "</div>" +

    '<div class="item-layout">' +
      "<div>" +
        '<div class="viewer">' +
          '<div class="viewer__bar"><span>Page 1 of ' + item.pages + "</span>" +
            '<span class="viewer__tools">' +
              '<button type="button" data-zoom="1" title="Zoom in" aria-label="Zoom in">' + icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>') + "</button>" +
              '<button type="button" data-zoom="-1" title="Zoom out" aria-label="Zoom out">' + icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>') + "</button>" +
              '<button type="button" data-fullscreen title="Full screen" aria-label="Full screen">' + icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>') + "</button>" +
            "</span>" +
          "</div>" +
          '<div class="viewer__stage">' + thumbMarkup(item, "lg") + "</div>" +
          '<div class="viewer__strip" aria-hidden="true">' + strip +
            (item.pages > 6 ? '<span class="viewer__more">+' + (item.pages - 6) + " more</span>" : "") +
          "</div>" +
        "</div>" +
        '<p class="viewer__caption">Page images are served from the Stanford Digital Repository.</p>' +
      "</div>" +

      "<div>" +
        '<div class="item-actions">' +
          '<a class="btn btn-primary" href="' + esc(item.purl) + '" target="_blank" rel="noopener noreferrer">View in Stanford Digital Repository' +
            '<span class="visually-hidden"> (opens in a new tab)</span></a>' +
        "</div>" +

        '<p class="item-abstract">' + esc(item.description) + "</p>" +

        '<table class="meta-table">' +
          "<caption>Description</caption>" +
          row("Title", esc(item.title)) +
          row("Creator", esc(ACIS_CREATOR)) +
          row("Date", esc(item.date)) +
          row("Series", '<a href="' + seriesUrl(item.collectionSlug) + '">' + esc(collection.series) + ": " + esc(item.type) + "</a>") +
          row("Type", "Text") +
          row("Extent", item.pages + " pages") +
          row("Language", "English") +
          (subjects ? row("Subjects", '<ul class="subject-links">' + subjects + "</ul>") : "") +
          row("Identifier", '<span class="mono">' + esc(item.identifier) + "</span>") +
          row("Repository", esc(ACIS_REPOSITORY)) +
          row("Permanent URL", '<a class="mono" href="' + esc(item.purl) + '">' + esc(item.purl) + "</a>") +
        "</table>" +

        '<div class="cite">' +
          "<h2>Cite this item</h2>" +
          '<div class="cite__tabs" role="tablist">' +
            '<button type="button" role="tab" aria-selected="true" data-format="chicago">Chicago</button>' +
            '<button type="button" role="tab" aria-selected="false" data-format="bluebook">Bluebook</button>' +
          "</div>" +
          '<p class="cite__text" id="cite-text" role="tabpanel">' + cite.chicago + "</p>" +
          '<button type="button" class="btn btn-quiet cite__copy" id="cite-copy">Copy citation</button>' +
        "</div>" +

        '<p class="rights"><strong>Rights:</strong> Made available for research and educational use. See <a href="about.html#access">Access &amp; Use</a> for permissions.</p>' +
      "</div>" +
    "</div>" +

    '<nav class="pager" aria-label="Items in this series">' +
      (prev ? '<a href="' + itemUrl(prev) + '"><small>‹ Previous in series</small>' + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a href="' + itemUrl(next) + '"><small>Next in series ›</small>' + esc(next.title) + "</a>" : "") +
    "</nav>";

  // Viewer controls
  var viewer = content.querySelector(".viewer");
  var page = viewer.querySelector(".viewer__stage .thumb");
  var zoom = 1;
  viewer.querySelectorAll("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function () {
      zoom = Math.min(1.6, Math.max(0.6, zoom + 0.2 * Number(b.getAttribute("data-zoom"))));
      page.style.width = "min(100%, " + Math.round(420 * zoom) + "px)";
    });
  });
  viewer.querySelector("[data-fullscreen]").addEventListener("click", function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (viewer.requestFullscreen) viewer.requestFullscreen();
  });

  // Citation format tabs + copy
  var citeText = document.getElementById("cite-text");
  var tabs = content.querySelectorAll(".cite__tabs button");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
      citeText.innerHTML = cite[tab.getAttribute("data-format")];
    });
  });
  var copyBtn = document.getElementById("cite-copy");
  copyBtn.addEventListener("click", function () {
    var done = function () {
      copyBtn.textContent = "Copied";
      setTimeout(function () { copyBtn.textContent = "Copy citation"; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(citeText.textContent).then(done, function () {});
  });

  // Related items
  var related = seriesItems.filter(function (i) { return i !== item; }).slice(0, 4);
  if (related.length) {
    document.getElementById("related-section").hidden = false;
    document.getElementById("related").innerHTML = related.map(recordCardMarkup).join("");
    document.getElementById("related-all").href = seriesUrl(item.collectionSlug);
    document.getElementById("related-heading").textContent = "More from " + item.type;
  }
})();
