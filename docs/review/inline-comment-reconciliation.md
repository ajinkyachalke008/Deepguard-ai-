# Inline Comment Reconciliation — Phase 1 (Exact Mapping)

Last updated: 2026-05-16

## Purpose

Phase 1 requires moving from inferred/reconstructed comments to an **exact reviewer-comment ledger**:

- exact inline comment text,
- exact file/line reference,
- exact fix commit(s),
- verification command and result,
- final status.

---

## Source of Truth

Populate from GitHub PR review inline comments (do not paraphrase):

1. Open each affected PR in the P0 chain.
2. Copy each inline comment body exactly.
3. Record the path and line anchor exactly as shown in GitHub.

---

## Exact Reconciliation Matrix

| ID | PR / Review URL | Exact Inline Comment Text | File:Line | Root Cause | Fix Commit(s) | Verification Command | Verification Result | Status |
|---|---|---|---|---|---|---|---|---|
| IC-01 | Pending reviewer URL | **SOURCE REQUIRED** | `src/app/layout.tsx` | Missing exact inline text in local git context | `1d5815f` | `git show 1d5815f -- src/app/layout.tsx` | pending | `needs-source` |
| IC-02 | Pending reviewer URL | **SOURCE REQUIRED** | `src/middleware.ts` | Missing exact inline text in local git context | `1d0a6e0` | `git show 1d0a6e0 -- src/middleware.ts` | pending | `needs-source` |
| IC-03 | Pending reviewer URL | **SOURCE REQUIRED** | `src/lib/api-validation.ts` | Missing exact inline text in local git context | `2125385` | `git show 2125385 -- src/lib/api-validation.ts` | pending | `needs-source` |
| IC-04 | Pending reviewer URL | **SOURCE REQUIRED** | `src/app/api/analyze/[id]/route.ts` | Missing exact inline text in local git context | `d00286c` | `git show d00286c -- src/app/api/analyze/[id]/route.ts` | pending | `needs-source` |
| IC-05 | Pending reviewer URL | **SOURCE REQUIRED** | `src/lib/api-security.ts` | Missing exact inline text in local git context | `1d5815f,d00286c` | `git log --oneline -- src/lib/api-security.ts` | pending | `needs-source` |
| IC-06 | Pending reviewer URL | **SOURCE REQUIRED** | `src/lib/api-security.ts` | Missing exact inline text in local git context | `d00286c` | `git show d00286c -- src/lib/api-security.ts` | pending | `needs-source` |
| IC-07 | Pending reviewer URL | **SOURCE REQUIRED** | `src/lib/gan-engine.ts` | Missing exact inline text in local git context | `d00286c` | `git show d00286c -- src/lib/gan-engine.ts` | pending | `needs-source` |
| IC-08 | Pending reviewer URL | **SOURCE REQUIRED** | `src/app/api/analyze/ai/route.ts` | Missing exact inline text in local git context | `ee54b34` | `git show ee54b34 -- src/app/api/analyze/ai/route.ts` | pending | `needs-source` |
| IC-09 | Pending reviewer URL | **SOURCE REQUIRED** | `src/lib/pdf-export.ts` | Missing exact inline text in local git context | `1d5815f` | `git show 1d5815f -- src/lib/pdf-export.ts` | pending | `needs-source` |
| IC-10 | Pending reviewer URL | **SOURCE REQUIRED** | `scripts/api-integration-tests.mjs` | Missing exact inline text in local git context | `2125385` | `git show 2125385 -- scripts/api-integration-tests.mjs` | pending | `needs-source` |
| IC-11 | Pending reviewer URL | **SOURCE REQUIRED** | `src/app/api/c2pa/route.ts` | Missing exact inline text in local git context | `d00286c` | `git show d00286c -- src/app/api/c2pa/route.ts` | pending | `needs-source` |
| IC-12 | Pending reviewer URL | **SOURCE REQUIRED** | `src/lib/audio-forensic-engine.ts` | Missing exact inline text in local git context | `ee54b34` | `git show ee54b34 -- src/lib/audio-forensic-engine.ts` | pending | `needs-source` |

> Add IC-13+ for any additional comments found.

---

## Fast Fill Procedure (operator checklist)

- [ ] Export inline comments from GitHub (copy/paste exact text).
- [ ] Fill `PR / Review URL`, `Exact Inline Comment Text`, and `File:Line`.
- [ ] Link each item to one or more concrete fix commits.
- [ ] Run verification commands and capture actual result text.
- [ ] Change status from `open` -> `fixed` or `needs-follow-up`.

### Automated helper (optional)

Use this command to generate a pull-review skeleton from local commit history when GitHub inline text is not yet pasted:

```bash
node scripts/review-reconciliation-helper.mjs
```

---

## Current Phase 1 State

- Template is implemented.
- Commit linkage is pre-filled.
- Exact reviewer inline text/URL is still required to finalize.

## Minimum Acceptance for Phase 1 Completion

- 100% of inline comments are represented by one IC row.
- 0 rows contain paraphrased comment text.
- 0 `open` / `needs-source` rows remain.
- Every `fixed` row has at least one reproducible verification command.
