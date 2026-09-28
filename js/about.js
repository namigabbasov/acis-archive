// About page: series arrangement table.
(function () {
  var body = document.getElementById("series-table");
  if (!body || typeof ACIS_COLLECTIONS === "undefined") return;

  body.innerHTML = ACIS_COLLECTIONS.map(function (c) {
    return (
      "<tr>" +
      "<td>" + esc(c.series) + "</td>" +
      '<td><a href="' + seriesUrl(c.slug) + '">' + esc(c.name) + "</a><br><span style=\"color:var(--grey)\">" + esc(c.description) + "</span></td>" +
      '<td class="num">' + c.officialCount + "</td>" +
      "</tr>"
    );
  }).join("");
})();
