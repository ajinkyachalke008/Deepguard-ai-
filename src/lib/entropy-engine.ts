/**
 * DeepGuard AI — Entropy Analysis Engine
 * ========================================
 * Provides real Shannon Entropy computation, hex dump generation,
 * and automatic anomaly detection from raw file binary data.
 *
 * All heavy computation is offloaded to a dynamically-instantiated
 * Web Worker via Blob URLs so the React UI thread stays responsive.
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EntropyAnomaly {
  offset: number;
  length: number;
  type: 'appended' | 'polyglot' | 'encrypted' | 'steganography' | 'eof_data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface HexRow {
  offset: string;      // e.g. "0000A3F0"
  hex: string;         // e.g. "4F 6E 20 74 ..."
  ascii: string;       // e.g. "On t..."
  offsetNum: number;   // numeric offset for anomaly matching
}

export interface EntropyResult {
  /** Per-block entropy values (0.0 – 1.0 normalized) */
  entropyData: number[];
  /** Average entropy across all blocks */
  averageEntropy: number;
  /** Maximum entropy value */
  maxEntropy: number;
  /** Minimum entropy value */
  minEntropy: number;
  /** Auto-detected anomalies */
  anomalies: EntropyAnomaly[];
  /** Block size used for computation */
  blockSize: number;
  /** Total blocks computed */
  totalBlocks: number;
  /** Global byte frequency table (256 entries) */
  byteFrequencies: number[];
  /** Byte category counts */
  categories: {
    nulls: number;
    control: number;
    printable: number;
    extended: number;
  };
  /** Extracted ASCII strings */
  strings: Array<{
    text: string;
    offset: number;
  }>;
}

export interface EntropyWorkerMessage {
  type: 'progress' | 'result';
  progress?: number;
  result?: EntropyResult;
}

// ---------------------------------------------------------------------------
// Magic Byte Signatures (for polyglot / hidden-payload detection)
// ---------------------------------------------------------------------------

const MAGIC_SIGNATURES: { bytes: number[]; name: string; offset?: number }[] = [
  { bytes: [0x50, 0x4B, 0x03, 0x04], name: 'ZIP Archive' },
  { bytes: [0x50, 0x4B, 0x05, 0x06], name: 'ZIP Archive (empty)' },
  { bytes: [0x52, 0x61, 0x72, 0x21], name: 'RAR Archive' },
  { bytes: [0x1F, 0x8B], name: 'GZIP Archive' },
  { bytes: [0x42, 0x5A, 0x68], name: 'BZIP2 Archive' },
  { bytes: [0x37, 0x7A, 0xBC, 0xAF], name: '7-Zip Archive' },
  { bytes: [0x89, 0x50, 0x4E, 0x47], name: 'PNG Image' },
  { bytes: [0xFF, 0xD8, 0xFF], name: 'JPEG Image' },
  { bytes: [0x47, 0x49, 0x46, 0x38], name: 'GIF Image' },
  { bytes: [0x25, 0x50, 0x44, 0x46], name: 'PDF Document' },
  { bytes: [0x4D, 0x5A], name: 'PE Executable (Windows)' },
  { bytes: [0x7F, 0x45, 0x4C, 0x46], name: 'ELF Executable (Linux)' },
  { bytes: [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], name: 'MP4 Video' },
  { bytes: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], name: 'MP4 Video' },
  { bytes: [0x1A, 0x45, 0xDF, 0xA3], name: 'WebM/MKV Video' },
];

// ---------------------------------------------------------------------------
// Web Worker Source (runs in a separate thread)
// ---------------------------------------------------------------------------

