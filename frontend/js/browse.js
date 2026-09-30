// Browse page: keyword search, series/date/decade facets, sort, list/gallery view,
// pagination, and series ("collection") landing headers. State lives in the URL.
(function () {
  if (typeof ACIS_ITEMS === "undefined") return;

  // Page sizes per view; the gallery uses multiples of 12 so every grid row is full.
  var PAGE_SIZES = { list: [25, 50, 100], grid: [24, 48, 96] };
  var span = getYearSpan();

  var el = function (id) { return document.getElementById(id); };
  var searchForm = el("search-form");
  var searchInput = el("search-input");
  var yearFrom = el("year-from");
  var yearTo = el("year-to");
  var sortSelect = el("filter-sort");
  var perPageSelect = el("per-page");
  var facetSeries = el("facet-series");
  var facetDecade = el("facet-decade");
  var list = el("record-list");
  var emptyState = el("empty-state");
  var count = el("results-count");
  var chips = el("chips");
  var pagination = el("pagination");
  var viewButtons = document.querySelectorAll(".view-toggle button");

  // ---------- State ----------
  var params = new URLSearchParams(window.location.search);
  var splitParam = function (name) {
    return (params.get(name) || "").split(",").filter(Boolean);
  };
  var state = {
    q: params.get("q") || "",
    types: splitParam("type"),
    decades: splitParam("decade").map(Number),
    from: parseInt(params.get("from"), 10) || span.min,
    to: parseInt(params.get("to"), 10) || span.max,
    sort: params.get("sort") || "relevance",
    view: params.get("view") === "grid" ? "grid" : "list",
    page: parseInt(params.get("page"), 10) || 1,
    size: 0, // index into PAGE_SIZES[view]
  };

  function perPage() {
    return PAGE_SIZES[state.view][state.size];
  }
  var showParam = parseInt(params.get("show"), 10);
  ["list", "grid"].forEach(function (v) {
    var i = PAGE_SIZES[v].indexOf(showParam);
    if (i > 0) state.size = i;
  });

  var decadesAll = [];
  for (var d = Math.floor(span.min / 10) * 10; d <= span.max; d += 10) decadesAll.push(d);

  // ---------- Controls ----------
  var yearOptions = "";
  for (var y = span.min; y <= span.max; y++) yearOptions += '<option value="' + y + '">' + y + "</option>";
  yearFrom.innerHTML = yearOptions;
  yearTo.innerHTML = yearOptions;

  function matchesQuery(item, q) {
    if (!q) return true;
    var hay = [item.title, item.description, item.type, item.date, item.identifier, (item.keywords || []).join(" ")]
      .join(" ")
      .toLowerCase();
    return q
      .toLowerCase()
      .split(/\s+/)
      .every(function (term) { return hay.indexOf(term) !== -1; });
  }

  // Filter with every facet except `skip`, so facet counts reflect the other selections.
  function filterItems(skip) {
    return ACIS_ITEMS.filter(function (item) {
      if (skip !== "type" && state.types.length && state.types.indexOf(item.collectionSlug) === -1) return false;
      if (skip !== "decade" && state.decades.length && state.decades.indexOf(Math.floor(item.year / 10) * 10) === -1) return false;
      if (item.year < state.from || item.year > state.to) return false;
      return matchesQuery(item, state.q);
    });
  }

  function sortItems(items) {
    var byDate = function (a, b) { return a.dateSort.localeCompare(b.dateSort); };
    var sorted = items.slice();
    if (state.sort === "date-desc") sorted.sort(function (a, b) { return byDate(b, a); });
    else if (state.sort === "title") sorted.sort(function (a, b) { return a.title.localeCompare(b.title); });
    else if (state.sort === "date-asc" || !state.q) sorted.sort(byDate);
    else {
      var q = state.q.toLowerCase();
      sorted.sort(function (a, b) {
        var at = a.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
        var bt = b.title.toLowerCase().indexOf(q) !== -1 ? 0 : 1;
        return at - bt || byDate(a, b);
      });
    }
    return sorted;
  }

  function checkbox(name, value, label, n, checked) {
    return (
      '<label class="facet__opt"><input type="checkbox" name="' + name + '" value="' + value + '"' +
      (checked ? " checked" : "") + (n === 0 && !checked ? " disabled" : "") + " />" +
      "<span>" + esc(label) + '</span><span class="facet__count">' + n + "</span></label>"
    );
  }

  function renderFacets() {
    var byType = filterItems("type");
    facetSeries.innerHTML = ACIS_COLLECTIONS.map(function (c) {
      var n = byType.filter(function (i) { return i.collectionSlug === c.slug; }).length;
      return checkbox("type", c.slug, c.name, n, state.types.indexOf(c.slug) !== -1);
    }).join("");

    var byDecade = filterItems("decade");
    facetDecade.innerHTML = decadesAll.map(function (dec) {
      var n = byDecade.filter(function (i) { return Math.floor(i.year / 10) * 10 === dec; }).length;
      return checkbox("decade", dec, dec + "s", n, state.decades.indexOf(dec) !== -1);
    }).join("");

    yearFrom.value = state.from;
    yearTo.value = state.to;
    // Don't overwrite the box while someone is typing in it (it would eat trailing spaces).
    if (document.activeElement !== searchInput) searchInput.value = state.q;
    sortSelect.value = state.sort;
    perPageSelect.innerHTML = PAGE_SIZES[state.view]
      .map(function (n, i) { return '<option value="' + i + '"' + (i === state.size ? " selected" : "") + ">" + n + "</option>"; })
      .join("");
  }

  function renderHeader() {
    var single = state.types.length === 1 ? getCollectionBySlug(state.types[0]) : null;
    var eyebrow = el("collection-eyebrow");
    var facts = el("series-facts");
    var crumb = el("crumb-browse");

    if (single) {
      eyebrow.hidden = false;
      eyebrow.textContent = single.series;
      el("page-heading").textContent = single.name;
      el("page-description").textContent = single.description;
      facts.hidden = false;
      facts.innerHTML =
        "<div><dt>Items</dt><dd>" + single.officialCount + "</dd></div>" +
        "<div><dt>Dates</dt><dd>" + getCollectionDateRange(single.slug) + "</dd></div>";
      crumb.innerHTML = '<a href="browse.html">Browse</a>';
      if (!crumb.nextElementSibling) {
        var li = document.createElement("li");
        li.id = "crumb-series";
        crumb.parentNode.appendChild(li);
      }
      crumb.nextElementSibling.innerHTML = '<span aria-current="page">' + esc(single.name) + "</span>";
      document.title = single.name + " | ACIS Digital Archive";
    } else {
      eyebrow.hidden = true;
      el("page-heading").textContent = "Browse the Collection";
      el("page-description").textContent = "Search across all series, or narrow results by series and date.";
      facts.hidden = true;
      crumb.innerHTML = '<span aria-current="page">Browse the Collection</span>';
      if (crumb.nextElementSibling) crumb.parentNode.removeChild(crumb.nextElementSibling);
      document.title = "Browse the Collection | ACIS Digital Archive";
    }
  }

  function renderChips() {
    var out = [];
    if (state.q) out.push(["q", "", "Keyword", state.q]);
    state.types.forEach(function (t) {
      var c = getCollectionBySlug(t);
      out.push(["type", t, "Series", c ? c.name : t]);
    });
    state.decades.forEach(function (dec) { out.push(["decade", dec, "Decade", dec + "s"]); });
    if (state.from !== span.min || state.to !== span.max) {
      out.push(["years", "", "Date", state.from === state.to ? state.from : state.from + "–" + state.to]);
    }
    chips.innerHTML = out
      .map(function (c) {
        return (
          '<li><button type="button" class="chip" data-kind="' + c[0] + '" data-value="' + esc(c[1]) + '">' +
          "<b>" + c[2] + ":</b> " + esc(c[3]) +
          '<span class="chip__x" aria-hidden="true">✕</span><span class="visually-hidden">Remove filter</span></button></li>'
        );
      })
      .join("");
  }

  function renderPagination(total) {
    var pages = Math.ceil(total / perPage());
    if (pages <= 1) { pagination.innerHTML = ""; return; }
    var html = '<button type="button" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? " disabled" : "") + ">‹ Previous</button>";
    for (var p = 1; p <= pages; p++) {
      html += '<button type="button" data-page="' + p + '"' + (p === state.page ? ' aria-current="page"' : "") + ">" + p + "</button>";
    }
    html += '<button type="button" data-page="' + (state.page + 1) + '"' + (state.page === pages ? " disabled" : "") + ">Next ›</button>";
    pagination.innerHTML = html;
  }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.types.length) p.set("type", state.types.join(","));
    if (state.decades.length) p.set("decade", state.decades.join(","));
    if (state.from !== span.min) p.set("from", state.from);
    if (state.to !== span.max) p.set("to", state.to);
    if (state.sort !== "relevance") p.set("sort", state.sort);
    if (state.view !== "list") p.set("view", state.view);
    if (state.size > 0) p.set("show", perPage());
    if (state.page > 1) p.set("page", state.page);
    var qs = p.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? "?" + qs : ""));
  }

  function render() {
    var items = sortItems(filterItems());
    var total = items.length;
    var pages = Math.max(1, Math.ceil(total / perPage()));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * perPage();
    var pageItems = items.slice(start, start + perPage());

    renderHeader();
    renderFacets();
    renderChips();

    count.innerHTML = total
      ? "Showing <strong>" + (start + 1) + "–" + (start + pageItems.length) + "</strong> of <strong>" + total + "</strong> item" + (total === 1 ? "" : "s")
      : "<strong>0</strong> items";

    list.className = state.view === "grid" ? "results results--grid" : "results";
    list.innerHTML = pageItems.map(state.view === "grid" ? recordCardMarkup : recordRowMarkup).join("");
    emptyState.hidden = total !== 0;

    viewButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-view") === state.view ? "true" : "false");
    });

    renderPagination(total);
    syncUrl();
  }

  // ---------- Events ----------
  function update(changes) {
    for (var k in changes) state[k] = changes[k];
    if (!("page" in changes)) state.page = 1;
    render();
  }

  // Keyword search updates as you type, like the other filters; Enter applies it at once.
  var typingTimer = null;
  function applyQuery() {
    clearTimeout(typingTimer);
    var q = searchInput.value.trim();
    if (q !== state.q) update({ q: q });
  }
  searchInput.addEventListener("input", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(applyQuery, 300);
  });
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    applyQuery();
  });

  document.querySelector(".facets").addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "type" || t.name === "decade") {
      var checked = Array.prototype.map.call(
        document.querySelectorAll('input[name="' + t.name + '"]:checked'),
        function (i) { return t.name === "decade" ? Number(i.value) : i.value; }
      );
      update(t.name === "type" ? { types: checked } : { decades: checked });
    } else if (t === yearFrom || t === yearTo) {
      var from = parseInt(yearFrom.value, 10);
      var to = parseInt(yearTo.value, 10);
      if (from > to) { if (t === yearFrom) to = from; else from = to; }
      update({ from: from, to: to });
    }
  });

  sortSelect.addEventListener("change", function () { update({ sort: sortSelect.value }); });
  perPageSelect.addEventListener("change", function () { update({ size: parseInt(perPageSelect.value, 10) }); });

  viewButtons.forEach(function (b) {
    b.addEventListener("click", function () { update({ view: b.getAttribute("data-view"), page: state.page }); });
  });

  chips.addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    var kind = chip.getAttribute("data-kind");
    var value = chip.getAttribute("data-value");
    if (kind === "q") update({ q: "" });
    else if (kind === "type") update({ types: state.types.filter(function (t) { return t !== value; }) });
    else if (kind === "decade") update({ decades: state.decades.filter(function (dd) { return String(dd) !== value; }) });
    else if (kind === "years") update({ from: span.min, to: span.max });
  });

  pagination.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-page]");
    if (!b || b.disabled) return;
    update({ page: parseInt(b.getAttribute("data-page"), 10) });
    count.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  function clearAll() {
    update({ q: "", types: [], decades: [], from: span.min, to: span.max, sort: "relevance" });
  }
  el("clear-filters").addEventListener("click", clearAll);
  el("empty-clear").addEventListener("click", clearAll);

  render();
})();
