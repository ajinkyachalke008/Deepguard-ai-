/**
 * DeepGuard Spectral Anomaly Engine
 * 
 * Detects periodic mathematical regularity in pixel distributions using
 * autocorrelation analysis. Natural photos are stochastic; AI media is periodic.
 */

export interface SpectralAnalysisResult {
  score: number;
  regularityMatrix: number[][]; // Samples for visualization
  peaks: number[];
  status: 'natural' | 'anomalous';
}

/**
 * Analyzes the spectral characteristics of an image to find non-natural periodic patterns.
 */
export async function analyzeSpectralAnomalies(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<SpectralAnalysisResult> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('C-CTX-FAIL');

  const SAMPLE_SIZE = 128; // Analyze a central square
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;

  // Draw the center of the image
  const startX = (imageElement.width - SAMPLE_SIZE) / 2;
  const startY = (imageElement.height - SAMPLE_SIZE) / 2;
  ctx.drawImage(imageElement, startX, startY, SAMPLE_SIZE, SAMPLE_SIZE, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  
  const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const data = imageData.data;

  // Convert to luminance
  const luminance = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE);
  for (let i = 0; i < data.length; i += 4) {
    luminance[i / 4] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  }

  // 2D Auto-correlation: Horizontal, Vertical, and Diagonal scans
  const correlations = new Float32Array(SAMPLE_SIZE / 2);
  let maxPeak = 0;

  for (let lag = 1; lag < SAMPLE_SIZE / 2; lag++) {
    let hSum = 0, vSum = 0, dSum = 0;
    let hCount = 0, vCount = 0, dCount = 0;

    for (let y = 0; y < SAMPLE_SIZE; y++) {
      for (let x = 0; x < SAMPLE_SIZE; x++) {
        const i = y * SAMPLE_SIZE + x;
        const val = luminance[i] - 128;

        // Horizontal
        if (x + lag < SAMPLE_SIZE) {
          hSum += val * (luminance[i + lag] - 128);
          hCount++;
        }
        // Vertical
        if (y + lag < SAMPLE_SIZE) {
          vSum += val * (luminance[i + lag * SAMPLE_SIZE] - 128);
          vCount++;
        }
        // Diagonal
        if (x + lag < SAMPLE_SIZE && y + lag < SAMPLE_SIZE) {
          dSum += val * (luminance[i + lag * SAMPLE_SIZE + lag] - 128);
          dCount++;
        }
      }
    }

    // Average across 2D vectors
    correlations[lag] = (hSum / hCount + vSum / vCount + dSum / dCount) / 3;
    if (lag > 2 && correlations[lag] > maxPeak) maxPeak = correlations[lag];
  }

  // Heuristic: If we find high correlation at small lags (neural upscaling residuals), boost score
  const baseSignal = Math.max(0, Math.min(100, (maxPeak / 600) * 100));
  const score = baseSignal;
  
  return {
    score: Math.round(score),
    peaks: Array.from(correlations.slice(1, 15)),
    regularityMatrix: [], 
    status: score > 45 ? 'anomalous' : 'natural'
  };
}
