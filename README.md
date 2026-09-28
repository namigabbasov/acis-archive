# ACIS Digital Archive

The digital archive of the American Committee for Interoperable Systems
(ACIS) records, 1991–2001, published by the Robert Crown Law Library,
Stanford Law School.

- Static site: plain HTML, CSS, and JavaScript, with no build step or framework
- Hosting: **AWS Amplify**
- Digital objects: **Stanford Digital Repository (SDR)**
- Ask the Archive: **AI discovery API**, an AWS Lambda endpoint

---

## Running locally

Serve the repository root with any static server:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
# or
npx serve .
```

Opening `index.html` directly from disk also works in most browsers.

## Project structure

```
acis-archive/
├── index.html      Home: search, series, featured items, browse by date
├── browse.html     Search and faceted browse; a series page with ?type=<slug>
├── item.html       Item record (?id=<item-id>): viewer, metadata, citation
├── about.html      Historical note, legacy of ACIS, scope, arrangement, access
├── ask.html        Ask the Archive (AI discovery)
├── contact.html    Contact
├── css/style.css   All styles (Stanford identity palette and type)
├── images/logo.png
└── js/
    ├── data.js     Collection data: series (ACIS_COLLECTIONS) and items (RAW_ITEMS)
    ├── ui.js       Shared helpers: thumbnails, result rows/cards, citations
    ├── main.js     Mobile navigation
    ├── config.js   Site settings (AI discovery and contact endpoints)
    ├── contact.js  Contact form
    ├── home.js     Homepage sections
    ├── browse.js   Search, facets, sort, list/gallery view, pagination
    ├── item.js     Item page rendering
    ├── about.js    Series table on the About page
    └── ask.js      Ask the Archive: question → answer with cited sources
```

Browse state (query, facets, sort, view, page) is kept in the URL, so
searches can be bookmarked and shared.

## Deployment (AWS Amplify)

Connect the repository in Amplify Hosting, leave the build command
empty, and set the output directory to the repository root. Any push
to the connected branch redeploys the site.

## Remaining integrations

### 1. AI discovery API (Lambda)

Set the endpoint in `js/config.js`:

```js
window.ACIS_CONFIG = {
  askEndpoint: "https://<lambda-function-url-or-api-gateway-route>",
  askTimeoutMs: 30000,
};
```

With `askEndpoint` empty, Ask the Archive falls back to a local keyword
match over `js/data.js`. Once it's set, every question goes to the
endpoint.

**Request** (`POST`, `Content-Type: application/json`):

```json
{ "question": "What positions did ACIS take on reverse engineering?" }
```

**Response** (`200`, JSON):

```json
{
  "answer": "Plain text. Blank lines separate paragraphs. [1] and [2] refer to sources by position.",
  "sources": [{ "id": "<item id>" }, "<item id>"]
}
```

- `answer` is treated as plain text and escaped before display. `[n]`
  becomes a link to source *n*.
- `sources` are item IDs from `js/data.js` (`id` field, also the
  `item.html?id=` value). Unknown IDs are ignored.
- Return an empty `answer` and empty `sources` when nothing relevant is
  found. The page then shows "No matching records found".
- A non-2xx status, invalid JSON, or no response within `askTimeoutMs`
  shows an "unavailable" message. The page never falls back to made-up
  results.
- If the endpoint is on a different origin from the site, it must answer
  `OPTIONS` preflight requests and return `Access-Control-Allow-Origin`
  for the site's domain (Lambda function URLs can set CORS in their
  configuration).

### Contact form (optional endpoint)

`contact.html` has a feedback form. With `contactEndpoint` empty in
`js/config.js`, submitting opens the visitor's email app addressed to
`contactEmail`, with the message already filled in. To receive messages
directly, set `contactEndpoint` to a Lambda URL that accepts:

```json
{ "name": "...", "email": "...", "affiliation": "...", "topic": "...", "message": "...", "page": "<url>" }
```

Return any 2xx status on success. Anything else shows an error with the
email address as a fallback. The same CORS rules as the AI discovery API
apply.

### 2. PDFs from SDR

Each item's `purl` field (`https://purl.stanford.edu/<druid>`) links
the record to its SDR object.

- **Viewer**: in `js/item.js`, replace the drawn page in `.viewer` with
  SDR's embed:
  `<iframe src="https://embed.stanford.edu/iframe?url=<purl>" …>`.
  SDR chooses the viewer from the object type: document deposits get a
  PDF viewer, and media deposits get a media player that lists PDFs
  only as downloads.
- **Thumbnails**: `thumbMarkup()` in `js/ui.js` can use SDR IIIF image
  URLs (`https://stacks.stanford.edu/image/iiif/<druid>%2F<file>/full/!300,300/0/default.jpg`)
  where available.

### 3. Collection data

`js/data.js` holds sample records. Before launch, replace `RAW_ITEMS`
with the real catalog (title, type, date, dateSort, pages, description,
keywords, and the SDR druid). The series totals shown across the site
come from `officialCount` in `ACIS_COLLECTIONS`: 12 Amicus Briefs,
13 Meeting Notes, 30 Letters, 20 Comments, and 20 Other.

## Accessibility

- Semantic landmarks, a logical heading order, and a skip link on every page
- Visible focus states; keyboard-operable navigation, facets, and viewer controls
- Labelled form fields; filter changes announced with `aria-live`
- Respects `prefers-reduced-motion`; includes print styles
