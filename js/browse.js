// Browse Archive page: search, filter, sort, and collection-page rendering.
(function () {
  if (typeof ACIS_ITEMS === "undefined") return;

  var params = new URLSearchParams(window.location.search);

  var searchForm = document.getElementById("search-form");
  var searchInput = document.getElementById("search-input");
  var filterType = document.getElementById("filter-type");
  var dateFrom = document.getElementById("date-from");
  var dateTo = document.getElementById("date-to");
  var filterSort = document.getElementById("filter-sort");
  var clearFiltersBtn = document.getElementById("clear-filters");
  var emptyClearBtn = document.getElementById("empty-clear");

  var recordList = document.getElementById("record-list");
  var emptyState = document.getElementById("empty-state");
  var resultsCount = document.getElementById("results-count");
  var resultsNote = document.getElementById("results-note");

  var pageHeading = document.getElementById("page-heading");
  var pageDescription = document.getElementById("page-description");
  var collectionEyebrow = document.getElementById("collection-eyebrow");
  var breadcrumbCurrent = document.getElementById("breadcrumb-current");
  var pageTitleTag = document.getElementById("page-title");

  var initialType = params.get("type") || "all";
  var initialQuery = params.get("q") || "";

  filterType.value = initialType;
  searchInput.value = initialQuery;

  function applyCollectionHeader(typeSlug) {
    var collection = getCollectionBySlug(typeSlug);

    if (!collection) {
      collectionEyebrow.textContent = "Browse Archive";
      pageHeading.textContent = "Explore the ACIS archival collection.";
      pageDescription.textContent =
        "Search across the full collection, or filter by material type, date, and more.";
      breadcrumbCurrent.textContent = "Browse Archive";
      pageTitleTag.textContent = "Browse Archive — ACIS Digital Archive";
      return;
    }

    collectionEyebrow.textContent = "Collection";
    pageHeading.textContent = collection.name;
    pageDescription.textContent = collection.description;
    breadcrumbCurrent.textContent = collection.name;
    pageTitleTag.textContent = collection.name + " — ACIS Digital Archive";
  }

  function parseDateSort(value) {
    var d = new Date(value + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }

  function itemMatchesQuery(item, query) {
    if (!query) return true;
    var haystack = [
      item.title,
      item.description,
      item.type,
      item.date,
      item.collectionSlug,
      (item.keywords || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function getFilteredItems() {
    var query = searchInput.value.trim();
    var typeSlug = filterType.value;
    var from = dateFrom.value ? parseDateSort(dateFrom.value) : null;
    var to = dateTo.value ? parseDateSort(dateTo.value) : null;
    var sort = filterSort.value;

    var items = ACIS_ITEMS.filter(function (item) {
      if (typeSlug !== "all" && item.collectionSlug !== typeSlug) return false;
      if (!itemMatchesQuery(item, query)) return false;

      if (from || to) {
        var itemDate = new Date(item.dateSort + "T00:00:00");
        if (from && itemDate < from) return false;
        if (to && itemDate > to) return false;
      }

      return true;
    });

    items = items.slice();

    if (sort === "date-desc") {
      items.sort(function (a, b) {
        return new Date(b.dateSort) - new Date(a.dateSort);
      });
    } else if (sort === "date-asc") {
      items.sort(function (a, b) {
        return new Date(a.dateSort) - new Date(b.dateSort);
      });
    } else if (sort === "title") {
      items.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
    } else {
      // "Relevance": items whose title contains the query first, then the rest.
      if (query) {
        var q = query.toLowerCase();
        items.sort(function (a, b) {
          var aTitle = a.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
          var bTitle = b.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
          if (aTitle !== bTitle) return aTitle - bTitle;
          return new Date(b.dateSort) - new Date(a.dateSort);
        });
      } else {
        items.sort(function (a, b) {
          return new Date(b.dateSort) - new Date(a.dateSort);
        });
      }
    }

    return items;
  }

  function recordMarkup(item) {
    return (
      '<li class="record">' +
      '<span class="record__tab" aria-hidden="true"></span>' +
      '<div class="record__body">' +
      '<div class="record__meta-row"><span>' + item.type + '</span><span class="dot">·</span><span>' + item.date + "</span></div>" +
      '<h3 class="record__title"><a href="item.html?id=' + encodeURIComponent(item.id) + '">' + item.title + "</a></h3>" +
      '<p class="record__collection">Collection: ' + item.type + "</p>" +
      '<a class="record__link" href="item.html?id=' + encodeURIComponent(item.id) + '">View item →</a>' +
      "</div>" +
      "</li>"
    );
  }

  function render() {
    applyCollectionHeader(filterType.value);

    var filtered = getFilteredItems();

    if (filtered.length === 0) {
      recordList.innerHTML = "";
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      recordList.innerHTML = filtered.map(recordMarkup).join("");
    }

    var collection = getCollectionBySlug(filterType.value);
    var officialTotal = collection ? collection.officialCount : totalOfficialCount();

    resultsCount.textContent = officialTotal + " item" + (officialTotal === 1 ? "" : "s");
    resultsNote.textContent =
      "Showing " + filtered.length + " of " + officialTotal + " archival items (digitized sample for this prototype).";

    // Keep the URL shareable/bookmarkable without reloading the page.
    var newParams = new URLSearchParams();
    if (filterType.value !== "all") newParams.set("type", filterType.value);
    if (searchInput.value.trim()) newParams.set("q", searchInput.value.trim());
    var newUrl =
      window.location.pathname + (newParams.toString() ? "?" + newParams.toString() : "");
    window.history.replaceState({}, "", newUrl);
  }

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    render();
  });

  [filterType, dateFrom, dateTo, filterSort].forEach(function (el) {
    el.addEventListener("change", render);
  });

  function clearFilters() {
    filterType.value = "all";
    dateFrom.value = "";
    dateTo.value = "";
    filterSort.value = "relevance";
    searchInput.value = "";
    render();
  }

  clearFiltersBtn.addEventListener("click", clearFilters);
  emptyClearBtn.addEventListener("click", clearFilters);

  render();
})();
