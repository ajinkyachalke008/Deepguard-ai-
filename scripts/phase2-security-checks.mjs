import { execSync } from 'node:child_process';
import fs from 'node:fs';

const BASE_URL = process.env.PHASE2_BASE_URL || 'http://localhost:3000';
const ANALYST_KEY = process.env.DEEPGUARD_ANALYST_API_KEY || '';

function run(cmd) {
  try {
    return { ok: true, out: execSync(cmd, { encoding: 'utf8' }) };
  } catch (error) {
    return { ok: false, out: error.stdout?.toString() || error.message };
  }
}

const report = [];
report.push(`# Phase 2 Security Check Output`);
report.push(`Generated: ${new Date().toISOString()}`);
report.push(`Base URL: ${BASE_URL}`);
report.push('');

const headerRoutes = ['/', '/analyze', '/report', '/api/analyze'];
report.push('## Header checks');
for (const route of headerRoutes) {
  const cmd = `curl -s -D - -o /dev/null ${BASE_URL}${route}`;
  const res = run(cmd);
  report.push(`### ${route}`);
  report.push('```');
  report.push(res.out.trim());
  report.push('```');
}

report.push('\n## Auth checks');
const missingPatch = run(`curl -s -o /dev/null -w "%{http_code}" -X PATCH ${BASE_URL}/api/analyze/test-id -H "content-type: application/json" -d '{}'`);
report.push(`PATCH missing key status: ${missingPatch.out.trim()}`);
const missingAi = run(`curl -s -o /dev/null -w "%{http_code}" -X POST ${BASE_URL}/api/analyze/ai -H "content-type: application/json" -d '{}'`);
report.push(`AI POST missing key status: ${missingAi.out.trim()}`);

if (ANALYST_KEY) {
  const withPatch = run(`curl -s -o /dev/null -w "%{http_code}" -X PATCH ${BASE_URL}/api/analyze/test-id -H "x-deepguard-analyst-key: ${ANALYST_KEY}" -H "content-type: application/json" -d '{"status":"processing"}'`);
  report.push(`PATCH with key status: ${withPatch.out.trim()}`);
  const withAi = run(`curl -s -o /dev/null -w "%{http_code}" -X POST ${BASE_URL}/api/analyze/ai -H "x-deepguard-analyst-key: ${ANALYST_KEY}" -H "content-type: application/json" -d '{"base64Image":"abcd","fileType":"image/jpeg"}'`);
  report.push(`AI POST with key status: ${withAi.out.trim()}`);
} else {
  report.push('No DEEPGUARD_ANALYST_API_KEY set; with-key auth checks skipped.');
}

report.push('\n## Rate limit checks');
const burstCodes = [];
for (let i = 0; i < 30; i++) {
  const r = run(`curl -s -o /dev/null -w "%{http_code}" -X POST ${BASE_URL}/api/analyze -H "content-type: application/json" -d '{"fileName":"x.jpg","fileSize":1024,"fileType":"image/jpeg"}'`);
  burstCodes.push(r.out.trim());
}
report.push(`Burst status codes (POST /api/analyze): ${burstCodes.join(',')}`);
report.push(`Contains 429: ${burstCodes.includes('429')}`);

const outPath = 'docs/review/phase2-security-check-output.md';
fs.writeFileSync(outPath, report.join('\n') + '\n');
console.log(`Wrote ${outPath}`);

