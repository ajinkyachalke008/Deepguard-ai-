/**
 * DeepGuard AI — Temporal Consistency Analysis Engine
 * =====================================================
 * Analyzes video frame-by-frame to detect temporal anomalies,
 * motion inconsistencies, and unnatural transitions that indicate
 * deepfake manipulation.
 *
 * All heavy computation runs in a Web Worker to maintain UI responsiveness.
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TemporalFrameData {
  frameNumber: number;
  timestamp: number;
  mse: number;              // Raw mean squared error vs previous frame
  normalizedScore: number;  // 0-100 normalized instability
  ssim?: number;           // Optional structural similarity (0-1, higher = more similar)
  isAnomaly: boolean;      // flagged as outlier
}

export interface TemporalAnomalyRegion {
  startFrame: number;
  endFrame: number;
  maxScore: number;
  avgScore: number;
  duration: number; // seconds
  explanation: string;
}

export interface TemporalAnalysisResult {
  overallScore: number;          // 0-100 temporal consistency (higher = more consistent)
  isConsistent: boolean;         // true if score > threshold
  averageInstability: number;    // avg raw MSE across frames
  perFrame: TemporalFrameData[];
  anomalyRegions: TemporalAnomalyRegion[];
  totalFrames: number;
  sampledFrames: number;
  fps: number;
  duration: number;
  processingTimeMs: number;
}

export interface TemporalAnalysisOptions {
  maxFrames?: number;          // Max frames to sample (default: 60)
  targetWidth?: number;        // Downscale width for analysis (default: 320)
  targetHeight?: number;       // Downscale height (default: 180)
  anomalyThreshold?: number;   // Score threshold to flag anomalies (default: 60)
  enableSSIM?: boolean;        // Compute SSIM (slower, default: false)
  maxFramePairMSE?: number;    // Expected max MSE for normalization cap
  onProgress?: (percent: number) => void; // Progress callback (0-100)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_FRAMES = 60;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 180;
const DEFAULT_ANOMALY_THRESHOLD = 60;

// ---------------------------------------------------------------------------
// Worker Source (embedded)
// ---------------------------------------------------------------------------

/**
 * Web Worker performs frame differential analysis entirely off-main-thread.
 * Receives raw ImageData arrays via transfer list, computes MSE/SSIM,
 * detects outlier regions, and returns a deterministic temporal analysis.
 */
