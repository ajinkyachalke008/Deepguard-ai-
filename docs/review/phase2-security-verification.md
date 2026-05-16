# Phase 2 — Security Verification & Hardening Closure

Last updated: 2026-05-16

## Scope

Phase 2 closes operational security verification for:

- CSP / security headers validation (P0-2 verification),
- auth guard and rate-limit path verification (P0-4 verification),
- evidence capture for reviewer sign-off.

## Implementation updates in this phase

- CSP mode is now environment-driven via `DEEPGUARD_CSP_MODE`:
  - `enforce` (default): sends `Content-Security-Policy`
  - `report-only`: sends `Content-Security-Policy-Report-Only`
- Middleware now emits `X-Request-ID` on responses.
- Rate-limit responses now emit `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining`.

---

## A) CSP / Security Header Verification

## Target routes

- `/`
- `/analyze`
- `/report`
- `/api/analyze`

## Required headers

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

## Verification commands (run in deployed or local server environment)

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/analyze
curl -I http://localhost:3000/report
curl -I http://localhost:3000/api/analyze
```

### Automated capture command

```bash
PHASE2_BASE_URL=http://localhost:3000 npm run test:phase2-security
```

This writes machine-collected evidence to:

- `docs/review/phase2-security-check-output.md`

## Evidence table

| Route | CSP present | Other headers present | Notes | Status |
|---|---|---|---|---|
| `/` | pending | pending | TODO capture output | open |
| `/analyze` | pending | pending | TODO capture output | open |
| `/report` | pending | pending | TODO capture output | open |
| `/api/analyze` | pending | pending | TODO capture output | open |

---

## B) Auth Guard Verification

Protected paths (analyst key required when `DEEPGUARD_ANALYST_API_KEY` is set):

- `PATCH /api/analyze/[id]`
- `POST /api/analyze/ai`

## Verification commands

```bash
# Missing analyst key (expect 401)
curl -i -X PATCH http://localhost:3000/api/analyze/test-id -H "content-type: application/json" -d '{}'
curl -i -X POST http://localhost:3000/api/analyze/ai -H "content-type: application/json" -d '{}'

# Valid analyst key (expect non-401; may be 400/404 depending payload/id)
curl -i -X PATCH http://localhost:3000/api/analyze/test-id -H "x-deepguard-analyst-key: $DEEPGUARD_ANALYST_API_KEY" -H "content-type: application/json" -d '{"status":"processing"}'
curl -i -X POST http://localhost:3000/api/analyze/ai -H "x-deepguard-analyst-key: $DEEPGUARD_ANALYST_API_KEY" -H "content-type: application/json" -d '{"base64Image":"abcd","fileType":"image/jpeg"}'
```

## Evidence table

| Route | Missing key status | With key status | Expected met? | Status |
|---|---|---|---|---|
| `PATCH /api/analyze/[id]` | pending | pending | pending | open |
| `POST /api/analyze/ai` | pending | pending | pending | open |

---

## C) Rate-Limit Verification

Rate-limited paths:

- `POST /api/analyze`
- `PATCH /api/analyze/[id]`
- `POST /api/analyze/ai`
- `POST /api/c2pa`

## Burst test pattern

```bash
for i in {1..40}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/analyze \
    -H "content-type: application/json" \
    -d '{"fileName":"x.jpg","fileSize":1024,"fileType":"image/jpeg"}'
done
```

Expected: first requests accepted/validated, then `429` appears after threshold.

## Evidence table

| Route | Burst threshold observed | 429 observed | Notes | Status |
|---|---|---|---|---|
| `POST /api/analyze` | pending | pending | TODO | open |
| `PATCH /api/analyze/[id]` | pending | pending | TODO | open |
| `POST /api/analyze/ai` | pending | pending | TODO | open |
| `POST /api/c2pa` | pending | pending | TODO | open |

---

## D) Phase 2 Sign-Off Criteria

- All header checks captured with command output evidence.
- Auth checks confirm 401 on missing key and non-401 on valid key.
- Rate-limit checks confirm 429 behavior on burst traffic.
- All tables updated from `open` -> `fixed` or `needs-follow-up`.
- Latest automated output is attached from `docs/review/phase2-security-check-output.md`.
