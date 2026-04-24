/**
 * DeepGuard AI — Deep Steganography Engine
 * ====================================================================
 * Advanced pixel-layer decomposition for hidden payload identification.
 * 
 * This engine handles Bit-Plane Slicing (0-7) across RGB channels to 
 * expose information hidden in the Least Significant Bits (LSB).
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

export interface StegoAnalysisResult {
  bitPlanes: string[]; // Base64 images for each bit plane (0-7)
  lsbEntropy: number;
  payloadRisk: 'low' | 'mid' | 'high';
  anomalousRegions: Array<{ x: number; y: number; width: number; height: number; intensity: number }>;
}

/**
 * Extracts a specific bit-plane from an image's ImageData.
 * bit: 0 (LSB) to 7 (MSB)
 */
export function extractBitPlane(imageData: ImageData, bit: number): ImageData {
  const { data, width, height } = imageData;
  const newImageData = new ImageData(new Uint8ClampedArray(data.length), width, height);

  for (let i = 0; i < data.length; i += 4) {
    // Process R, G, B channels
    for (let c = 0; c < 3; c++) {
      const val = data[i + c];
      // Isolate the bit: (val >> bit) & 1
      // Scale to 255 if bit is present for visualization
      const bitVal = ((val >> bit) & 1) * 255;
      newImageData.data[i + c] = bitVal;
    }
    // Alpha channel preserved
    newImageData.data[i + 3] = data[i + 3];
  }

  return newImageData;
}

/**
 * Calculates the entropy of the LSB plane (bit 0).
 * Natural images usually have high-entropy (random) LSBs.
 * Structured data hidden in LSBs will lower this entropy or create clusters.
 */
export function analyzeLSBEntropy(imageData: ImageData): number {
  const { data } = imageData;
  const lsbCounts = new Uint32Array(2); // 0 or 1

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const bit = data[i + c] & 1;
      lsbCounts[bit]++;
    }
  }

  const total = lsbCounts[0] + lsbCounts[1];
  if (total === 0) return 0;

  const p0 = lsbCounts[0] / total;
  const p1 = lsbCounts[1] / total;

  if (p0 === 0 || p1 === 0) return 0;

  // Shannon Entropy for binary (0/1) source
  return -(p0 * Math.log2(p0) + p1 * Math.log2(p1));
}

/**
 * Detects "low-randomness" clusters in the LSB plane.
 * Divides image into grid and checks for entropy deviations.
 */
export function detectStegoClusters(imageData: ImageData, gridSize: number = 32) {
  const { data, width, height } = imageData;
  const regions: StegoAnalysisResult['anomalousRegions'] = [];
  
  const cols = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let lsb0 = 0;
      let lsb1 = 0;

      for (let y = r * gridSize; y < (r + 1) * gridSize; y++) {
        for (let x = c * gridSize; x < (c + 1) * gridSize; x++) {
          const idx = (y * width + x) * 4;
          for (let chan = 0; chan < 3; chan++) {
            const bit = data[idx + chan] & 1;
            if (bit === 0) lsb0++; else lsb1++;
          }
        }
      }

      const total = lsb0 + lsb1;
      const p0 = lsb0 / total;
      const ent = p0 === 0 || p0 === 1 ? 0 : -(p0 * Math.log2(p0) + (1-p0) * Math.log2(1-p0));

      // In natural images, LSB entropy is near 1.0 (perfectly random).
      // If entropy is < 0.85, it indicates highly structured/hidden content.
      if (ent < 0.85) {
        regions.push({
          x: (c / cols) * 100,
          y: (r / rows) * 100,
          width: (1 / cols) * 100,
          height: (1 / rows) * 100,
          intensity: Math.round((1 - ent) * 100)
        });
      }
    }
  }

  return regions;
}