const WORKER_SOURCE = `
  // Helper: Compute luminance-based MSE between two Uint8ClampedArray pixel buffers
  function computeLumaMSE(dataA, dataB, width, height) {
    let sumSq = 0;
    const len = dataA.length;
    for (let i = 0; i < len; i += 4) {
      const lumA = 0.299 * dataA[i] + 0.587 * dataA[i+1] + 0.114 * dataA[i+2];
      const lumB = 0.299 * dataB[i] + 0.587 * dataB[i+1] + 0.114 * dataB[i+2];
      const d = lumA - lumB;
      sumSq += d * d;
    }
    return sumSq / (width * height);
  }

  // Helper: Compute SSIM for two ImageData (simple mean SSIM over luminance)
  // Using Gaussian window approximation (simplified for worker perf)
  function computeSSIM(dataA, dataB, width, height) {
    const L = 255; // luminance dynamic range
    const k1 = 0.01, k2 = 0.03;
    const c1 = (k1 * L) ** 2;
    const c2 = (k2 * L) ** 2;

    let muA = 0, muB = 0, sigmaA2 = 0, sigmaB2 = 0, sigmaAB = 0;
    const N = width * height;

    for (let i = 0; i < dataA.length; i += 4) {
      const a = 0.299 * dataA[i] + 0.587 * dataA[i+1] + 0.114 * dataA[i+2];
      const b = 0.299 * dataB[i] + 0.587 * dataB[i+1] + 0.114 * dataB[i+2];
      muA += a; muB += b;
    }
    muA /= N; muB /= N;

    for (let i = 0; i < dataA.length; i += 4) {
      const a = 0.299 * dataA[i] + 0.587 * dataA[i+1] + 0.114 * dataA[i+2];
      const b = 0.299 * dataB[i] + 0.587 * dataB[i+1] + 0.114 * dataB[i+2];
      const da = a - muA;
      const db = b - muB;
      sigmaA2 += da * da;
      sigmaB2 += db * db;
      sigmaAB += da * db;
    }
    sigmaA2 /= N; sigmaB2 /= N; sigmaAB /= N;

    const ssim = ((2 * muA * muB + c1) * (2 * sigmaAB + c2)) /
                 ((muA * muA + muB * muB + c1) * (sigmaA2 + sigmaB2 + c2));
    return Math.max(0, Math.min(1, ssim));
  }

  self.onmessage = function(e) {
    const { frames, options } = e.data;
    // frames: ArrayBuffers of ImageData (pixel data RGBA)
    // Each frame is width*height*4 bytes

    const startTime = performance.now();
    const targetWidth = options.width;
    const targetHeight = options.height;
    const anomalyThreshold = options.anomalyThreshold || 60;
    const enableSSIM = options.enableSSIM || false;

    const frameCount = frames.length;
    if (frameCount < 2) {
      self.postMessage({
        type: 'result',
        result: {
          overallScore: 100,
          isConsistent: true,
          averageInstability: 0,
          perFrame: [],
          anomalyRegions: [],
          totalFrames: options.totalFrames || frameCount,
          sampledFrames: frameCount,
          fps: options.fps || 30,
          duration: options.duration || 0,
          processingTimeMs: 0
        }
      });
      return;
    }

    const perFrame = new Array(frameCount);
    perFrame[0] = {
      frameNumber: 1,
      timestamp: options.timestamps?.[0] || 0,
      mse: 0,
      normalizedScore: 0,
      isAnomaly: false
    };

    const mseValues = [];
    let totalMSE = 0;

    // First pass: compute raw MSE (and optionally SSIM)
    for (let i = 1; i < frameCount; i++) {
      const prevData = new Uint8ClampedArray(frames[i-1]);
      const currData = new Uint8ClampedArray(frames[i]);

      const mse = computeLumaMSE(prevData, currData, targetWidth, targetHeight);
      mseValues.push(mse);
      totalMSE += mse;

      let ssim: number | undefined;
      if (enableSSIM) {
        ssim = computeSSIM(prevData, currData, targetWidth, targetHeight);
      }

      perFrame[i] = {
        frameNumber: i + 1,
        timestamp: options.timestamps?.[i] || 0,
        mse,
        normalizedScore: 0, // will compute in second pass
        ssim,
        isAnomaly: false
      };
    }

    // Compute statistics for outlier detection
    const avgMSE = totalMSE / (frameCount - 1);
    let variance = 0;
    for (const mse of mseValues) {
      variance += (mse - avgMSE) ** 2;
    }
    const stdDev = Math.sqrt(variance / mseValues.length);

    // Second pass: normalize and flag anomalies
    const maxExpectedMSE = options.maxFramePairMSE || (avgMSE + 3 * stdDev) || 100;
    let sumNormalized = 0;

    for (let i = 1; i < frameCount; i++) {
      const mse = perFrame[i].mse;
      // Normalize to 0-100 using sqrt compression (like frame-diff-engine)
      const normalized = Math.min(100, Math.sqrt(mse) / Math.sqrt(maxExpectedMSE) * 100);
      perFrame[i].normalizedScore = normalized;
      sumNormalized += normalized;

      // Flag as anomaly if significantly above threshold or statistical outlier
      const isOutlier = mse > avgMSE + 2 * stdDev;
      perFrame[i].isAnomaly = normalized > anomalyThreshold || isOutlier;
    }

    // Average normalized instability across frames
    const avgNormalized = sumNormalized / (frameCount - 1);

    // Third pass: cluster consecutive anomalies into regions
    const anomalyRegions = [];
    let regionStart = -1;
    let regionScores: number[] = [];

    for (let i = 1; i < frameCount; i++) {
      if (perFrame[i].isAnomaly) {
        if (regionStart === -1) regionStart = i;
        regionScores.push(perFrame[i].normalizedScore);
      } else if (regionStart !== -1) {
        const duration = (perFrame[i-1].timestamp - perFrame[regionStart].timestamp) / 1000;
        anomalyRegions.push({
          startFrame: regionStart,
          endFrame: i - 1,
          maxScore: Math.max(...regionScores),
          avgScore: regionScores.reduce((a,b) => a+b, 0) / regionScores.length,
          duration,
          explanation: generateAnomalyExplanation(regionScores.length, Math.max(...regionScores))
        });
        regionStart = -1;
        regionScores = [];
      }
    }
    // Flush trailing region
    if (regionStart !== -1) {
      const endFrame = frameCount - 1;
      const duration = (perFrame[endFrame].timestamp - perFrame[regionStart].timestamp) / 1000;
      anomalyRegions.push({
        startFrame: regionStart,
        endFrame,
        maxScore: Math.max(...regionScores),
        avgScore: regionScores.reduce((a,b) => a+b, 0) / regionScores.length,
        duration,
        explanation: generateAnomalyExplanation(regionScores.length, Math.max(...regionScores))
      });
    }

    // Compute overall temporal consistency score (0-100, higher = more consistent)
    // Start with base: perfect consistency = 100
    // Deduct points for average instability and anomaly count
    const anomalyPenalty = Math.min(30, anomalyRegions.length * 5);
    const instabilityPenalty = avgNormalized * 0.4; // weight
    const overallScore = Math.max(0, Math.min(100, 100 - instabilityPenalty - anomalyPenalty));

    const processingTime = performance.now() - startTime;

    self.postMessage({
      type: 'result',
      result: {
        overallScore: Math.round(overallScore),
        isConsistent: overallScore >= 70,
        averageInstability: Math.round(avgNormalized * 10) / 10,
        perFrame,
        anomalyRegions,
        totalFrames: options.totalFrames || frameCount,
        sampledFrames: frameCount,
        fps: options.fps || 30,
        duration: options.duration || 0,
        processingTimeMs: Math.round(processingTime)
      }
    });
  };

  function generateAnomalyExplanation(length, severity) {
    if (severity > 80) {
      return \`Major temporal disruption detected across \${length} consecutive frame\${length>1?'s':''}. Typical of AI frame interpolation artifacts.\`;
    }
    if (severity > 65) {
      return \`Unnatural motion pattern detected over \${length} frame\${length>1?'s':''}. Possible frame insertion or duplication.\`;
    }
    return \`Minor temporal inconsistency across \${length} frame\${length>1?'s':''}. Potential compression artifact.\`;
  }
`;