const WORKER_SOURCE = `
  // Shannon Entropy for a Uint8Array block
  function shannonEntropy(data) {
    const freq = new Uint32Array(256);
    for (let i = 0; i < data.length; i++) {
      freq[data[i]]++;
    }
    let entropy = 0;
    const len = data.length;
    for (let i = 0; i < 256; i++) {
      if (freq[i] > 0) {
        const p = freq[i] / len;
        entropy -= p * Math.log2(p);
      }
    }
    // Normalize to 0-1 (max Shannon entropy for bytes = 8 bits)
    return entropy / 8;
  }

  self.onmessage = function(e) {
    const { buffer, blockSize } = e.data;
    const data = new Uint8Array(buffer);
    const totalBlocks = Math.ceil(data.length / blockSize);
    const entropyData = new Float64Array(totalBlocks);

    let maxEntropy = 0;
    let minEntropy = 1;
    let sum = 0;
    const byteFreq = new Uint32Array(256);
    const cats = { nulls: 0, control: 0, printable: 0, extended: 0 };
    const extractedStrings = [];
    let currentString = "";
    let startOffset = 0;

    for (let i = 0; i < totalBlocks; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, data.length);
      const block = data.slice(start, end);
      
      // Update global frequency and categories
      for (let j = 0; j < block.length; j++) {
        const b = block[j];
        const offset = start + j;
        byteFreq[b]++;
        
        if (b === 0) cats.nulls++;
        else if (b < 32 || b === 127) cats.control++;
        else if (b >= 32 && b <= 126) {
          cats.printable++;
          // String extraction logic
          if (currentString === "") startOffset = offset;
          currentString += String.fromCharCode(b);
        } else {
          cats.extended++;
          // End current string check
          if (currentString.length >= 4) {
            extractedStrings.push({ text: currentString, offset: startOffset });
          }
          currentString = "";
        }
      }

      const ent = shannonEntropy(block);
      entropyData[i] = ent;
      sum += ent;
      if (ent > maxEntropy) maxEntropy = ent;
      if (ent < minEntropy) minEntropy = ent;

      // Report progress every 50 blocks
      if (i % 50 === 0) {
        self.postMessage({
          type: 'progress',
          progress: Math.round((i / totalBlocks) * 100)
        });
      }
    }

    // Final string check
    if (currentString.length >= 4) {
      extractedStrings.push({ text: currentString, offset: startOffset });
    }

    self.postMessage({
      type: 'result',
      result: {
        entropyData: Array.from(entropyData),
        averageEntropy: sum / totalBlocks,
        maxEntropy,
        minEntropy,
        totalBlocks,
        blockSize,
        byteFrequencies: Array.from(byteFreq),
        categories: cats,
        strings: extractedStrings.slice(0, 500) // Limit to 500 strings
      }
    });
  };
`;

// ---------------------------------------------------------------------------
// Hex Dump Generator (virtualized — generates only requested rows)
// ---------------------------------------------------------------------------

/**
 * Generate hex dump rows from a real ArrayBuffer.
 * Only generates the requested slice for virtualized rendering.
 *
 * @param buffer  - The full file ArrayBuffer
 * @param startRow - First row index (0-indexed, each row = 16 bytes)
 * @param rowCount - Number of rows to generate
 * @returns Array of HexRow objects
 */
export function generateHexRows(
  buffer: ArrayBuffer,
  startRow: number,
  rowCount: number
): HexRow[] {
  const data = new Uint8Array(buffer);
  const rows: HexRow[] = [];
  const maxRows = Math.ceil(data.length / 16);

  for (let r = startRow; r < Math.min(startRow + rowCount, maxRows); r++) {
    const byteOffset = r * 16;
    const offsetStr = byteOffset.toString(16).padStart(8, '0').toUpperCase();

    let hexParts: string[] = [];
    let asciiParts: string[] = [];

    for (let col = 0; col < 16; col++) {
      const idx = byteOffset + col;
      if (idx < data.length) {
        const byte = data[idx];
        hexParts.push(byte.toString(16).padStart(2, '0').toUpperCase());
        // Printable ASCII range: 0x20 (space) to 0x7E (~)
        asciiParts.push(byte >= 0x20 && byte <= 0x7E ? String.fromCharCode(byte) : '.');
      } else {
        hexParts.push('  ');
        asciiParts.push(' ');
      }
    }

    rows.push({
      offset: offsetStr,
      hex: hexParts.join(' '),
      ascii: asciiParts.join(''),
      offsetNum: byteOffset,
    });
  }

  return rows;
}

