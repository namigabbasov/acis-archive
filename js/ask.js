// Ask the Archive: simulates an AI-assisted answer using only local mock data.
// No network calls are made — this is a prototype of the eventual experience.
(function () {
  if (typeof ACIS_ITEMS === "undefined") return;

  var form = document.getElementById("ask-form");
  var input = document.getElementById("ask-input");
  var resultEl = document.getElementById("ask-result");
  var exampleButtons = document.querySelectorAll("#example-questions button");

  var STOPWORDS = [
    "what",
    "did",
    "the",
    "about",
    "were",
    "was",
    "find",
    "a",
    "an",
    "in",
    "of",
    "to",
    "and",
    "related",
    "major",
    "concerns",
    "raised",
    "by",
    "issues",
    "discussed",
    "discuss",
  ];

  function extractTerms(question) {
    return question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 2 && STOPWORDS.indexOf(w) === -1;
      });
  }

  function scoreItem(item, terms) {
    var haystack = [item.title, item.description, item.type, (item.keywords || []).join(" ")]
      .join(" ")
      .toLowerCase();
    var score = 0;
    terms.forEach(function (t) {
      if (haystack.indexOf(t) !== -1) score += 1;
    });
    return score;
  }

  function findSources(question) {
    var terms = extractTerms(question);
    var scored = ACIS_ITEMS.map(function (item) {
      return { item: item, score: scoreItem(item, terms) };
    });

    var matched = scored.filter(function (s) {
      return s.score > 0;
    });

    var pool = matched.length > 0 ? matched : scored;

    pool.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.item.dateSort) - new Date(a.item.dateSort);
    });

    return pool.slice(0, 3).map(function (s) {
      return s.item;
    });
  }

  function summarizeThemes(items) {
    var keywordSet = [];
    items.forEach(function (item) {
      (item.keywords || []).forEach(function (k) {
        if (keywordSet.indexOf(k) === -1) keywordSet.push(k);
      });
    });
    return keywordSet.slice(0, 4);
  }

  function buildAnswer(question, sources) {
    var themes = summarizeThemes(sources);
    var themeText =
      themes.length > 0
        ? themes.slice(0, -1).join(", ") +
          (themes.length > 1 ? ", and " + themes[themes.length - 1] : themes[0] || "")
        : "interoperability, organizational activity, and policy advocacy";

    return (
      "Based on the archival materials represented in this prototype, ACIS materials touching on this question discuss " +
      themeText +
      ". Related records span meeting notes, correspondence, and formal filings; see the sources below for individual items."
    );
  }

  function renderResult(question, answer, sources) {
    var sourcesMarkup = sources
      .map(function (item, i) {
        return (
          "<li>" +
          '<span class="ask-source__num">' + (i + 1) + ".</span>" +
          '<a href="item.html?id=' + encodeURIComponent(item.id) + '" style="font-weight:600; text-decoration:none; color:var(--color-ink);">' +
          item.title +
          "</a>" +
          '<div class="ask-source__type">' + item.type + "</div>" +
          '<a class="text-link" href="item.html?id=' + encodeURIComponent(item.id) + '">View archival item →</a>' +
          "</li>"
        );
      })
      .join("");

    resultEl.innerHTML =
      '<div class="ask-answer">' +
      '<p class="ask-answer__label">Question</p>' +
      '<p class="ask-answer__question">' + question + "</p>" +
      '<p class="ask-answer__label">Answer</p>' +
      '<p class="ask-answer__text">' + answer + "</p>" +
      '<p class="ask-answer__label">Sources</p>' +
      '<ul class="ask-sources">' + sourcesMarkup + "</ul>" +
      "</div>";

    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function runQuery(question) {
    var sources = findSources(question);
    var answer = buildAnswer(question, sources);
    renderResult(question, answer, sources);
  }

  function handleSubmit(e) {
    e.preventDefault();
    var question = input.value.trim();
    if (!question) {
      input.focus();
      return;
    }
    runQuery(question);
  }

  form.addEventListener("submit", handleSubmit);

  exampleButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      input.value = btn.getAttribute("data-question");
      input.focus();
    });
  });

  var presetQuestion = new URLSearchParams(window.location.search).get("q");
  if (presetQuestion) {
    input.value = presetQuestion;
    runQuery(presetQuestion);
  }
})();
