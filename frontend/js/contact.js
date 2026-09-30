// Contact form. When ACIS_CONFIG.contactEndpoint (js/config.js) is set, the message is
// POSTed there as JSON; otherwise the visitor's email app opens with the message filled in.
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var config = window.ACIS_CONFIG || {};
  var endpoint = (config.contactEndpoint || "").trim();
  var mailTo = config.contactEmail || "digitalprojects@law.stanford.edu";
  var statusEl = document.getElementById("contact-status");
  var submitBtn = form.querySelector('button[type="submit"]');

  function field(name) {
    return form.elements[name];
  }

  function showStatus(kind, html) {
    statusEl.className = "contact-status contact-status--" + kind;
    statusEl.innerHTML = html;
    statusEl.hidden = false;
  }

  // Marks empty/invalid required fields and returns the first one, or null if all are valid.
  function firstInvalid() {
    var bad = null;
    ["name", "email", "message"].forEach(function (name) {
      var el = field(name);
      var ok = el.value.trim() !== "" && (name !== "email" || el.checkValidity());
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok && !bad) bad = el;
    });
    return bad;
  }

  function payload() {
    return {
      name: field("name").value.trim(),
      email: field("email").value.trim(),
      affiliation: field("affiliation").value.trim(),
      topic: field("topic").value,
      message: field("message").value.trim(),
      page: window.location.href,
    };
  }

  function openEmail(data) {
    var body =
      data.message + "\n\n" +
      "Name: " + data.name + "\n" +
      "Email: " + data.email + "\n" +
      (data.affiliation ? "Affiliation: " + data.affiliation + "\n" : "");
    window.location.href =
      "mailto:" + mailTo +
      "?subject=" + encodeURIComponent("ACIS Digital Archive: " + data.topic) +
      "&body=" + encodeURIComponent(body);
    showStatus(
      "info",
      "<strong>Your email app should now open with your message.</strong> Send it from there to complete your request. " +
        'If nothing opened, email us at <a href="mailto:' + mailTo + '">' + mailTo + "</a>."
    );
  }

  function sendToEndpoint(data) {
    submitBtn.disabled = true;
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        showStatus("success", "<strong>Thank you. Your message has been sent.</strong> We will reply if a response is needed.");
      })
      .catch(function () {
        showStatus(
          "error",
          "<strong>Your message could not be sent.</strong> Please try again, or email us at " +
            '<a href="mailto:' + mailTo + '">' + mailTo + "</a>."
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = firstInvalid();
    if (bad) {
      showStatus("error", "Please fill in your name, a valid email address, and your message.");
      bad.focus();
      return;
    }
    var data = payload();
    if (endpoint) sendToEndpoint(data);
    else openEmail(data);
  });

  form.addEventListener("input", function (e) {
    if (e.target.getAttribute("aria-invalid") === "true") firstInvalid();
  });
})();
