// Renders the "Explore the Archive" category grid on the homepage.
(function () {
  var grid = document.getElementById("category-grid");
  if (!grid || typeof ACIS_COLLECTIONS === "undefined") return;

  grid.innerHTML = ACIS_COLLECTIONS.map(function (c, index) {
    return (
      '<a class="category-card" href="browse.html?type=' +
      encodeURIComponent(c.slug) +
      '">' +
      '<div class="category-card__index">' + String(index + 1).padStart(2, "0") + "</div>" +
      '<div class="category-card__name">' + c.name + '&nbsp;<span class="category-card__arrow" aria-hidden="true">→</span></div>' +
      '<div class="category-card__count">' + c.officialCount + " items</div>" +
      "</a>"
    );
  }).join("");
})();
