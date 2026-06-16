/**
 * DeepGuard AI — Demo Scanning Phase Definitions
 * =================================================
 * 7 realistic forensic scanning phases for the demo simulation.
 * Used by the analyze page when demo mode is active.
 */

export interface DemoScanPhase {
  name: string;
  icon: string;
  durationMs: number;  // how long this phase takes
  startSec: number;    // when it starts (for progress bar)
  endSec: number;      // when it ends
}

export const DEMO_SCAN_PHASES: DemoScanPhase[] = [
  {
    name: 'Initializing Neural Forensics',
    icon: '⚡',
    durationMs: 2000,
    startSec: 0,
    endSec: 2,
  },
  {
    name: 'Loading Detection Engines',
    icon: '🧠',
    durationMs: 2000,
    startSec: 2,
    endSec: 4,
  },
  {
    name: 'Analyzing Visual Artifacts',
    icon: '🔍',
    durationMs: 2000,
    startSec: 4,
    endSec: 6,
  },
  {
    name: 'Running Spectral Analysis',
    icon: '📊',
    durationMs: 2000,
    startSec: 6,
    endSec: 8,
  },
  {
    name: 'Checking Metadata Integrity',
    icon: '📋',
    durationMs: 2000,
    startSec: 8,
    endSec: 10,
  },
  {
    name: 'Generating Explainability Report',
    icon: '📝',
    durationMs: 2000,
    startSec: 10,
    endSec: 12,
  },
  {
    name: 'Finalizing Verdict',
    icon: '🛡️',
    durationMs: 3000,
    startSec: 12,
    endSec: 15,
  },
];

export const DEMO_TOTAL_DURATION_MS = 15000;
