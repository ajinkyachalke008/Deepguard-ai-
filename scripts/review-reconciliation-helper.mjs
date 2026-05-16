import { execSync } from 'node:child_process';

const targets = [
  'src/app/layout.tsx',
  'src/middleware.ts',
  'src/lib/api-validation.ts',
  'src/app/api/analyze/[id]/route.ts',
  'src/lib/api-security.ts',
  'src/lib/gan-engine.ts',
  'src/app/api/analyze/ai/route.ts',
  'src/lib/pdf-export.ts',
  'scripts/api-integration-tests.mjs',
  'src/app/api/c2pa/route.ts',
  'src/lib/audio-forensic-engine.ts',
];

console.log('# Reconciliation Helper Output\n');
for (const file of targets) {
  let log = '';
  try {
    log = execSync(`git log --oneline -- ${file}`, { encoding: 'utf8' }).trim();
  } catch {
    log = '(no history)';
  }
  const top = log.split('\n')[0] || '(no commit)';
  console.log(`- ${file}: ${top}`);
}

console.log('\nPaste exact GitHub inline comments and URLs into docs/review/inline-comment-reconciliation.md to complete Phase 1.');
