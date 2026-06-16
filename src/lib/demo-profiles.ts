/**
 * DeepGuard AI — Demo Simulation Profile Engine
 * ================================================
 * Generates complete, realistic AnalysisResult objects for demonstrations.
 * 9 profiles from "Confirmed AI Generated" (1) to "Verified Authentic" (9).
 * Every run produces randomized values within the profile's defined ranges.
 *
 * ACTIVATION: URL parameter ?dp=N on /analyze page (hidden from UI).
 */

import type { AnalysisResult } from './forensic-analysis';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoProfile {
  id: number;
  name: string;
  verdict: string;
  riskLevel: string;
  severity: 'low' | 'mid' | 'high';
  forensicStatus: string;
  aiLikelihood: [number, number];
  confidence: [number, number];
  anomalyCount: [number, number];
  ganResidual: [number, number];
  spectralAnomaly: [number, number];
  anatomical: [number, number];
  lighting: [number, number];
  metadataIntegrity: [number, number];
  stegoRisk: 'Negligible' | 'Very Low' | 'Low' | 'Moderate' | 'High';
  binaryRisk: 'Negligible' | 'Very Low' | 'Low' | 'Moderate' | 'High';
  entropyAvg: [number, number];
  advisory: string;
  humanCalibration: string;
  forensicExplanation: string;
  audienceExplanations: { General: string; Journalist: string; Legal: string; };
  demoStrings: { heatmap: string; c2pa: string; stego: string; binary: string; reasoning: string[]; };
}

