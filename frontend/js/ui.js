// Shared rendering helpers: escaping, document thumbnails, record cards, citations.
// Thumbnails are CSS "facsimiles" standing in for SDR page images until real
// derivatives are available.

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemUrl(item) {
  return "item.html?id=" + encodeURIComponent(item.id);
}

function seriesUrl(slug) {
  return "browse.html?type=" + encodeURIComponent(slug);
}

// Short subject line used inside the facsimile (title without the "ACIS …:" prefix).
function facsimileSubject(item) {
  var parts = item.title.split(": ");
  return parts.length > 1 ? parts.slice(1).join(": ") : item.title.replace(/^ACIS\s+/, "");
}

function lines(n, cls) {
  var out = "";
  for (var i = 0; i < n; i++) {
    out += '<span class="fx-line' + (cls ? " " + cls : "") + '"></span>';
  }
  return out;
}

// Renders a stylised page facsimile appropriate to the material type.
function thumbMarkup(item, size) {
  var subject = esc(facsimileSubject(item));
  var body;

  switch (item.collectionSlug) {
    case "amicus-briefs":
      body =
        '<span class="fx-docket">No. ' + (item.year % 100) + "-" + (1000 + (item.pages * 37) % 9000) + "</span>" +
        '<span class="fx-court">In the<br>United States Court of Appeals</span>' +
        '<span class="fx-rule"></span>' +
        '<span class="fx-caps">Brief of Amicus Curiae<br>American Committee for<br>Interoperable Systems</span>' +
        '<span class="fx-rule"></span>' +
        '<span class="fx-small">' + subject + "</span>" +
        lines(3, "fx-line--center");
      break;
    case "letters":
      body =
        '<span class="fx-letterhead"><b>ACIS</b>American Committee for Interoperable Systems</span>' +
        '<span class="fx-date">' + esc(item.date) + "</span>" +
        lines(2, "fx-line--short") +
        '<span class="fx-gap"></span>' +
        lines(7) +
        '<span class="fx-sig"></span>';
      break;
    case "meeting-notes":
      body =
        '<span class="fx-caps fx-caps--left">Minutes of Meeting</span>' +
        '<span class="fx-small fx-small--left">' + esc(item.date) + "</span>" +
        '<span class="fx-rule fx-rule--full"></span>' +
        '<span class="fx-bullets">' + lines(8) + "</span>";
      break;
    case "comments":
      body =
        '<span class="fx-court">Before the<br>Federal Agency</span>' +
        '<span class="fx-caption"><span>' + lines(3) + '</span><span class="fx-caption__brace"></span><span>' + lines(2) + "</span></span>" +
        '<span class="fx-caps">Comments of the<br>American Committee for<br>Interoperable Systems</span>' +
        lines(4);
      break;
    default:
      body =
        '<span class="fx-cover"><b>ACIS</b></span>' +
        '<span class="fx-caps">' + subject + "</span>" +
        '<span class="fx-small">' + item.year + "</span>" +
        lines(3, "fx-line--center");
  }

  return (
    '<span class="thumb thumb--' + (size || "md") + '" aria-hidden="true">' +
    '<span class="fx fx--' + item.collectionSlug + '">' + body + "</span>" +
    "</span>"
  );
}

function recordRowMarkup(item) {
  var subjects = (item.keywords || []).slice(0, 3).map(esc).join(" · ");
  return (
    '<li class="result">' +
    '<a class="result__thumb" href="' + itemUrl(item) + '" tabindex="-1">' + thumbMarkup(item, "sm") + "</a>" +
    '<div class="result__body">' +
    '<h3 class="result__title"><a href="' + itemUrl(item) + '">' + esc(item.title) + "</a></h3>" +
    '<dl class="result__meta">' +
    "<div><dt>Date</dt><dd>" + esc(item.date) + "</dd></div>" +
    "<div><dt>Series</dt><dd>" + esc(item.type) + "</dd></div>" +
    "<div><dt>Extent</dt><dd>" + item.pages + " pages</dd></div>" +
    "<div><dt>Identifier</dt><dd>" + esc(item.identifier) + "</dd></div>" +
    "</dl>" +
    '<p class="result__desc">' + esc(item.description) + "</p>" +
    (subjects ? '<p class="result__subjects">' + subjects + "</p>" : "") +
    "</div>" +
    "</li>"
  );
}

function recordCardMarkup(item) {
  return (
    '<li class="card">' +
    '<a class="card__link" href="' + itemUrl(item) + '">' +
    '<span class="card__media">' + thumbMarkup(item, "md") + "</span>" +
    '<span class="card__type">' + esc(item.type) + "</span>" +
    '<span class="card__title">' + esc(item.title) + "</span>" +
    '<span class="card__date">' + esc(item.date) + "</span>" +
    "</a>" +
    "</li>"
  );
}

var ACIS_REPOSITORY = "Robert Crown Law Library, Stanford Law School";
var ACIS_CREATOR = "American Committee for Interoperable Systems";

function citations(item) {
  return {
    chicago: esc(
      ACIS_CREATOR + ". “" + item.title + ".” " + item.date + ". " +
      item.type + ", ACIS Digital Archive, " + ACIS_REPOSITORY + ". " + item.purl + "."
    ),
    bluebook:
      ACIS_CREATOR + ", <i>" + esc(item.title) + "</i> (" + esc(item.date) + "), " +
      "ACIS Digital Archive, " + ACIS_REPOSITORY + ", " + esc(item.purl) + ".",
  };
}
