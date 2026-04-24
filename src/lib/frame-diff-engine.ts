/**
 * DeepGuard AI — Frame Differential Analysis Engine
 * ===================================================
 * Provides real video frame extraction and pixel-level differential
 * analysis using HTML5 Canvas API. Computes Mean Squared Error (MSE)
 * between consecutive frames to detect temporal instabilities.
 *
 * Features:
 * - Adaptive frame sampling (caps at configurable max frames)
 * - Canvas-based downscaled extraction (max 640x360 for perf)
 * - Per-frame MSE instability scoring (0-100 normalized)
 * - Macro-pixel cluster heatmap generation (top instability zones)
 * - Memory-safe: frames are processed pairwise and discarded
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FrameLandmarkPoint {
  /** X position (0-100) percentage */
  x: number;
  /** Y position (0-100) percentage */
  y: number;
  /** Displacement magnitude from previous frame */
  displacement: number;
}

export interface ExtractedFrameData {
  frameNumber: number;
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Instability score 0-100 based on MSE */
  instabilityScore: number;
  /** Ghost intensity for overlay rendering */
  ghostIntensity: number;
  /**
   * Macro-pixel cluster positions where the highest
   * differences were detected (replaces facial landmarks)
   */
  landmarks: FrameLandmarkPoint[];
  /** Raw MSE value for this frame pair */
  rawMSE: number;
}

export interface FrameExtractionResult {
  frames: ExtractedFrameData[];
  totalFrames: number;
  sampledFrames: number;
  fps: number;
  duration: number;
  /** Maximum MSE value across all frames */
  maxMSE: number;
  /** Average instability across all frames */
  averageInstability: number;
  /** Detected anomalous frame regions */
  anomalousRegions: { start: number; end: number; maxScore: number }[];
}

export interface FrameExtractionOptions {
  /** Maximum number of frames to sample (default: 60) */
  maxFrames?: number;
  /** Target analysis resolution width (default: 640) */
  targetWidth?: number;
  /** Target analysis resolution height (default: 360) */
  targetHeight?: number;
  /** Grid divisions for macro-cluster detection (default: 8) */
  gridDivisions?: number;
  /** Progress callback (0-100) */
  onProgress?: (percent: number) => void;
  /** Instability threshold to flag as anomalous (default: 40) */
  anomalyThreshold?: number;
}

// ---------------------------------------------------------------------------
// Internal Utilities
// ---------------------------------------------------------------------------

/**
 * Compute luminance-based Mean Squared Error between two ImageData arrays.
 * Uses BT.601 luminance: L = 0.299R + 0.587G + 0.114B
 */
function computeFrameMSE(
  dataA: Uint8ClampedArray,
  dataB: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let sumSqDiff = 0;
  const pixelCount = width * height;

  for (let i = 0; i < dataA.length; i += 4) {
    // BT.601 luminance
    const lumA = 0.299 * dataA[i] + 0.587 * dataA[i + 1] + 0.114 * dataA[i + 2];
    const lumB = 0.299 * dataB[i] + 0.587 * dataB[i + 1] + 0.114 * dataB[i + 2];
    const diff = lumA - lumB;
    sumSqDiff += diff * diff;
  }

  return sumSqDiff / pixelCount;
}

/**
 * Detect macro-pixel clusters with highest MSE in a grid layout.
 * Divides the frame into a grid and computes per-cell MSE,
 * then returns the top hotspots as landmark-like points.
 */
