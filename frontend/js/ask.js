// Ask the Archive: question → answer with numbered, cited sources.
//
// When ACIS_CONFIG.askEndpoint (js/config.js) is set, questions are sent to the
// AI discovery API. Otherwise a local keyword match over js/data.js stands in.
// Either way, the page never shows sources that don't match the question.
(function () {
  if (typeof ACIS_ITEMS === "undefined") return;

  var config = window.ACIS_CONFIG || {};
  var endpoint = (config.askEndpoint || "").trim();
  if (endpoint.indexOf("__") === 0) endpoint = ""; // unsubstituted deploy placeholder
  var timeoutMs = config.askTimeoutMs || 30000;

  var form = document.getElementById("ask-form");
  var input = document.getElementById("ask-input");
  var submitBtn = form.querySelector('button[type="submit"]');
  var resultEl = document.getElementById("ask-result");
  var exampleButtons = document.querySelectorAll("#example-questions button");

  // ---------- Rendering ----------

  // Escapes the answer text, keeps paragraph breaks, and turns [n] into links to source n.
  function answerMarkup(text, sourceCount) {
    return String(text)
      .split(/\n\s*\n/)
      .map(function (para) {
        var html = esc(para.trim()).replace(/\s*\[(\d+)\]/g, function (m, n) {
          n = parseInt(n, 10);
          return n >= 1 && n <= sourceCount ? '<sup><a href="#source-' + n + '">[' + n + "]</a></sup>" : m;
        });
        return html ? '<p class="ask-answer__text">' + html + "</p>" : "";
      })
      .join("");
  }

  function renderShell(question, bodyHtml) {
    resultEl.innerHTML =
      '<div class="ask-answer">' +
      '<p class="ask-answer__question">' + esc(question) + "</p>" +
      bodyHtml +
      "</div>";
  }

  function renderResult(question, answerText, sources) {
    renderShell(
      question,
      answerMarkup(answerText, sources.length) +
        '<p class="ask-answer__note">AI-generated summary. Check the sources before citing.</p>' +
        (sources.length
          ? "<h3>Sources</h3>" +
            '<ol class="results ask-sources">' +
            sources
              .map(function (item, i) {
                return recordRowMarkup(item).replace('<li class="result">', '<li class="result" id="source-' + (i + 1) + '">');
              })
              .join("") +
            "</ol>"
          : "")
    );
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderNoMatch(question) {
    renderShell(
      question,
      '<div class="ask-status">' +
        "<h3>No matching records found</h3>" +
        "<p>Nothing in the collection appears to address this question. Try different wording, ask about a specific topic such as reverse engineering, software interfaces, or standards, or " +
        '<a href="browse.html">browse the collection</a>.</p>' +
      "</div>"
    );
  }

  function renderError(question) {
    renderShell(
      question,
      '<div class="ask-status ask-status--error" role="alert">' +
        "<h3>Ask the Archive is unavailable right now</h3>" +
        '<p>Please try again in a moment, or <a href="browse.html?q=' + encodeURIComponent(question) + '">search the collection</a> instead.</p>' +
      "</div>"
    );
  }

  function setLoading(isLoading, question) {
    submitBtn.disabled = isLoading;
    form.setAttribute("aria-busy", isLoading ? "true" : "false");
    if (isLoading) {
      renderShell(question, '<p class="ask-status ask-status--loading">Searching the collection…</p>');
    }
  }

  // ---------- AI discovery API ----------
  // Request:  POST { "question": "..." }
  // Response: { "answer": "text with [1] [2] references", "sources": [{ "id": "<item id>" }, ...] }
  //           (sources may also be plain id strings)

  function askApi(question) {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, timeoutMs) : null;

    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question }),
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var sources = (data.sources || [])
          .map(function (s) { return getItemById(typeof s === "string" ? s : s && s.id); })
          .filter(Boolean);
        return { answer: data.answer || "", sources: sources };
      })
      .finally(function () {
        if (timer) clearTimeout(timer);
      });
  }

  // ---------- Local stand-in (used only when no endpoint is configured) ----------

  // Words that carry no topic, including ones every record contains (ACIS, the committee's name).
  var STOPWORDS = [
    "what", "did", "does", "the", "about", "were", "was", "find", "and", "related", "major",
    "concerns", "raised", "issues", "discussed", "discuss", "how", "why", "when", "who", "which",
    "any", "anything", "tell", "show", "think", "say", "said", "their", "they", "this", "that",
    "with", "from", "for", "into", "there", "have", "has", "records", "record", "documents",
    "collection", "archive", "acis", "american", "committee",
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
    if (!terms.length) return [];
    return ACIS_ITEMS.map(function (item) {
      return { item: item, score: scoreItem(item, terms) };
    })
      .filter(function (s) { return s.score > 0; })
      .sort(function (a, b) {
        return b.score - a.score || b.item.dateSort.localeCompare(a.item.dateSort);
      })
      .slice(0, 3)
      .map(function (s) { return s.item; });
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

  // Plain text with [n] references, the same shape the API returns.
  function buildAnswer(sources) {
    var themes = summarizeThemes(sources);
    var themeText =
      themes.length > 1 ? themes.slice(0, -1).join(", ") + ", and " + themes[themes.length - 1] : themes[0];

    return (
      "Records in the collection that bear on this question concern " + themeText + "." +
      " The most directly relevant record is " + sources[0].title +
      (sources[0].title.indexOf(sources[0].date) === -1 ? ", dated " + sources[0].date : "") + " [1]." +
      (sources.length > 1
        ? " Related discussion appears in " +
          sources.slice(1).map(function (s, i) { return s.title + " [" + (i + 2) + "]"; }).join(" and ") + "."
        : "") +
      " Consult the source documents below for the full context."
    );
  }

  function askLocal(question) {
    var sources = findSources(question);
    return Promise.resolve({ answer: sources.length ? buildAnswer(sources) : "", sources: sources });
  }

  // ---------- Flow ----------

  function runQuery(question) {
    setLoading(true, question);
    (endpoint ? askApi(question) : askLocal(question))
      .then(function (result) {
        if (!result.sources.length && !result.answer) renderNoMatch(question);
        else renderResult(question, result.answer, result.sources);
      })
      .catch(function () {
        renderError(question);
      })
      .finally(function () {
        submitBtn.disabled = false;
        form.setAttribute("aria-busy", "false");
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var question = input.value.trim();
    if (!question) {
      input.focus();
      return;
    }
    runQuery(question);
  });

  // The question box starts at two lines and grows with longer questions.
  function fitInput() {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  }
  input.addEventListener("input", fitInput);

  exampleButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      input.value = btn.getAttribute("data-question");
      fitInput();
      input.focus();
    });
  });

  var presetQuestion = new URLSearchParams(window.location.search).get("q");
  if (presetQuestion) {
    input.value = presetQuestion;
    fitInput();
    runQuery(presetQuestion);
  }
})();