// ---------------------------------------------------------------------------
// Seeded RNG for deterministic fallback mode
// ---------------------------------------------------------------------------

function seedRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function() {
    h = (Math.imul(h, 1597334677) + 2121121679) | 0;
    return (h >>> 0) / 0xffffffff;
  };
}

// ---------------------------------------------------------------------------
// Main public API: analyze video for temporal consistency
// ---------------------------------------------------------------------------

/**
 * Analyze a video file for temporal motion consistency.
 * Extracts frames and computes MSE-based instability scoring.
 * Runs heavy pixel computation in a Web Worker.
 *
 * @param videoSrc - Object URL or Blob URL of the video
 * @param options  - Configuration for sampling, resolution, thresholds
 * @returns Promise<TemporalAnalysisResult>
 */
export async function analyzeTemporalConsistency(
  videoSrc: string,
  options: TemporalAnalysisOptions = {}
): Promise<TemporalAnalysisResult> {
  const {
    maxFrames = DEFAULT_MAX_FRAMES,
    targetWidth = DEFAULT_WIDTH,
    targetHeight = DEFAULT_HEIGHT,
    anomalyThreshold = DEFAULT_ANOMALY_THRESHOLD,
    enableSSIM = false,
    onProgress,
  } = options;

  // Create a hidden video element (must be on main thread)
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  // Create offscreen canvas for frame extraction (main thread)
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to create canvas 2D context for frame extraction');
  }

  return new Promise((resolve, reject) => {
    const frameBuffers: ArrayBuffer[] = [];
    const timestamps: number[] = [];
    let totalFrames = 0;
    let fps = 30;
    let duration = 0;

    video.addEventListener('error', () => {
      reject(new Error(`Failed to load video: ${video.error?.message || 'Unknown error'}`));
    });

    video.addEventListener('loadedmetadata', async () => {
      duration = video.duration;
      fps = 30;
      totalFrames = Math.floor(duration * fps);

      const samplesToTake = Math.min(maxFrames, totalFrames);
      const timeStep = duration / samplesToTake;

      let prevImageData: ImageData | null = null;

      // Sequential frame extraction
      for (let i = 0; i < samplesToTake; i++) {
        const time = i * timeStep;

        try {
          await seekToTime(video, time);
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
          const buffer = imageData.data.buffer.slice(0);
          frameBuffers.push(buffer);
          timestamps.push(time * 1000);
          prevImageData = imageData;
        } catch (err) {
          console.warn(`Skipping frame at ${time}s:`, err);
          if (frameBuffers.length > 0) {
            frameBuffers.push(frameBuffers[frameBuffers.length - 1].slice(0));
            timestamps.push(time * 1000);
          }
        }

        onProgress?.(Math.round(((i + 1) / samplesToTake) * 100));
      }

      // Release video resources after extraction
      video.src = '';
      video.load();

      if (frameBuffers.length === 0) {
        reject(new Error('No frames could be extracted from video'));
        return;
      }

      // Spin up Web Worker for temporal computation
      const workerBlob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(workerBlob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e: MessageEvent) => {
        if (e.data.type === 'result' && e.data.result) {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({
            ...e.data.result,
            totalFrames,
          } as TemporalAnalysisResult);
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        reject(new Error(`Temporal analysis worker failed: ${err.message}`));
      };

      const transferList = frameBuffers.map(buf => buf as ArrayBuffer);
      worker.postMessage({
        frames: frameBuffers,
        options: {
          width: targetWidth,
          height: targetHeight,
          anomalyThreshold,
          enableSSIM,
          timestamps,
          totalFrames,
          fps,
          duration,
        }
      }, transferList);
    }); // end loadedmetadata listener

    // Kick off video load
    video.src = videoSrc;
  });
}