/**
 * Get the total number of hex rows for a given buffer size.
 */
export function getTotalHexRows(bufferSize: number): number {
  return Math.ceil(bufferSize / 16);
}

// ---------------------------------------------------------------------------
// Anomaly Detection (scans entropy + magic bytes)
// ---------------------------------------------------------------------------

function detectAnomalies(
  buffer: ArrayBuffer,
  entropyData: number[],
  blockSize: number
): EntropyAnomaly[] {
  const data = new Uint8Array(buffer);
  const anomalies: EntropyAnomaly[] = [];

  // 1. Scan for high-entropy blocks (> 0.98) — likely encrypted/compressed
  let highEntropyStart = -1;
  for (let i = 0; i < entropyData.length; i++) {
    if (entropyData[i] > 0.98) {
      if (highEntropyStart === -1) highEntropyStart = i;
    } else {
      if (highEntropyStart !== -1) {
        const length = (i - highEntropyStart) * blockSize;
        if (length >= blockSize * 2) { // At least 2 blocks
          anomalies.push({
            offset: highEntropyStart * blockSize,
            length,
            type: 'encrypted',
            severity: length > blockSize * 10 ? 'high' : 'medium',
            description: `High-entropy block (${(entropyData[highEntropyStart] * 100).toFixed(1)}%) spanning ${length} bytes. Suggests encrypted, compressed, or randomized data.`,
          });
        }
        highEntropyStart = -1;
      }
    }
  }
  // Flush trailing high-entropy
  if (highEntropyStart !== -1) {
    const length = (entropyData.length - highEntropyStart) * blockSize;
    if (length >= blockSize * 2) {
      anomalies.push({
        offset: highEntropyStart * blockSize,
        length,
        type: 'encrypted',
        severity: 'high',
        description: `High-entropy block at end of file spanning ${length} bytes. May indicate appended encrypted payload.`,
      });
    }
  }

  // 2. Scan for sudden low-entropy blocks (< 0.05) — likely null padding / EOF data
  for (let i = 1; i < entropyData.length; i++) {
    if (entropyData[i] < 0.05 && entropyData[i - 1] > 0.3) {
      const length = blockSize;
      anomalies.push({
        offset: i * blockSize,
        length,
        type: 'eof_data',
        severity: 'low',
        description: `Sudden entropy drop to near-zero at offset 0x${(i * blockSize).toString(16).toUpperCase()}. Indicates null padding or EOF marker region.`,
      });
    }
  }

  // 3. Scan for embedded magic byte signatures (polyglot detection)
  //    Skip the first match (that's the file's own header)
  const fileHeaderSig = identifyMagicSignature(data, 0);
  const scanStep = 512; // Check every 512 bytes for speed
  for (let offset = scanStep; offset < data.length - 8; offset += scanStep) {
    const sig = identifyMagicSignature(data, offset);
    if (sig && sig !== fileHeaderSig) {
      anomalies.push({
        offset,
        length: 128,
        type: 'polyglot',
        severity: 'critical',
        description: `Embedded ${sig} signature detected at offset 0x${offset.toString(16).toUpperCase()}. This file may be a polyglot containing a hidden ${sig} payload.`,
      });
    }
  }

  // 4. LSB steganography heuristic — check if low bits have anomalous patterns
  //    Compare the entropy of only the LSBs vs expected uniform distribution
  if (data.length >= 1024) {
    const sampleSize = Math.min(data.length, 65536);
    const lsbBytes = new Uint8Array(sampleSize);
    for (let i = 0; i < sampleSize; i++) {
      // Pack 8 LSBs into one byte
      if (i * 8 + 7 < data.length) {
        let packed = 0;
        for (let b = 0; b < 8; b++) {
          packed |= (data[i * 8 + b] & 1) << b;
        }
        lsbBytes[i] = packed;
      }
    }
    const lsbEntropy = shannonEntropySync(lsbBytes.slice(0, Math.floor(sampleSize / 8)));
    // Natural images typically have LSB entropy ~0.97-1.0 (near random)
    // Steganography can create either slightly lower or structured patterns
    if (lsbEntropy < 0.85) {
      anomalies.push({
        offset: 0,
        length: sampleSize,
        type: 'steganography',
        severity: 'medium',
        description: `LSB entropy is ${(lsbEntropy * 100).toFixed(1)}% (expected ~97%+). Patterned least-significant bits may indicate steganographic embedding.`,
      });
    }
  }

  return anomalies;
}

