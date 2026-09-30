# Ask the Archive backend (planned)

Not built yet. This document fixes the design so the backend can follow the same structure and
deployment path as RCLL-Legal-Database, which is maintained alongside this repository.

## Approach: retrieval-augmented generation, in two phases

The answers need to come from two kinds of material:

| Material | Size | How the model sees it |
|---|---|---|
| Catalog records: title, date, series, description, subjects | ~95 short records | The whole catalog goes into the system prompt, as RCLL does with its database catalog |
| Full text of the documents (OCR from the SDR PDFs) | Likely thousands of pages | Retrieval: only the passages relevant to the question are sent |

**Phase 1: catalog in the prompt.** Works as soon as the real catalog exists, before any PDFs.
The model recommends which records to consult and cites them by `id`.

**Phase 2: RAG over the full text.** Once the PDFs are in SDR and their text is extracted, index
it in page-level chunks. For each question, retrieve the top passages and answer from them, citing
the item and page. At this collection's size, the embeddings index is small enough to ship inside
the Lambda image (loaded at startup), so no separate vector database is needed. Revisit that only
if the corpus grows by an order of magnitude.

## Planned layout (mirrors RCLL-Legal-Database)

```
backend/
├── api/
│   ├── main.py         FastAPI: POST (dispatched on action), GET /healthz, CORS, CSRF checks
│   ├── bootstrap.py    Loads secrets from Secrets Manager (AWS) or .env (local)
│   ├── settings.py     Non-secret config from environment variables
│   ├── tokens.py       HMAC signing of answers
│   ├── ratelimit.py    Per-session, per-IP, and daily caps (DynamoDB)
│   └── obs.py          Structured logs: metadata only, never question text
├── core/
│   ├── catalog.py      Loads data/ and builds the system prompt once at import
│   ├── retrieval.py    Phase 2: chunk search over the full-text index
│   └── answerer.py     Model call; returns answer text plus cited source ids
├── data/               catalog.json (from the frontend data) and, in phase 2, the index
├── prompts/system_prompt.md
├── tests/
├── Dockerfile          python:3.12-slim + Lambda Web Adapter; uvicorn serves FastAPI
├── template.yaml       SAM: Function URL, DynamoDB rate table, bounded log group
├── buildspec.yml       CodeBuild: sam build + sam deploy from environment variables
├── deploy.sh           ./deploy.sh dev, then ./deploy.sh prod ships the same upload
├── requirements.txt
└── samconfig.toml.example
```

## Planned API contract

Aligned with RCLL-Legal-Database, plus the `sources` list this site needs:

```
POST {"action":"answer","sessionId":"<uuid>","history":[{"role","content","sig?"}]}
  200 {"answer":"<text with [1] [2]>","sources":[{"id":"<item id>","page":<n>?}],"sig":"<hmac>"}
  429 {"error","limit":"minute"|"hour"}

GET /healthz
  200 {"ok":true}
```

`frontend/js/ask.js` currently sends `{question}` and reads `{answer, sources}`. Update it to this
contract when the backend is built.

## Security and privacy (as in RCLL-Legal-Database)

- Secrets (model API key, HMAC secret) live in AWS Secrets Manager. None are in this repository,
  and the browser never sees an API key.
- CORS allows only the exact Amplify origin(s), never `*`.
- CloudWatch logs carry metadata only: identifiers, token counts, and a hash of the question,
  never the question text.

## Decisions needed before building

1. **Model provider**: RCLL uses OpenAI in production. Use the same account and key, or a
   different provider?
2. **Full text**: will the library supply OCR text with the SDR deposits, or should the backend
   pipeline extract it from the PDFs?
3. **Question logging**: RCLL writes full questions and answers to a Google Sheet for librarian
   review. Does ACIS want the same?