// ---------------------------------------------------------------------------
// Helper: Seek video to time and wait for seeked event
// ---------------------------------------------------------------------------

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Seek timeout at ${time}s`));
    }, 5000);

    const onSeeked = () => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      requestAnimationFrame(() => resolve());
    };

    const onError = () => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      reject(new Error(`Seek error at ${time}s`));
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = time;
  });
}

// ---------------------------------------------------------------------------
// Deterministic fallback: seeded simulation when video unavailable
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic temporal analysis for testing/fallback.
 * Uses seeded RNG based on fileName + fileSize so results are reproducible.
 */
export function simulateTemporalAnalysis(
  mediaType: 'image' | 'video',
  fileName: string,
  fileSize: number,
  baseInstability: number = 50
): Omit<TemporalAnalysisResult, 'processingTimeMs'> {
  const rng = seedRandom(fileName + fileSize);

  function generateAnomalyExplanation(length: number, severity: number): string {
    if (severity > 80) {
      return `Major temporal disruption detected across ${length} consecutive frame${length>1?'s':''}. Typical of AI frame interpolation artifacts.`;
    }
    if (severity > 65) {
      return `Unnatural motion pattern detected over ${length} frame${length>1?'s':''}. Possible frame insertion or duplication.`;
    }
    return `Minor temporal inconsistency across ${length} frame${length>1?'s':''}. Potential compression artifact.`;
  }

  if (mediaType === 'image') {
    return {
      overallScore: 100,
      isConsistent: true,
      averageInstability: 0,
      perFrame: [],
      anomalyRegions: [],
      totalFrames: 1,
      sampledFrames: 1,
      fps: 0,
      duration: 0,
    };
  }

  const frameCount = 40 + Math.floor(rng() * 20);
  const perFrame: TemporalFrameData[] = [];
  const anomalyRegions: TemporalAnomalyRegion[] = [];
  const timestamps: number[] = [];
  const fps = 30;
  const duration = frameCount / fps;

  for (let i = 0; i < frameCount; i++) {
    timestamps.push((i / fps) * 1000);

    if (i === 0) {
      perFrame.push({
        frameNumber: 1,
        timestamp: 0,
        mse: 0,
        normalizedScore: 0,
        isAnomaly: false
      });
      continue;
    }

    // Generate realistic MSE variation
    const baseMSE = baseInstability + (rng() - 0.5) * 20;
    const oscillation = Math.sin(i * 0.3) * 15; // natural motion
    const mse = Math.max(0, baseMSE + oscillation + (rng() - 0.5) * 10);

    // Normalize
    const maxExpected = 150;
    const normalized = Math.min(100, Math.sqrt(mse) / Math.sqrt(maxExpected) * 100);

    // Flag anomalies with ~10% probability
    const isAnomaly = rng() < 0.1 && normalized > 55;

    perFrame.push({
      frameNumber: i + 1,
      timestamp: timestamps[i],
      mse,
      normalizedScore: normalized,
      isAnomaly
    });

    // Cluster consecutive anomalies
    if (isAnomaly) {
      const existing = anomalyRegions[anomalyRegions.length - 1];
      if (existing && existing.endFrame === i - 1) {
        existing.endFrame = i;
        existing.maxScore = Math.max(existing.maxScore, normalized);
        existing.avgScore = (existing.avgScore * (existing.endFrame - existing.startFrame) + normalized) / (existing.endFrame - existing.startFrame + 1);
        existing.duration = (timestamps[i] - timestamps[existing.startFrame]) / 1000;
      } else {
        anomalyRegions.push({
          startFrame: i,
          endFrame: i,
          maxScore: normalized,
          avgScore: normalized,
          duration: 1/fps,
          explanation: generateAnomalyExplanation(1, normalized)
        });
      }
    }
  }

  const avgInstability = perFrame.slice(1).reduce((sum, f) => sum + f.normalizedScore, 0) / (frameCount - 1);
  const anomalyPenalty = Math.min(30, anomalyRegions.length * 5);
  const instabilityPenalty = avgInstability * 0.4;
  const overallScore = Math.max(0, Math.min(100, 100 - instabilityPenalty - anomalyPenalty));

  return {
    overallScore: Math.round(overallScore),
    isConsistent: overallScore >= 70,
    averageInstability: Math.round(avgInstability * 10) / 10,
    perFrame,
    anomalyRegions,
    totalFrames: frameCount,
    sampledFrames: frameCount,
    fps,
    duration,
  };
}