/**
 * Identify a magic byte signature at a given offset.
 */
function identifyMagicSignature(data: Uint8Array, offset: number): string | null {
  for (const sig of MAGIC_SIGNATURES) {
    const checkOffset = offset + (sig.offset || 0);
    if (checkOffset + sig.bytes.length > data.length) continue;
    let match = true;
    for (let j = 0; j < sig.bytes.length; j++) {
      if (data[checkOffset + j] !== sig.bytes[j]) {
        match = false;
        break;
      }
    }
    if (match) return sig.name;
  }
  return null;
}

/**
 * Synchronous Shannon Entropy (used for small data samples like LSB checks).
 */
export function shannonEntropySync(data: Uint8Array): number {
  const freq = new Uint32Array(256);
  for (let i = 0; i < data.length; i++) {
    freq[data[i]]++;
  }
  let entropy = 0;
  const len = data.length;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / len;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy / 8; // Normalize to 0-1
}

/**
 * Perform a quick entropy scan on a sample of the file to determine binary 'randomness'.
 * High entropy (>0.9) in media files often suggests encryption or GAN-induced noise patterns.
 */
export async function getQuickEntropy(file: File): Promise<number> {
  try {
    // Sample the middle 64KB - usually where data is most dense
    const start = Math.floor(file.size / 2);
    const end = Math.min(start + 65536, file.size);
    const blob = file.slice(start, end);
    const buffer = await blob.arrayBuffer();
    return shannonEntropySync(new Uint8Array(buffer));
  } catch {
    return 0.5;
  }
}

// ---------------------------------------------------------------------------
// Public API: Run full entropy analysis on a File
// ---------------------------------------------------------------------------

/**
 * Perform a complete entropy analysis on a File object.
 *
 * - Reads the file into an ArrayBuffer
 * - Spins up a Web Worker for Shannon Entropy computation
 * - Runs anomaly detection on the results
 *
 * @param file      - The File object to analyze
 * @param blockSize - Bytes per entropy window (default: 1024)
 * @param onProgress - Optional progress callback (0-100)
 * @returns Promise<EntropyResult> with entropy data + anomalies
 */
export async function analyzeFileEntropy(
  file: File,
  blockSize: number = 1024,
  onProgress?: (percent: number) => void
): Promise<{ entropyResult: EntropyResult; buffer: ArrayBuffer }> {
  // Cap analysis to first 50MB to prevent browser OOM
  const maxBytes = 50 * 1024 * 1024;
  const sliceEnd = Math.min(file.size, maxBytes);
  const blob = file.slice(0, sliceEnd);

  const buffer = await blob.arrayBuffer();

  return new Promise((resolve, reject) => {
    // Create Web Worker from inline source
    const workerBlob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e: MessageEvent<EntropyWorkerMessage>) => {
      if (e.data.type === 'progress') {
        onProgress?.(e.data.progress || 0);
      } else if (e.data.type === 'result' && e.data.result) {
        // Run anomaly detection on the main thread (it's fast after entropy is done)
        const anomalies = detectAnomalies(buffer, e.data.result.entropyData, blockSize);

        const fullResult: EntropyResult = {
          ...e.data.result,
          anomalies,
        };

        // Cleanup
        worker.terminate();
        URL.revokeObjectURL(workerUrl);

        resolve({ entropyResult: fullResult, buffer });
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      reject(new Error(`Entropy worker failed: ${err.message}`));
    };

    // Transfer the buffer to the worker (zero-copy)
    // Note: We need to make a copy because we also use buffer for hex dump
    const bufferCopy = buffer.slice(0);
    worker.postMessage({ buffer: bufferCopy, blockSize }, [bufferCopy]);
  });
}