// ---------------------------------------------------------------------------
// 9 Profiles
// ---------------------------------------------------------------------------

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: 1,
    name: "Critical Fake",
    verdict: "AI Generated",
    riskLevel: "Critical",
    severity: 'high',
    forensicStatus: 'Demo Status',
    aiLikelihood: [95,100],
    confidence: [95,100],
    anomalyCount: [20,30],
    ganResidual: [60,100],
    spectralAnomaly: [60,100],
    anatomical: [60,100],
    lighting: [0,30],
    metadataIntegrity: [0,30],
    stegoRisk: 'High',
    binaryRisk: 'High',
    entropyAvg: [7.4,7.95],
    advisory: 'Generated advisory for Critical Fake',
    humanCalibration: 'Calibration for Critical Fake',
    forensicExplanation: 'Explanation for Critical Fake',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Large anomaly regions",
      c2pa: "Missing credentials",
      stego: "Multiple hidden payloads detected",
      binary: "High entropy anomalies",
      reasoning: ["GAN artifacts detected","Lighting mismatch","Facial blending seams","Reflection anomalies","Texture inconsistencies"]
    }
  },
  {
    id: 2,
    name: "Very High Fake Probability",
    verdict: "Likely AI Generated",
    riskLevel: "Very High",
    severity: 'high',
    forensicStatus: 'Demo Status',
    aiLikelihood: [88,95],
    confidence: [88,95],
    anomalyCount: [16,24],
    ganResidual: [60,100],
    spectralAnomaly: [60,100],
    anatomical: [60,100],
    lighting: [0,30],
    metadataIntegrity: [0,30],
    stegoRisk: 'High',
    binaryRisk: 'High',
    entropyAvg: [7.4,7.95],
    advisory: 'Generated advisory for Very High Fake Probability',
    humanCalibration: 'Calibration for Very High Fake Probability',
    forensicExplanation: 'Explanation for Very High Fake Probability',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Major anomaly regions",
      c2pa: "Invalid credentials",
      stego: "Embedded watermark found",
      binary: "Major irregularities",
      reasoning: ["Significant GAN artifacts","Texture periodicity","Unnatural specular highlights","Anatomical deviations"]
    }
  },
  {
    id: 3,
    name: "High Fake Probability",
    verdict: "Suspicious AI Content",
    riskLevel: "High",
    severity: 'high',
    forensicStatus: 'Demo Status',
    aiLikelihood: [80,88],
    confidence: [80,88],
    anomalyCount: [12,18],
    ganResidual: [60,100],
    spectralAnomaly: [60,100],
    anatomical: [60,100],
    lighting: [0,30],
    metadataIntegrity: [0,30],
    stegoRisk: 'High',
    binaryRisk: 'High',
    entropyAvg: [7.4,7.95],
    advisory: 'Generated advisory for High Fake Probability',
    humanCalibration: 'Calibration for High Fake Probability',
    forensicExplanation: 'Explanation for High Fake Probability',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Strong anomaly regions",
      c2pa: "Credential mismatch",
      stego: "Suspicious bit structures",
      binary: "Noticeable anomalies",
      reasoning: ["Moderate GAN artifacts","Spectral anomalies","Subtle lighting mismatch"]
    }
  },
  {
    id: 4,
    name: "Moderate Suspicion",
    verdict: "Suspicious Media",
    riskLevel: "Medium",
    severity: 'mid',
    forensicStatus: 'Demo Status',
    aiLikelihood: [70,80],
    confidence: [70,80],
    anomalyCount: [8,14],
    ganResidual: [30,60],
    spectralAnomaly: [30,60],
    anatomical: [30,60],
    lighting: [30,60],
    metadataIntegrity: [30,60],
    stegoRisk: 'Moderate',
    binaryRisk: 'Moderate',
    entropyAvg: [7,7.3],
    advisory: 'Generated advisory for Moderate Suspicion',
    humanCalibration: 'Calibration for Moderate Suspicion',
    forensicExplanation: 'Explanation for Moderate Suspicion',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Moderate anomaly regions",
      c2pa: "Partial chain",
      stego: "Possible hidden content",
      binary: "Moderate anomalies",
      reasoning: ["Inconsistent shadow vectors","Minor edge blending issues","Elevated high-frequency noise"]
    }
  },
  {
    id: 5,
    name: "Mixed Signals",
    verdict: "Undetermined",
    riskLevel: "Moderate",
    severity: 'mid',
    forensicStatus: 'Demo Status',
    aiLikelihood: [55,70],
    confidence: [55,70],
    anomalyCount: [5,10],
    ganResidual: [30,60],
    spectralAnomaly: [30,60],
    anatomical: [30,60],
    lighting: [30,60],
    metadataIntegrity: [30,60],
    stegoRisk: 'Moderate',
    binaryRisk: 'Moderate',
    entropyAvg: [7,7.3],
    advisory: 'Generated advisory for Mixed Signals',
    humanCalibration: 'Calibration for Mixed Signals',
    forensicExplanation: 'Explanation for Mixed Signals',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Mixed anomaly regions",
      c2pa: "Incomplete chain",
      stego: "Uncertain patterns",
      binary: "Mixed signals",
      reasoning: ["Inconclusive texture analysis","Ambiguous spectral data","Partial metadata integrity"]
    }
  },
  {
    id: 6,
    name: "Mostly Authentic",
    verdict: "Likely Authentic",
    riskLevel: "Low",
    severity: 'low',
    forensicStatus: 'Demo Status',
    aiLikelihood: [65,78],
    confidence: [65,78],
    anomalyCount: [3,7],
    ganResidual: [0,30],
    spectralAnomaly: [0,30],
    anatomical: [0,30],
    lighting: [60,100],
    metadataIntegrity: [60,100],
    stegoRisk: 'Low',
    binaryRisk: 'Low',
    entropyAvg: [6,6.9],
    advisory: 'Generated advisory for Mostly Authentic',
    humanCalibration: 'Calibration for Mostly Authentic',
    forensicExplanation: 'Explanation for Mostly Authentic',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Small anomaly regions",
      c2pa: "Mostly valid",
      stego: "Mostly clean",
      binary: "Mostly normal",
      reasoning: ["Compression artifacts only","Consistent lighting","Expected noise floor"]
    }
  },
  {
    id: 7,
    name: "Authentic",
    verdict: "Authentic",
    riskLevel: "Low",
    severity: 'low',
    forensicStatus: 'Demo Status',
    aiLikelihood: [78,88],
    confidence: [78,88],
    anomalyCount: [1,4],
    ganResidual: [0,30],
    spectralAnomaly: [0,30],
    anatomical: [0,30],
    lighting: [60,100],
    metadataIntegrity: [60,100],
    stegoRisk: 'Low',
    binaryRisk: 'Low',
    entropyAvg: [6,6.9],
    advisory: 'Generated advisory for Authentic',
    humanCalibration: 'Calibration for Authentic',
    forensicExplanation: 'Explanation for Authentic',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Minimal anomaly regions",
      c2pa: "Valid",
      stego: "Clean",
      binary: "Normal",
      reasoning: ["Natural sensor noise","Consistent geometry","Standard JPEG compression"]
    }
  },
  {
    id: 8,
    name: "Highly Authentic",
    verdict: "Verified Authentic",
    riskLevel: "Very Low",
    severity: 'low',
    forensicStatus: 'Demo Status',
    aiLikelihood: [88,95],
    confidence: [88,95],
    anomalyCount: [0,2],
    ganResidual: [0,30],
    spectralAnomaly: [0,30],
    anatomical: [0,30],
    lighting: [60,100],
    metadataIntegrity: [60,100],
    stegoRisk: 'Low',
    binaryRisk: 'Low',
    entropyAvg: [6,6.9],
    advisory: 'Generated advisory for Highly Authentic',
    humanCalibration: 'Calibration for Highly Authentic',
    forensicExplanation: 'Explanation for Highly Authentic',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Near clean",
      c2pa: "Verified",
      stego: "Clean",
      binary: "Clean",
      reasoning: ["Verified sensor signatures","Pristine metadata","Natural frequency distribution"]
    }
  },
  {
    id: 9,
    name: "Verified Authentic",
    verdict: "Trusted Content",
    riskLevel: "Negligible",
    severity: 'low',
    forensicStatus: 'Demo Status',
    aiLikelihood: [0,5],
    confidence: [95,100],
    anomalyCount: [0,0],
    ganResidual: [0,30],
    spectralAnomaly: [0,30],
    anatomical: [0,30],
    lighting: [60,100],
    metadataIntegrity: [60,100],
    stegoRisk: 'Low',
    binaryRisk: 'Low',
    entropyAvg: [6,6.9],
    advisory: 'Generated advisory for Verified Authentic',
    humanCalibration: 'Calibration for Verified Authentic',
    forensicExplanation: 'Explanation for Verified Authentic',
    audienceExplanations: {
      General: 'General audience explanation',
      Journalist: 'Journalist explanation',
      Legal: 'Legal explanation'
    },
    demoStrings: {
      heatmap: "Clean",
      c2pa: "Fully verified",
      stego: "Clean",
      binary: "Perfectly normal",
      reasoning: ["Natural sensor noise","Consistent lighting","Authentic facial structures","No synthesis indicators","Natural image statistics"]
    }
  }
];

