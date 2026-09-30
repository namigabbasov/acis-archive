# ACIS Digital Archive

The digital archive of the records of the American Committee for Interoperable Systems (ACIS),
1991–2001, published by the [Robert Crown Law Library](https://law.stanford.edu/robert-crown-law-library/)
at Stanford Law School. Ways in:

- **Browse**: the full collection, searchable by keyword and filterable by series, year, and
  decade, in list or gallery view.
- **Item pages**: each record's description, a document viewer, Chicago and Bluebook citations,
  and related items from the same series.
- **Ask the Archive**: ask a question in plain language and get an answer that cites the
  collection's own records.

## Layout

| Folder | What it is | Hosted on |
|---|---|---|
| `frontend/` | Static site, vanilla HTML/CSS/JS | AWS Amplify |
| `backend/` | Ask the Archive API (planned; see [backend/README.md](backend/README.md)) | AWS Lambda, deployed by CodeBuild + SAM |

## Requirements

- Python 3, or any static file server, to preview the frontend locally
- Nothing else until the backend exists

## Local development

### Frontend

```bash
cd frontend
python3 -m http.server 5500      # then open http://localhost:5500
```

`frontend/js/config.js` ships a placeholder instead of a real API endpoint. Locally the
placeholder is left as-is, and Ask the Archive answers with its local keyword fallback over
`js/data.js`. To test against a running backend, serve a scratch copy with the URL filled in
rather than editing the tracked file:

```bash
rm -rf /tmp/acis-serve && cp -R frontend /tmp/acis-serve
sed -i '' "s|__AI_API_URL__|http://localhost:8000|g" /tmp/acis-serve/js/config.js   # macOS sed
cd /tmp/acis-serve && python3 -m http.server 5500
```

### Project structure

```
frontend/
├── index.html      Home: search, series, featured items, browse by date
├── browse.html     Search and faceted browse; a series page with ?type=<slug>
├── item.html       Item record (?id=<item-id>): viewer, metadata, citation
├── about.html      Historical note, legacy of ACIS, scope, arrangement, access
├── ask.html        Ask the Archive
├── contact.html    Contact form
├── package.json    For Amplify's monorepo detection only; no dependencies
├── css/style.css   All styles (Stanford identity palette and type)
├── images/         Logo and favicon
└── js/
    ├── config.js   Site settings: AI API endpoint (injected at deploy), contact form
    ├── data.js     Collection data: series (ACIS_COLLECTIONS) and items (RAW_ITEMS)
    ├── ui.js       Shared helpers: thumbnails, result rows/cards, citations
    ├── main.js     Mobile navigation
    ├── home.js     Homepage sections
    ├── browse.js   Search, facets, sort, list/gallery view, pagination
    ├── item.js     Item page rendering
    ├── about.js    Series table on the About page
    ├── ask.js      Ask the Archive: question → answer with cited sources
    └── contact.js  Contact form
```

Browse state (query, facets, sort, view, page) is kept in the URL, so searches can be bookmarked
and shared.

## API

The backend is not built yet. The frontend currently expects:

```
POST {"question": "..."}
  200 {"answer": "<plain text with [1] [2] references>", "sources": [{"id": "<item id>"}, ...]}
```

- `answer` is escaped before display, and `[n]` becomes a link to source *n*.
- `sources` are item `id`s from `js/data.js` (also the `item.html?id=` value). Unknown IDs are
  ignored.
- An empty `answer` with empty `sources` shows "No matching records found".
- A non-2xx status, invalid JSON, or no response within `askTimeoutMs` shows an "unavailable"
  message. The page never falls back to made-up results.

The planned contract aligns this with RCLL-Legal-Database (one `POST` dispatched on `action`,
full `history`, HMAC-signed answers). See [backend/README.md](backend/README.md).

## Configuration

`frontend/js/config.js`:

- `askEndpoint`: the backend URL. Injected at deploy time; never edit the tracked value.
- `askTimeoutMs`: how long Ask the Archive waits for an answer.
- `contactEndpoint`: optional URL the Contact form POSTs to as JSON
  (`{name, email, affiliation, topic, message, page}`; any 2xx is success). Empty opens the
  visitor's email app addressed to `contactEmail` instead.
- `contactEmail`: `digitalprojects@law.stanford.edu`.

## Deploying

The frontend is hosted on AWS Amplify, configured from the root `amplify.yml`
(`appRoot: frontend`). When creating the Amplify app, set its monorepo root to `frontend`. The
build phase does one thing: substitute the API placeholder in `js/config.js` from the Amplify
app's per-branch `AI_API_URL` environment variable. There is no dependency install.

Until the backend exists, an unset `AI_API_URL` is allowed, and Ask the Archive uses its local
fallback. Once the backend is deployed, make the build fail when `AI_API_URL` is missing, as
`amplify.yml` describes.

### Vercel (previews)

The root `vercel.json` also deploys the site on Vercel: it publishes `frontend/` with no install
step and applies the same `AI_API_URL` substitution when that environment variable is set in the
Vercel project. The backend itself is AWS-only (Lambda, SAM, Secrets Manager, DynamoDB), so a
Vercel-hosted frontend calls the AWS backend, and its origin must be in the backend's
`AllowedOrigins`.

## Remaining work

1. **Collection data.** `frontend/js/data.js` holds sample records. Replace `RAW_ITEMS` with the
   real catalog (title, type, date, dateSort, pages, description, keywords, SDR druid). Series
   totals come from `officialCount` in `ACIS_COLLECTIONS`: 12 Amicus Briefs, 13 Meeting Notes,
   30 Letters, 20 Comments, 20 Other.
2. **PDFs from SDR.** Each item's `purl` (`https://purl.stanford.edu/<druid>`) links it to its
   SDR object. In `js/item.js`, replace the drawn page in `.viewer` with SDR's embed
   (`<iframe src="https://embed.stanford.edu/iframe?url=<purl>">`). SDR picks the viewer from
   the object type: document deposits get a PDF viewer, and media deposits list PDFs only as
   downloads. `thumbMarkup()` in `js/ui.js` can use SDR IIIF images
   (`https://stacks.stanford.edu/image/iiif/<druid>%2F<file>/full/!300,300/0/default.jpg`)
   where available.
3. **Backend.** See [backend/README.md](backend/README.md).

## Accessibility

- Semantic landmarks, a logical heading order, and a skip link on every page
- Visible focus states; keyboard-operable navigation, facets, and viewer controls
- Labelled form fields; result counts and answers announced with `aria-live`
- Respects `prefers-reduced-motion`; includes print styles

## Contact

Digital projects: digitalprojects@law.stanford.edu
Maintainer: nabbasov@law.stanford.edu