function detectMacroClusters(
  dataA: Uint8ClampedArray,
  dataB: Uint8ClampedArray,
  width: number,
  height: number,
  gridDivisions: number,
  maxClusters: number = 20
): FrameLandmarkPoint[] {
  const cellWidth = Math.floor(width / gridDivisions);
  const cellHeight = Math.floor(height / gridDivisions);

  const cells: { x: number; y: number; mse: number }[] = [];

  for (let gy = 0; gy < gridDivisions; gy++) {
    for (let gx = 0; gx < gridDivisions; gx++) {
      let cellMSE = 0;
      let cellPixels = 0;

      const startX = gx * cellWidth;
      const startY = gy * cellHeight;
      const endX = Math.min(startX + cellWidth, width);
      const endY = Math.min(startY + cellHeight, height);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          const lumA = 0.299 * dataA[idx] + 0.587 * dataA[idx + 1] + 0.114 * dataA[idx + 2];
          const lumB = 0.299 * dataB[idx] + 0.587 * dataB[idx + 1] + 0.114 * dataB[idx + 2];
          const diff = lumA - lumB;
          cellMSE += diff * diff;
          cellPixels++;
        }
      }

      if (cellPixels > 0) {
        cells.push({
          x: ((startX + endX) / 2 / width) * 100,
          y: ((startY + endY) / 2 / height) * 100,
          mse: cellMSE / cellPixels,
        });
      }
    }
  }

  // Sort by MSE descending and take top N with highest displacement
  cells.sort((a, b) => b.mse - a.mse);

  const maxCellMSE = cells[0]?.mse || 1;

  return cells.slice(0, maxClusters).map((cell) => ({
    x: cell.x,
    y: cell.y,
    displacement: (cell.mse / maxCellMSE) * 10, // Normalize to 0-10 range
  }));
}

/**
 * Detect contiguous anomalous regions from frame data.
 */
function detectAnomalousRegions(
  frames: ExtractedFrameData[],
  threshold: number
): { start: number; end: number; maxScore: number }[] {
  const regions: { start: number; end: number; maxScore: number }[] = [];
  let inRegion = false;
  let regionStart = 0;
  let maxScore = 0;

  frames.forEach((frame, i) => {
    if (frame.instabilityScore > threshold) {
      if (!inRegion) {
        inRegion = true;
        regionStart = i;
        maxScore = frame.instabilityScore;
      } else {
        maxScore = Math.max(maxScore, frame.instabilityScore);
      }
    } else if (inRegion) {
      regions.push({ start: regionStart, end: i - 1, maxScore });
      inRegion = false;
    }
  });

  if (inRegion) {
    regions.push({ start: regionStart, end: frames.length - 1, maxScore });
  }

  return regions;
}

// ---------------------------------------------------------------------------
// Public API: Extract & Analyze video frames
// ---------------------------------------------------------------------------

/**
 * Load a video from a source URL, extract frames at evenly-spaced
 * intervals, and compute differential pixel analysis between
 * consecutive frames.
 *
 * @param videoSrc - Object URL or HTTP URL of the video
 * @param options  - Configuration for sampling, resolution, etc.
 * @returns Promise<FrameExtractionResult>
 */
