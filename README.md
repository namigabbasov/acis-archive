# ACIS Digital Archive — Front-End Prototype

A front-end-only prototype for the American Committee for Interoperable
Systems (ACIS) Digital Archive, built for the Robert Crown Law Library,
Stanford Law School. This prototype is intended to demonstrate the look,
feel, navigation, and browsing experience of the eventual production site,
which will be built on **Omeka Classic** with digital objects hosted in the
**Stanford Digital Repository (SDR)**.

No backend, database, authentication, or external APIs are used. All
content is mock data defined in `js/data.js`.

---

## Running it locally

Because the pages use `fetch`-free, same-origin JavaScript (`<script src>`
tags and relative links only), you can open `index.html` directly in most
browsers. However, some browsers restrict certain JavaScript behavior on
the `file://` protocol, so the most reliable way to preview the prototype
is with a simple local static server:

### Option A — Python (built in on most machines)

```bash
cd acis-archive
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

### Option B — Node.js

```bash
cd acis-archive
npx serve .
```

(or any static server of your choice, e.g. `npx http-server`)

### Option C — VS Code "Live Server" extension

Open the folder in VS Code, right-click `index.html`, and choose
**"Open with Live Server."**

No build step, package installation, or compilation is required.

---

## Project structure

```
acis-archive/
├── index.html          Home page
├── about.html           About page (About ACIS / archive / collection / access)
├── browse.html           Browse Archive — also serves as the "collection" page
│                          when visited with ?type=<collection-slug>
├── item.html              Individual archival item page (?id=<item-id>)
├── ask.html                Ask the Archive (simulated AI-assisted discovery)
├── contact.html             Contact page
├── css/
│   └── style.css            All styles — Stanford Cardinal palette, typography,
│                              layout, responsive rules, focus states
├── js/
│   ├── data.js                Mock archival records + collections (Omeka-style
│   │                            Items / Collections) — the only "database"
│   ├── main.js                  Shared behavior: mobile nav toggle
│   ├── home.js                    Renders the homepage category grid
│   ├── browse.js                   Search, filter, sort, and collection-page logic
│   ├── item.js                      Renders a single item's metadata + SDR panel
│   └── ask.js                        Simulated "Ask the Archive" answer generation
└── README.md
```

## User flows to try

- **Home → Browse Archive → Collection → Item → SDR placeholder**
  Click any of the five category cards on the homepage (e.g. "Meeting
  Notes"). This opens `browse.html?type=meeting-notes`, which behaves as a
  dedicated collection page (its own heading, description, and item list).
  Click any item's title or "View item →" to open its detail page, then
  click "View Document in Stanford Digital Repository →" to see the
  placeholder SDR link.

- **Home → Ask the Archive → Ask a question → See mock answer → Click a
  source → Item page**
  On `ask.html`, click one of the four example questions (this fills the
  question box), then click **Ask**. A simulated answer and a list of
  matching source items appears; clicking a source opens that item's page.

- **Search and filter**
  On `browse.html`, try searching "interoperability," filtering by
  material type, setting a date range, or changing the sort order. Use
  "Clear all filters" to reset. The result count updates live, and the
  current filter state is reflected in the URL so results are shareable.

## Notes on the mock dataset

The real ACIS collection contains 95 items across five material types
(12 Amicus Briefs, 13 Meeting Notes, 30 Letters, 20 Comments, 20 Other).
This prototype includes ~40 representative mock records so the browsing,
search, and filtering experience can be fully exercised, while headers and
counts throughout the UI display the real, official collection totals —
per the project brief. Swap in real Omeka/SDR-sourced data by replacing
the contents of `js/data.js` with the same shape (see the `RAW_ITEMS`
array and helper functions at the bottom of that file).

## Omeka Classic mapping

This prototype's information architecture intentionally mirrors Omeka
Classic concepts so it can be re-implemented as an Omeka theme without
restructuring:

| Prototype concept                     | Omeka Classic concept                  |
|----------------------------------------|-----------------------------------------|
| `ACIS_COLLECTIONS` in `data.js`         | Collections                            |
| `ACIS_ITEMS` in `data.js`               | Items                                   |
| Item metadata table on `item.html`      | Item's Dublin Core metadata fields      |
| `browse.html` (no `?type=`)             | "Browse Items" page                     |
| `browse.html?type=<slug>`               | A Collection's browse/show page         |
| `item.html?id=<id>`                     | An Item's show page                     |
| `about.html`, `contact.html`            | Omeka "Simple Pages"                    |
| Header / footer navigation              | Theme navigation                        |
| SDR permanent URL on item page          | An Item's linked external digital object (e.g. via a custom element/plugin field pointing to the SDR PURL) |

When the production Omeka theme is built, `js/data.js` and the client-side
search/filter logic here can be replaced with server-rendered Omeka
queries, while the CSS in `css/style.css` can be adapted largely as-is
into the Omeka theme's stylesheet.

## Accessibility

- Semantic HTML landmarks (`header`, `nav`, `main`, `footer`)
- Logical heading hierarchy on every page
- Visible focus states on all interactive elements
- Skip-to-content link on every page
- Descriptive link text ("View item →", "View Document in Stanford
  Digital Repository →") rather than "click here"
- Labeled form fields for search and filters
- Mobile navigation is a real, keyboard-operable `<button>` with
  `aria-expanded`
- Respects `prefers-reduced-motion`

## What this prototype is *not*

- It is **not** connected to Omeka, the Stanford Digital Repository, or
  any external API or database.
- The "Ask the Archive" answers are simulated from local mock data — no
  AI API is called.
- Historical descriptions of ACIS on the About page are explicitly marked
  as placeholder content, since no verified historical copy was provided.
