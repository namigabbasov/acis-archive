// Renders a single archival item's metadata and SDR panel.
(function () {
  if (typeof ACIS_ITEMS === "undefined") return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  var item = id ? getItemById(id) : null;

  var content = document.getElementById("item-content");
  var notFound = document.getElementById("item-not-found");
  var pageTitleTag = document.getElementById("page-title");
  var breadcrumbCollection = document.getElementById("breadcrumb-collection");
  var breadcrumbCurrent = document.getElementById("breadcrumb-current");

  if (!item) {
    content.hidden = true;
    notFound.hidden = false;
    return;
  }

  pageTitleTag.textContent = item.title + " — ACIS Digital Archive";
  breadcrumbCollection.textContent = item.type;
  breadcrumbCollection.href = "browse.html?type=" + encodeURIComponent(item.collectionSlug);
  breadcrumbCurrent.textContent = item.title;

  content.innerHTML =
    '<p class="eyebrow">' + item.type + '</p>' +
    '<h2 style="font-size:clamp(1.6rem,3.2vw,2.1rem); max-width:34ch;">' + item.title + '</h2>' +

    '<div class="item-grid">' +
      '<div>' +
        '<table class="metadata-table">' +
          '<tr><th scope="row">Title</th><td>' + item.title + '</td></tr>' +
          '<tr><th scope="row">Date</th><td>' + item.date + '</td></tr>' +
          '<tr><th scope="row">Type</th><td>' + item.type + '</td></tr>' +
          '<tr><th scope="row">Collection</th><td><a href="browse.html?type=' + encodeURIComponent(item.collectionSlug) + '">' + item.type + '</a></td></tr>' +
          '<tr><th scope="row">Pages</th><td>' + item.pages + '</td></tr>' +
        '</table>' +

        '<div class="citation-block">' +
          '<p class="eyebrow">Recommended Citation</p>' +
          '<p class="citation-text">' + item.title + ', American Committee for Interoperable Systems Digital Archive.</p>' +
        '</div>' +
      '</div>' +

      '<div class="sdr-panel">' +
        '<p class="sdr-panel__label">Digital Object</p>' +
        '<p style="font-size:0.95rem; color:var(--color-charcoal); margin-bottom:0;">This item\'s digitized page images are hosted by the Stanford Digital Repository.</p>' +
        '<p class="sdr-panel__purl">' +
          '<strong style="display:block; font-size:0.75rem; letter-spacing:0.05em; text-transform:uppercase; color:var(--color-muted); margin-bottom:0.3em;">Permanent URL</strong>' +
          item.purl +
        '</p>' +
        '<a class="btn btn-primary" href="' + item.purl + '" target="_blank" rel="noopener noreferrer">View Document in Stanford Digital Repository →</a>' +
        '<p style="font-size:0.8rem; color:var(--color-muted); margin:0.9rem 0 0;">Opens the Stanford Digital Repository in a new tab. Placeholder link for this prototype.</p>' +
      '</div>' +
    '</div>';
})();