export function analyzeVideoFrames(
  videoSrc: string,
  options: FrameExtractionOptions = {}
): Promise<FrameExtractionResult> {
  const {
    maxFrames = 60,
    targetWidth = 640,
    targetHeight = 360,
    gridDivisions = 8,
    onProgress,
    anomalyThreshold = 40,
  } = options;

  return new Promise((resolve, reject) => {
    // Create hidden video element
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    // Create offscreen canvas for frame extraction
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      reject(new Error('Failed to create canvas 2D context'));
      return;
    }

    video.addEventListener('error', () => {
      reject(new Error(`Failed to load video: ${video.error?.message || 'Unknown error'}`));
    });

    video.addEventListener('loadedmetadata', async () => {
      const duration = video.duration;
      const nativeFps = 30; // Assume 30fps if not available
      const totalNativeFrames = Math.floor(duration * nativeFps);

      // Compute sample timestamps evenly across the duration
      const samplesToTake = Math.min(maxFrames, totalNativeFrames);
      const timeStep = duration / samplesToTake;
      const sampleTimes: number[] = [];
      for (let i = 0; i < samplesToTake; i++) {
        sampleTimes.push(i * timeStep);
      }

      const frameDataList: ExtractedFrameData[] = [];
      let prevImageData: ImageData | null = null;
      let maxMSE = 0;

      // Sequential frame extraction via seeking
      for (let i = 0; i < sampleTimes.length; i++) {
        try {
          await seekToTime(video, sampleTimes[i]);

          // Draw frame to canvas (downscaled automatically)
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          const currentImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

          let instabilityScore = 0;
          let ghostIntensity = 0;
          let rawMSE = 0;
          let landmarks: FrameLandmarkPoint[] = [];

          if (prevImageData) {
            // Compute MSE between current and previous frame
            rawMSE = computeFrameMSE(
              prevImageData.data,
              currentImageData.data,
              targetWidth,
              targetHeight
            );

            if (rawMSE > maxMSE) maxMSE = rawMSE;

            // Detect macro-pixel displacement clusters
            landmarks = detectMacroClusters(
              prevImageData.data,
              currentImageData.data,
              targetWidth,
              targetHeight,
              gridDivisions
            );
          }

          frameDataList.push({
            frameNumber: i + 1,
            timestamp: sampleTimes[i] * 1000,
            instabilityScore, // Will be normalized in second pass
            ghostIntensity,
            landmarks,
            rawMSE,
          });

          // Store current frame for next iteration
          prevImageData = currentImageData;

          // Report progress
          onProgress?.(Math.round(((i + 1) / sampleTimes.length) * 100));
        } catch (err) {
          console.warn(`Skipping frame at ${sampleTimes[i]}s:`, err);
          // Push a zero-instability placeholder for failed frames
          frameDataList.push({
            frameNumber: i + 1,
            timestamp: sampleTimes[i] * 1000,
            instabilityScore: 0,
            ghostIntensity: 0,
            landmarks: [],
            rawMSE: 0,
          });
        }
      }

      // Second pass: normalize instability scores to 0-100
      // using the max MSE as the calibration point
      const effectiveMaxMSE = maxMSE > 0 ? maxMSE : 1;
      let sumInstability = 0;

      for (const frame of frameDataList) {
        // Normalize using square root to compress the dynamic range
        // (pure MSE values can vary wildly; sqrt gives better visual mapping)
        const normalizedMSE = Math.sqrt(frame.rawMSE) / Math.sqrt(effectiveMaxMSE);
        frame.instabilityScore = Math.round(Math.min(normalizedMSE * 100, 100));
        frame.ghostIntensity = Math.min(frame.instabilityScore * 1.2, 100);
        sumInstability += frame.instabilityScore;
      }

      // Detect anomalous regions
      const anomalousRegions = detectAnomalousRegions(frameDataList, anomalyThreshold);

      // Cleanup
      video.src = '';
      video.load(); // Force release

      resolve({
        frames: frameDataList,
        totalFrames: totalNativeFrames,
        sampledFrames: samplesToTake,
        fps: nativeFps,
        duration,
        maxMSE,
        averageInstability: frameDataList.length > 0
          ? sumInstability / frameDataList.length
          : 0,
        anomalousRegions,
      });
    });

    // Start loading the video
    video.src = videoSrc;
  });
}

// ---------------------------------------------------------------------------
// Utility: Seek video to a specific time and wait for it to be ready
// ---------------------------------------------------------------------------

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Seek timeout at ${time}s`));
    }, 5000); // 5s timeout per frame

    const onSeeked = () => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      // Small delay to ensure the frame is painted
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
// Public API: Create a thumbnail from the first frame of a video
// ---------------------------------------------------------------------------

/**
 * Extract a single frame from a video as a data URL for thumbnail usage.
 *
 * @param videoSrc - Object URL or HTTP URL of the video
 * @param atTime   - Time in seconds to capture (default: 0.5)
 * @returns Promise<string> - Data URL of the captured frame
 */
export async function extractVideoThumbnail(
  videoSrc: string,
  atTime: number = 0.5
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'auto';

    video.addEventListener('loadedmetadata', async () => {
      try {
        await seekToTime(video, Math.min(atTime, video.duration));
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2D context');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        video.src = '';
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    });

    video.addEventListener('error', () => {
      reject(new Error('Failed to load video for thumbnail'));
    });

    video.src = videoSrc;
  });
}
