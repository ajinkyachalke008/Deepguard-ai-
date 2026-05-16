# Phase 2 Security Check Output
Generated: 2026-05-16T18:37:08.584Z
Base URL: http://localhost:3000

## Header checks
### /
```
Command failed: curl -s -D - -o /dev/null http://localhost:3000/
```
### /analyze
```
Command failed: curl -s -D - -o /dev/null http://localhost:3000/analyze
```
### /report
```
Command failed: curl -s -D - -o /dev/null http://localhost:3000/report
```
### /api/analyze
```
Command failed: curl -s -D - -o /dev/null http://localhost:3000/api/analyze
```

## Auth checks
PATCH missing key status: 000
AI POST missing key status: 000
No DEEPGUARD_ANALYST_API_KEY set; with-key auth checks skipped.

## Rate limit checks
Burst status codes (POST /api/analyze): 000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000
Contains 429: false
