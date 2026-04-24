/**
 * DeepGuard Forensic Web Worker
 * Offloads heavy pixel-interrogation math from the main thread.
 */

self.onmessage = (e: MessageEvent) => {
  const { data, width, height, type } = e.data;
  
  if (type === 'spectral') {
    const result = analyzeSpectral(data, width, height);
    self.postMessage({ type: 'spectral', result });
  } else if (type === 'gan') {
    const result = analyzeGAN(data, width, height);
    self.postMessage({ type: 'gan', result });
  }
};

function analyzeSpectral(data: Uint8ClampedArray, width: number, height: number) {
  const SAMPLE_SIZE = 128;
  const luminance = new Float32Array(SAMPLE_SIZE * SAMPLE_SIZE);
  
  // Convert center sample to luminance
  for (let y = 0; y < SAMPLE_SIZE; y++) {
    for (let x = 0; x < SAMPLE_SIZE; x++) {
      const idx = ((y * SAMPLE_SIZE) + x) * 4;
      luminance[y * SAMPLE_SIZE + x] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
    }
  }

  const correlations = new Float32Array(SAMPLE_SIZE / 2);
  let maxPeak = 0;

  for (let lag = 1; lag < SAMPLE_SIZE / 2; lag++) {
    let hSum = 0, vSum = 0, dSum = 0;
    let hCount = 0, vCount = 0, dCount = 0;

    for (let y = 0; y < SAMPLE_SIZE; y++) {
      for (let x = 0; x < SAMPLE_SIZE; x++) {
        const i = y * SAMPLE_SIZE + x;
        const val = luminance[i] - 128;

        if (x + lag < SAMPLE_SIZE) {
          hSum += val * (luminance[i + lag] - 128);
          hCount++;
        }
        if (y + lag < SAMPLE_SIZE) {
          vSum += val * (luminance[i + lag * SAMPLE_SIZE] - 128);
          vCount++;
        }
        if (x + lag < SAMPLE_SIZE && y + lag < SAMPLE_SIZE) {
          dSum += val * (luminance[i + lag * SAMPLE_SIZE + lag] - 128);
          dCount++;
        }
      }
    }

    correlations[lag] = (hSum / hCount + vSum / vCount + dSum / dCount) / 3;
    if (lag > 2 && correlations[lag] > maxPeak) maxPeak = correlations[lag];
  }

  const score = Math.max(0, Math.min(100, (maxPeak / 600) * 100));
  return { score: Math.round(score), peaks: Array.from(correlations.slice(1, 15)) };
}

function analyzeGAN(data: Uint8ClampedArray, width: number, height: number) {
  const laplacianKernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
  let highFreqEnergy = 0;
  const stride = 4;

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIdx = ((y + ky) * width + (x + kx)) * stride;
          const lum = data[pixelIdx] * 0.299 + data[pixelIdx+1] * 0.587 + data[pixelIdx+2] * 0.114;
          sum += lum * laplacianKernel[(ky + 1) * 3 + (kx + 1)];
        }
      }
      highFreqEnergy += Math.abs(sum);
    }
  }

  const pixelCount = (width * height) / 4;
  const score = Math.min(100, (highFreqEnergy / pixelCount) * 1.5);
  return { score: Math.round(score) };
}