// ---------------------------------------------------------------------------
// Randomization Helpers
// ---------------------------------------------------------------------------

/** Random float in [min, max] */
function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Random float in [min, max], rounded to 1 decimal */
function randRange1(min: number, max: number): number {
  return Math.round(randRange(min, max) * 10) / 10;
}

/** Random integer in [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 0.99));
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function getProfile(id: number): DemoProfile {
  const clamped = Math.max(1, Math.min(9, id));
  return DEMO_PROFILES[clamped - 1];
}

/**
 * Generates a complete AnalysisResult for a given demo profile.
 * Every call produces randomized values within profile ranges.
 */
export function generateDemoAnalysis(profileId: number, fileName?: string, fileUrl?: string, thumbnailUrl?: string): AnalysisResult {
  const profile = getProfile(profileId);
  const now = new Date();
  const id = `demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const name = fileName || 'demo_media.jpg';

  const aiScore = randRange1(...profile.aiLikelihood);
  const confidence = randRange1(...profile.confidence);
  const ganScore = randRange1(...profile.ganResidual);
  const spectralScore = randRange1(...profile.spectralAnomaly);
  const anatomicalScore = randRange1(...profile.anatomical);
  const lightingScore = randRange1(...profile.lighting);
  const metadataScore = randRange1(...profile.metadataIntegrity);
  const entropyAvg = randRange1(...profile.entropyAvg);

  // Dynamic forensic chain timestamps
  const baseTime = now.getTime();
  const chainTimestamps = [
    baseTime,
    baseTime + randInt(200, 500),
    baseTime + randInt(800, 1200),
    baseTime + randInt(5000, 8000),
    baseTime + randInt(10000, 12000),
    baseTime + randInt(13000, 15000),
  ];

  // Heatmap regions - profile-aware
  const heatmapRegions = generateHeatmapRegions(profile);

  // Narrative timeline - profile-aware
  const narrativeTimeline = generateNarrativeTimeline(profile);

  // Confidence evolution - profile-aware
  const confidenceEvolution = generateConfidenceEvolution(profile, confidence);

  // Confidence gaps - profile-aware
  const confidenceGaps = generateConfidenceGaps(profile);

  // Plausibility checks - profile-aware
  const plausibilityChecks = generatePlausibilityChecks(profile);

  // Authenticity drift - profile-aware
  const authenticityDrift = generateAuthenticityDrift(profile, chainTimestamps);

  // Reliability contract
  const reliabilityContract = generateReliabilityContract(profile, confidence);

  // Timeline (frame data for charts)
  const frameCount = 50;
  const timeline = Array.from({ length: frameCount }, (_, i) => ({
    frame: i,
    risk: Math.max(0, Math.min(100, aiScore + (Math.random() - 0.5) * (profile.id <= 3 ? 15 : 25))),
    spectral: Math.max(0, Math.min(100, spectralScore + (Math.random() - 0.5) * 18)),
    motion: Math.random() * 100,
    confidence: Math.max(0, Math.min(100, confidence + (Math.random() - 0.5) * 10)),
  }));

  const analysis: AnalysisResult = {
    id,
    status: 'completed',
    createdAt: new Date(chainTimestamps[0]).toISOString(),
    completedAt: new Date(chainTimestamps[5]).toISOString(),
    mediaType: name.toLowerCase().match(/\.(mp4|mov|webm|mkv)$/) ? 'video' : 'image',
    fileName: name,
    fileSize: randInt(800000, 12000000),
    fileUrl: fileUrl,
    thumbnailUrl: thumbnailUrl || fileUrl,
    verdict: {
        label: profile.verdict,
      score: aiScore,
      confidence,
      severity: profile.severity,
    },
    metadata: {
      width: [1920, 2048, 3840, 4096, 1080][randInt(0, 4)],
      height: [1080, 1536, 2160, 2304, 1920][randInt(0, 4)],
      format: name.split('.').pop()?.toUpperCase() || 'JPG',
      hasExif: profile.id >= 6,
      ...(name.toLowerCase().match(/\.(mp4|mov|webm|mkv)$/) ? {
        frameCount: randInt(120, 600),
        duration: randRange1(5, 30),
        codec: ['H.264', 'HEVC', 'ProRes', 'VP9'][randInt(0, 3)],
        fps: 30
      } : {}),
      creationDate: now.toISOString(),
      camera: profile.id >= 7
        ? ['iPhone 15 Pro', 'Canon EOS R5', 'Sony A7 IV', 'Nikon Z8', 'Samsung Galaxy S24'][randInt(0, 4)]
        : profile.id >= 5
          ? ['Unknown Device', undefined][randInt(0, 1)]
          : undefined,
      software: profile.id <= 3
        ? ['Adobe Firefly', 'Midjourney v6', 'Stable Diffusion XL', 'DALL·E 3'][randInt(0, 3)]
        : profile.id <= 5
          ? ['Adobe Photoshop 2024', 'Unknown', undefined][randInt(0, 2)]
          : profile.id >= 8
            ? ['Apple iOS 18.1', 'Samsung Camera', 'Adobe Lightroom Classic'][randInt(0, 2)]
            : undefined,
      gpsLocation: profile.id >= 8
        ? `${(Math.random() * 180 - 90).toFixed(4)}, ${(Math.random() * 360 - 180).toFixed(4)}`
        : undefined,
      isCompressionWarning: profile.id <= 3,
      socialPlatform: undefined,
      compressionArtifactsDetected: profile.id <= 4,
    },
    signals: {
      ganArtifacts: ganScore,
      spectralAnomaly: spectralScore,
      anatomicalInconsistency: anatomicalScore,
      metadataIntegrity: metadataScore,
      lightingConsistency: lightingScore,
    },
    timeline,
    heatmapRegions,
    c2pa: {
      status: profile.id >= 8 ? 'verified' : profile.id >= 6 ? 'partial' : 'absent',
      signatureValid: profile.id >= 8,
      issuer: profile.id >= 8 ? 'Adobe Content Authenticity Initiative' : undefined,
      timestamp: profile.id >= 8 ? now.toISOString() : undefined,
    },
    entropyAnalysis: {
      average: entropyAvg,
      anomalyRegions: profile.id <= 3
        ? [
            { offset: randInt(1000, 5000), length: randInt(512, 2048), entropy: randRange1(0.96, 0.99) },
            { offset: randInt(8000, 15000), length: randInt(256, 1024), entropy: randRange1(0.94, 0.98) },
          ]
        : profile.id <= 5
          ? [{ offset: randInt(2000, 8000), length: randInt(512, 1024), entropy: randRange1(0.90, 0.95) }]
          : [],
    },
    confidenceEvolution,
    confidenceGaps,
    authenticityDrift,
    steganography: {
      bitPlanes: [],
      lsbEntropy: profile.id <= 3 ? randRange1(0.7, 0.84) : randRange1(0.92, 0.99),
      payloadRisk: profile.stegoRisk === 'High' ? 'high' : profile.stegoRisk === 'Moderate' ? 'mid' : 'low',
      anomalousRegions: profile.id <= 4
        ? [
            { x: randRange1(10, 40), y: randRange1(10, 40), width: randRange1(10, 25), height: randRange1(10, 25), intensity: randInt(40, 80) },
          ]
        : [],
    },
    adversarialRisk: {
      score: profile.id <= 3 ? randRange1(60, 90) : profile.id <= 5 ? randRange1(30, 55) : randRange1(5, 25),
      perturbationLevel: profile.id <= 3 ? 'high' : profile.id <= 5 ? 'low' : 'none',
      noiseProfile: profile.id <= 2 ? 'adversarial' : profile.id <= 4 ? 'mathematical' : 'standard',
    },
    plausibilityChecks,
    reliabilityContract,
    narrativeTimeline,
    audienceExplanations: profile.audienceExplanations,
    aiInterpretation: {
      demoStrings: profile.demoStrings,
      anomalyCount: randInt(profile.anomalyCount[0], profile.anomalyCount[1]),
      model: 'demo-simulation-engine/v1',
      generatedAt: now.toISOString(),
      verdict: {
        label: profile.verdict,
        score: aiScore,
        confidence,
        explanation: profile.forensicExplanation,
      },
      signals: {
        ganArtifacts: ganScore,
        spectralAnomaly: spectralScore,
        anatomicalInconsistency: anatomicalScore,
        lightingConsistency: lightingScore,
      },
      findings: generateFindings(profile),
      audienceExplanations: profile.audienceExplanations,
      heatmapRegions,
      narrativeTimeline,
      confidenceEvolution,
      confidenceGaps,
    },
  };

  return analysis;
}

// ---------------------------------------------------------------------------
// Sub-generators
// ---------------------------------------------------------------------------

function generateHeatmapRegions(profile: DemoProfile): AnalysisResult['heatmapRegions'] {
  const safeTerms = [
    { label: 'Normal Image Quality', explanation: 'This area looks completely natural and matches a real camera.' },
    { label: 'Standard Camera Noise', explanation: 'The grainy texture here is totally normal for a real photo.' },
    { label: 'Consistent Lighting', explanation: 'The shadows and highlights here are completely natural.' }
  ];
  
  const suspiciousTerms = [
    { label: 'Slightly Weird Pixels', explanation: 'There are a few strange pixels here, but it could just be image compression.' },
    { label: 'Over-Smoothed Area', explanation: 'This part looks a bit too smooth, possibly from a heavy beauty filter.' },
    { label: 'Strange Image Quality', explanation: 'The quality here drops suddenly, which is slightly suspicious.' }
  ];
  
  const moderateTerms = [
    { label: 'Unnatural Textures', explanation: 'The textures here look painted or artificial rather than photographed.' },
    { label: 'Messy Edges', explanation: 'The boundary between the subject and the background is glitchy.' },
    { label: 'Blocky Compression', explanation: 'This area has heavy, unnatural blocky squares.' },
    { label: 'Inconsistent Sharpness', explanation: 'Part of this area is perfectly sharp while the rest is blurry.' },
    { label: 'Fake Background Blur', explanation: 'The blur effect here looks artificially added, not from a real lens.' }
  ];
  
  const severeTerms = [
    { label: 'AI Fingerprint Detected', explanation: 'We found hidden, repeating patterns that are left behind by AI generators.' },
    { label: 'Melted AI Details', explanation: 'Small details (like hair, text, or fingers) look melted and deformed.' },
    { label: 'Impossible Lighting', explanation: 'The shadows here directly contradict where the light is actually coming from.' },
    { label: 'Fake Object Blending', explanation: 'Two different objects are morphing into each other in an impossible way.' },
    { label: 'AI Color Glitch', explanation: 'Random patches of neon colors are appearing where they shouldn\'t be.' },
    { label: 'Copy-Paste Artifacts', explanation: 'It looks like this piece of the image was poorly pasted over another.' }
  ];

  const pickRandom = (arr: any[], count: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  if (profile.id >= 8) {
    const term = pickRandom(safeTerms, 1)[0];
    return [{ id: 'h1', x: 40, y: 35, width: 20, height: 20, intensity: randRange1(0.05, 0.15), ...term }];
  }
  if (profile.id >= 6) {
    const term = pickRandom(suspiciousTerms, 1)[0];
    return [
      { id: 'h1', x: randInt(30, 50), y: randInt(25, 40), width: randInt(10, 18), height: randInt(10, 18), intensity: randRange1(0.1, 0.25), ...term },
    ];
  }
  if (profile.id >= 4) {
    const terms = pickRandom(moderateTerms, 2);
    return [
      { id: 'h1', x: randInt(25, 45), y: randInt(20, 35), width: randInt(12, 22), height: randInt(15, 25), intensity: randRange1(0.3, 0.5), ...terms[0] },
      { id: 'h2', x: randInt(40, 60), y: randInt(40, 55), width: randInt(8, 15), height: randInt(8, 12), intensity: randRange1(0.25, 0.45), ...terms[1] },
    ];
  }
  // Profiles 1-3 — high severity
  const termsCount = profile.id === 1 ? 4 : 3;
  const terms = pickRandom(severeTerms, termsCount);
  return terms.map((term, index) => ({
    id: `h${index + 1}`,
    x: randInt(15 + index * 5, 40 + index * 5),
    y: randInt(15 + index * 10, 30 + index * 10),
    width: randInt(10, 25),
    height: randInt(10, 25),
    intensity: randRange1(0.55 + (3 - index) * 0.05, 0.95),
    ...term
  }));
}

function generateNarrativeTimeline(profile: DemoProfile): AnalysisResult['narrativeTimeline'] {
  const isAI = profile.id <= 4;
  const isSuspicious = profile.id <= 5;

  return [
    { id: 'n1', milestone: 'System Initialization', description: 'DeepGuard Neural Engine engaged. Commencing multi-layered forensic protocol.', timestamp: 'T+0.012s', iconType: 'search' },
    { id: 'n2', milestone: 'Optical Sensor Verification', description: profile.id >= 7 ? 'Successfully verified authentic hardware signature and optical noise floor.' : profile.id >= 5 ? 'Warning: Origin metadata is incomplete or partially stripped.' : 'CRITICAL: No authentic camera sensor signature detected. Possible digital origin.', timestamp: 'T+0.415s', iconType: profile.id >= 7 ? 'check' : profile.id >= 5 ? 'search' : 'alert' },
    { id: 'n3', milestone: 'Deep-Level Network Scan', description: isAI ? `Detected ${profile.id === 1 ? 'severe' : 'distinct'} traces of Generative Adversarial Network (GAN) upscaling grids.` : 'Scan complete. No generative artifacts found in image sub-layers.', timestamp: 'T+1.204s', iconType: isAI ? 'alert' : 'check' },
    { id: 'n4', milestone: 'Spectral Frequency Analysis', description: profile.id <= 3 ? 'Unnatural frequency waves detected. Pixels have been mathematically assembled.' : profile.id <= 5 ? 'Minor frequency distortions found, indicating heavy digital alteration.' : 'Frequency waves are organic. Light distribution matches real-world capture.', timestamp: 'T+2.188s', iconType: profile.id <= 3 ? 'alert' : profile.id <= 5 ? 'search' : 'shield' },
    { id: 'n5', milestone: 'Physics & Reality Integrity', description: isAI ? 'Structural failure: Detected impossible lighting vectors and anatomical warping.' : 'Integrity confirmed. Shadows, lighting, and physical geometry are mathematically sound.', timestamp: 'T+3.402s', iconType: isAI ? 'alert' : 'check' },
    { id: 'n6', milestone: 'Terminal Verdict Rendered', description: `[CLASSIFICATION: ${profile.verdict.toUpperCase()}] — ${profile.forensicStatus}`, timestamp: 'T+4.005s', iconType: profile.id <= 3 ? 'alert' : profile.id <= 5 ? 'search' : 'shield' },
  ];
}

function generateConfidenceEvolution(profile: DemoProfile, finalConfidence: number): AnalysisResult['confidenceEvolution'] {
  const isAI = profile.id <= 4;

  return [
    { stage: 'Initial Look', delta: 0, cumulative: 50, explanation: 'Starting the analysis from scratch.' },
    { stage: 'Camera Check', delta: isAI ? -8 : 10, cumulative: isAI ? 42 : 60, explanation: isAI ? 'The image is missing standard camera details.' : 'Found normal camera details.' },
    { stage: 'AI Texture Test', delta: isAI ? 18 : -5, cumulative: isAI ? 60 : 55, explanation: isAI ? 'Found artificial textures used by AI.' : 'Textures look like a real photo.' },
    { stage: 'Image Quality', delta: isAI ? 12 : -8, cumulative: isAI ? 72 : 47, explanation: isAI ? 'The image quality is unnaturally perfect.' : 'The image quality has normal imperfections.' },
    { stage: 'Physics Check', delta: isAI ? 8 : -3, cumulative: isAI ? 80 : 44, explanation: isAI ? 'Found impossible shapes or lighting.' : 'Everything follows the laws of physics.' },
    { stage: 'Final Score', delta: Math.round(finalConfidence - (isAI ? 80 : 44)), cumulative: Math.round(finalConfidence), explanation: 'Calculated the final result.' },
  ];
}

function generateConfidenceGaps(profile: DemoProfile): AnalysisResult['confidenceGaps'] {
  return [
    { id: 'g1', condition: 'Original Camera Info', impact: '+12%', recommendation: 'Provide the original file straight from the camera.', status: profile.id >= 7 ? 'present' : profile.id >= 5 ? 'degraded' : 'missing' },
    { id: 'g2', condition: 'Content Credentials', impact: '+15%', recommendation: 'Submit an image that has digital signatures built-in.', status: profile.id >= 8 ? 'present' : 'missing' },
    { id: 'g3', condition: 'High Quality Image', impact: '+8%', recommendation: 'Avoid uploading screenshots or heavily compressed files.', status: profile.id >= 6 ? 'present' : profile.id >= 4 ? 'degraded' : 'missing' },
    { id: 'g4', condition: 'RAW Photo Format', impact: '+10%', recommendation: 'Upload the unedited RAW photo if possible.', status: profile.id >= 9 ? 'present' : 'missing' },
  ];
}

function generatePlausibilityChecks(profile: DemoProfile): AnalysisResult['plausibilityChecks'] {
  const isAI = profile.id <= 4;
  return [
    { 
      id: 'p1', 
      label: 'GAN_TEXTURE_RESIDUALS', 
      status: profile.id <= 3 ? 'anomalous' : profile.id <= 5 ? 'warning' : 'passed', 
      explanation: profile.id <= 3 ? 'Microscopic AI texture patterns detected in the image.' : profile.id <= 5 ? 'Minor irregularities found in the image texture.' : 'The image texture is completely natural.' 
    },
    { 
      id: 'p2', 
      label: 'SPECTRAL_ANOMALY_INDEX', 
      status: profile.id <= 3 ? 'anomalous' : profile.id <= 5 ? 'warning' : 'passed', 
      explanation: profile.id <= 3 ? 'Unnatural frequency waves found, typical of AI generation.' : profile.id <= 5 ? 'Slight frequency distortion detected.' : 'Frequency waves match a real camera.' 
    },
    { id: 'p3', label: 'Color Space Integrity', status: profile.id <= 2 ? 'anomalous' : 'passed', explanation: profile.id <= 2 ? 'Colors look too perfect and vibrant for a raw photo.' : 'Colors look natural.' },
    { id: 'p4', label: 'Thumbnail Consistency', status: profile.id <= 3 ? 'anomalous' : profile.id <= 5 ? 'warning' : 'passed', explanation: profile.id <= 3 ? 'The hidden thumbnail doesn\'t match the picture.' : 'The thumbnail matches perfectly.' },
    { id: 'p5', label: 'Physics Check', status: profile.id <= 4 ? 'warning' : 'passed', explanation: profile.id <= 4 ? 'Found impossible shadows or lighting.' : 'Lighting is natural.' },
  ];
}

function generateAuthenticityDrift(profile: DemoProfile, timestamps: number[]): AnalysisResult['authenticityDrift'] {
  return [
    { id: 'd1', event: 'Source Instantiation', timestamp: new Date(timestamps[0]).toISOString(), confidence: profile.id >= 7 ? 95 : profile.id >= 5 ? 70 : 40, drift: 0, type: 'original', details: profile.id >= 7 ? 'Authentic photonic capture signature logged.' : 'Warning: Source instantiation trace is opaque or synthetic.' },
    { id: 'd2', event: 'Compression Matrix', timestamp: new Date(timestamps[2]).toISOString(), confidence: profile.id >= 6 ? 85 : 55, drift: profile.id <= 4 ? -15 : -3, type: 'compression', details: profile.id <= 4 ? 'Anomalous algorithmic compression layers detected.' : 'Standard JPEG/PNG compression matrix verified.' },
    { id: 'd3', event: 'DeepGuard Telemetry', timestamp: new Date(timestamps[4]).toISOString(), confidence: Math.round(randRange1(...profile.confidence)), drift: profile.id <= 3 ? -25 : profile.id <= 5 ? -10 : 5, type: profile.id <= 3 ? 'editing' : 'upload', details: profile.forensicStatus },
  ];
}

function generateReliabilityContract(profile: DemoProfile, confidence: number): AnalysisResult['reliabilityContract'] {
  const halfWidth = profile.id <= 3 ? 3 : profile.id <= 5 ? 8 : 5;
  return {
    range: [Math.max(0, Math.round(confidence - halfWidth)), Math.min(100, Math.round(confidence + halfWidth))],
    statement: profile.advisory,
    conditions: [
      'Analysis performed on provided file only.',
      profile.id >= 6 ? 'EXIF metadata contributed to verdict.' : 'No EXIF metadata available for corroboration.',
      `${profile.forensicStatus}.`,
    ],
    riskLevel: profile.id <= 3 ? 'high' : profile.id <= 5 ? 'moderate' : 'minimal',
  };
}

function generateFindings(profile: DemoProfile): Array<{ location: string; issue: string; confidence: number }> {
  if (profile.id >= 8) return [{ location: 'Full image', issue: 'No significant issues detected.', confidence: randRange1(2, 10) }];
  if (profile.id >= 6) return [{ location: 'Background region', issue: 'Minor compression artifacts.', confidence: randRange1(15, 30) }];
  if (profile.id >= 4) return [
    { location: 'Facial region', issue: 'Moderate texture anomalies detected.', confidence: randRange1(45, 65) },
    { location: 'Hair boundary', issue: 'Edge transition irregularities.', confidence: randRange1(35, 55) },
  ];
  return [
    { location: 'Facial region', issue: 'Strong GAN reconstruction artifacts.', confidence: randRange1(80, 98) },
    { location: 'Eye area', issue: 'Iris texture irregularities and reflection asymmetry.', confidence: randRange1(70, 92) },
    { location: 'Background', issue: 'Spectral frequency periodicity anomalies.', confidence: randRange1(65, 88) },
    ...(profile.id === 1 ? [{ location: 'Full image', issue: 'Global texture distribution inconsistent with camera sensors.', confidence: randRange1(85, 98) }] : []),
  ];
}

// ---------------------------------------------------------------------------
// Storage helpers for demo results
// ---------------------------------------------------------------------------

const DEMO_CACHE_KEY = 'deepguard_demo_cache';

export function cacheDemoAnalysis(analysis: AnalysisResult): void {
  if (typeof window === 'undefined') return;
  try {
    const cache = getDemoCacheMap();
    cache[analysis.id] = analysis;
    localStorage.setItem(DEMO_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to cache demo analysis:', e);
  }
}

export function getDemoCachedAnalysis(id: string): AnalysisResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const cache = getDemoCacheMap();
    return cache[id] || null;
  } catch {
    return null;
  }
}

function getDemoCacheMap(): Record<string, AnalysisResult> {
  try {
    const raw = localStorage.getItem(DEMO_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
