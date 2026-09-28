// Homepage: hero collage, stats, series cards, featured items, and date histogram.
(function () {
  if (typeof ACIS_ITEMS === "undefined") return;

  var span = getYearSpan();

  var collage = document.getElementById("hero-collage");
  if (collage) {
    collage.innerHTML = ["letters", "amicus-briefs", "meeting-notes"]
      .map(function (slug) {
        return thumbMarkup(getItemsByCollectionSlug(slug)[0], "lg");
      })
      .join("");
  }

  var stats = document.getElementById("stats");
  if (stats) {
    var pages = ACIS_ITEMS.reduce(function (sum, i) { return sum + i.pages; }, 0);
    stats.innerHTML = [
      [totalOfficialCount(), "Archival items"],
      [ACIS_COLLECTIONS.length, "Series"],
      [span.min + "–" + span.max, "Date range"],
      [pages.toLocaleString() + "+", "Digitized pages"],
    ]
      .map(function (s) {
        return '<li><span class="stats__num">' + s[0] + '</span><span class="stats__label">' + s[1] + "</span></li>";
      })
      .join("");
  }

  var seriesGrid = document.getElementById("series-grid");
  if (seriesGrid) {
    seriesGrid.innerHTML = ACIS_COLLECTIONS.map(function (c) {
      var sample = getItemsByCollectionSlug(c.slug)[0];
      return (
        "<li>" +
        '<a class="series-card" href="' + seriesUrl(c.slug) + '">' +
        '<span class="series-card__media">' + thumbMarkup(sample, "md") + "</span>" +
        '<span class="series-card__body">' +
        '<span class="series-card__series">' + esc(c.series) + "</span>" +
        '<span class="series-card__name">' + esc(c.name) + "</span>" +
        '<span class="series-card__meta">' + c.officialCount + " items · " + getCollectionDateRange(c.slug) + "</span>" +
        "</span>" +
        "</a>" +
        "</li>"
      );
    }).join("");
  }

  var featured = document.getElementById("featured");
  if (featured) {
    var picks = [
      "ACIS Amicus Brief: Software Interface Copyrightability",
      "ACIS Comments on Interface Specification Access",
      "ACIS Meeting Notes, December 1991",
      "ACIS Letter, October 1993",
    ];
    featured.innerHTML = picks
      .map(function (t) {
        return ACIS_ITEMS.find(function (i) { return i.title === t; });
      })
      .filter(Boolean)
      .map(recordCardMarkup)
      .join("");
  }

  var timeline = document.getElementById("timeline");
  if (timeline) {
    var counts = {};
    ACIS_ITEMS.forEach(function (i) { counts[i.year] = (counts[i.year] || 0) + 1; });
    var years = [];
    for (var y = span.min; y <= span.max; y++) years.push(y);
    var max = Math.max.apply(null, years.map(function (yr) { return counts[yr] || 0; }));

    timeline.innerHTML =
      '<div class="timeline__bars">' +
      years
        .map(function (yr) {
          var n = counts[yr] || 0;
          var label = yr + ": " + n + " item" + (n === 1 ? "" : "s");
          return (
            '<a class="timeline__bar" href="browse.html?from=' + yr + "&to=" + yr + '" aria-label="' + label + '" title="' + label + '">' +
            '<span class="timeline__fill" style="height:' + (n / max) * 85 + '%"><span class="timeline__count">' + n + "</span></span>" +
            "</a>"
          );
        })
        .join("") +
      "</div>" +
      '<div class="timeline__years" aria-hidden="true">' +
      years.map(function (yr) { return "<span>" + yr + "</span>"; }).join("") +
      "</div>" +
      '<p class="timeline__note">Number of items by year.</p>';
  }
})();
