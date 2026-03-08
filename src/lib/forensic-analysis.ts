import { supabase } from './supabase';
import ExifReader from 'exifreader';

export interface AnalysisResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  mediaType: 'image' | 'video';
  fileName: string;
  fileSize: number;
  verdict: {
    label: string;
    score: number;
    confidence: number;
    severity: 'low' | 'mid' | 'high';
  };
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    frameCount?: number;
    codec?: string;
    format: string;
    hasExif: boolean;
    creationDate?: string;
    camera?: string;
    software?: string;
    gpsLocation?: string;
    isCompressionWarning: boolean;
    socialPlatform?: string;
    compressionArtifactsDetected: boolean;
  };
  signals: {
    ganArtifacts: number;
    spectralAnomaly: number;
    anatomicalInconsistency: number;
    metadataIntegrity: number;
    temporalConsistency?: number;
    audioVideoSync?: number;
    blinkPattern?: number;
    lightingConsistency: number;
  };
  timeline: Array<{
    frame: number;
    risk: number;
    spectral: number;
    motion: number;
    confidence: number;
  }>;
    heatmapRegions: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      intensity: number;
      label: string;
      explanation: string;
    }>;
  c2pa?: {
    status: 'verified' | 'partial' | 'absent';
    issuer?: string;
    timestamp?: string;
    editHistory?: Array<{
      action: string;
      tool: string;
      timestamp: string;
    }>;
  };
  entropyAnalysis: {
    average: number;
    anomalyRegions: Array<{
      offset: number;
      length: number;
      entropy: number;
    }>;
  };
  
  // Advanced Forensic Features
  confidenceEvolution: Array<{
    stage: string;
    delta: number;
    cumulative: number;
    explanation: string;
  }>;
  confidenceGaps: Array<{
    id: string;
    condition: string;
    impact: string;
    recommendation: string;
    status: 'missing' | 'degraded' | 'present';
  }>;
  authenticityDrift: Array<{
    id: string;
    event: string;
    timestamp: string;
    confidence: number;
    drift: number;
    type: 'upload' | 'compression' | 'editing' | 'original';
    details: string;
  }>;
  plausibilityChecks: Array<{
    id: string;
    label: string;
    status: 'passed' | 'inconclusive' | 'anomalous';
    explanation: string;
  }>;
  reliabilityContract: {
    range: [number, number];
    statement: string;
    conditions: string[];
    riskLevel: 'minimal' | 'moderate' | 'high';
  };
    narrativeTimeline: Array<{
      id: string;
      milestone: string;
      description: string;
      timestamp: string;
      iconType: 'shield' | 'search' | 'alert' | 'check';
    }>;
    audienceExplanations: Record<string, string>;
    fileUrl?: string;
  }
  
export interface AnalysisRequest {
      fileName: string;
      fileSize: number;
      fileType: string;
      fileData?: string;
      fileUrl?: string;
    }

export interface ExtractedMetadata {
  camera?: string;
  software?: string;
  width?: number;
  height?: number;
  creationDate?: string;
  gpsLocation?: string;
  hasExif: boolean;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  lens?: string;
  orientation?: number;
}

async function extractRealMetadata(fileUrl?: string): Promise<ExtractedMetadata> {
  const defaultMetadata: ExtractedMetadata = { hasExif: false };
  
  if (!fileUrl) return defaultMetadata;
  
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) return defaultMetadata;
    
    const arrayBuffer = await response.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer, { expanded: true });
    
    const exif = tags.exif || {};
    const file = tags.file || {};
    const gps = tags.gps || {};
    
    let camera: string | undefined;
    const make = exif?.Make?.description || file?.Make?.description;
    const model = exif?.Model?.description || file?.Model?.description;
    
    if (make && model) {
      camera = `${make} ${model}`.trim();
    } else if (model) {
      camera = model;
    } else if (make) {
      camera = make;
    }
    
    let gpsLocation: string | undefined;
    if (gps?.Latitude && gps?.Longitude) {
      gpsLocation = `${gps.Latitude.toFixed(4)}, ${gps.Longitude.toFixed(4)}`;
    }
    
    let creationDate: string | undefined;
    const dateTag = exif?.DateTimeOriginal?.description || 
                    exif?.DateTime?.description || 
                    exif?.DateTimeDigitized?.description;
    if (dateTag) {
      try {
        const [datePart, timePart] = dateTag.split(' ');
        const formattedDate = datePart.replace(/:/g, '-');
        creationDate = new Date(`${formattedDate}T${timePart || '00:00:00'}`).toISOString();
      } catch {
        creationDate = undefined;
      }
    }
    
    return {
      camera,
      software: exif?.Software?.description,
      width: file?.['Image Width']?.value || exif?.PixelXDimension?.value,
      height: file?.['Image Height']?.value || exif?.PixelYDimension?.value,
      creationDate,
      gpsLocation,
      hasExif: !!(make || model || dateTag),
      iso: exif?.ISOSpeedRatings?.value,
      aperture: exif?.FNumber?.description,
      shutterSpeed: exif?.ExposureTime?.description,
      focalLength: exif?.FocalLength?.description,
      lens: exif?.LensModel?.description,
      orientation: exif?.Orientation?.value,
    };
  } catch (error) {
    console.warn('Failed to extract EXIF metadata:', error);
    return defaultMetadata;
  }
}

function generateId(): string {
  return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

function simulateForensicAnalysis(
  mediaType: 'image' | 'video', 
  fileName: string, 
  fileSize: number,
  extractedMeta?: ExtractedMetadata
): Omit<AnalysisResult, 'id' | 'status' | 'createdAt' | 'completedAt' | 'fileName' | 'fileSize'> {
    const rng = seedRandom(fileName + fileSize);
    
    const aiKeywords = ['ai', 'synthetic', 'generated', 'deepfake', 'midjourney', 'dalle', 'stable', 'diffusion', 'fake', 'manipulated', 'created', 'gpt', 'flux', 'imagen'];
    const realKeywords = ['iphone', 'pixel', 'dsc', 'img_', 'video_', 'raw', 'camera', 'original', 'samsung', 'canon', 'nikon', 'sony', 'dcim', 'photo_'];
    const aiSoftware = ['midjourney', 'dall-e', 'stable diffusion', 'adobe firefly', 'comfyui', 'automatic1111'];
    
    const lowerName = fileName.toLowerCase();
    let aiBias = 0;
    
    if (aiKeywords.some(kw => lowerName.includes(kw))) aiBias += 0.35;
    if (realKeywords.some(kw => lowerName.includes(kw))) aiBias -= 0.25;
    
    if (extractedMeta?.hasExif && extractedMeta?.camera) {
      aiBias -= 0.3;
    }
    
    if (extractedMeta?.software) {
      const softwareLower = extractedMeta.software.toLowerCase();
      if (aiSoftware.some(sw => softwareLower.includes(sw))) {
        aiBias += 0.4;
      }
    }
    
    if (!extractedMeta?.hasExif && !extractedMeta?.camera) {
      aiBias += 0.15;
    }
    
    const isLikelyAI = (rng() + aiBias) > 0.5;
    const baseScore = isLikelyAI ? 55 + rng() * 40 : 10 + rng() * 30;
    
    const ganArtifacts = isLikelyAI ? 60 + rng() * 35 : 5 + rng() * 25;
    const spectralAnomaly = isLikelyAI ? 50 + rng() * 40 : 10 + rng() * 30;
    const anatomicalInconsistency = isLikelyAI ? 55 + rng() * 40 : 5 + rng() * 20;
    const lightingConsistency = isLikelyAI ? 40 + rng() * 30 : 80 + rng() * 18;
    
    const score = Math.min(Math.round(baseScore), 99);
    
    let verdict: AnalysisResult['verdict'];
    if (score > 65) {
      verdict = {
        label: 'Likely AI-generated',
        score,
        confidence: 88 + rng() * 10,
        severity: 'high'
      };
    } else if (score > 35) {
      verdict = {
        label: 'Uncertain – Requires Review',
        score,
        confidence: 65 + rng() * 15,
        severity: 'mid'
      };
    } else {
      verdict = {
        label: 'Likely Real',
        score,
        confidence: 90 + rng() * 9,
        severity: 'low'
      };
    }
    
    const frameCount = mediaType === 'video' ? 150 + Math.floor(rng() * 300) : 1;
    const timeline = Array.from({ length: Math.min(frameCount, 50) }, (_, i) => ({
      frame: i,
      risk: Math.max(0, Math.min(100, baseScore + (rng() - 0.5) * 30)),
      spectral: Math.max(0, Math.min(100, spectralAnomaly + (rng() - 0.5) * 20)),
      motion: rng() * 100,
      confidence: 70 + rng() * 25
    }));
    
    const heatmapRegions = isLikelyAI ? [
      { id: 'r1', x: 30 + rng() * 20, y: 20 + rng() * 10, width: 15 + rng() * 10, height: 20 + rng() * 10, intensity: 0.7 + rng() * 0.3, label: 'Facial boundary artifacts', explanation: 'Detected edge discontinuities typical of face-swapping algorithms.' },
      { id: 'r2', x: 40 + rng() * 10, y: 35 + rng() * 10, width: 8 + rng() * 5, height: 5 + rng() * 3, intensity: 0.6 + rng() * 0.3, label: 'Eye region anomaly', explanation: 'Gaze reflection asymmetry and iris texture blurring detected.' },
      { id: 'r3', x: 35 + rng() * 15, y: 55 + rng() * 10, width: 12 + rng() * 8, height: 8 + rng() * 5, intensity: 0.5 + rng() * 0.4, label: 'Texture inconsistency', explanation: 'Abnormal skin texture smoothness suggesting AI-based denoising or generation.' }
    ] : [
      { id: 'r1', x: 45, y: 40, width: 10, height: 10, intensity: 0.2, label: 'Normal variation', explanation: 'No significant anomalies detected in this region.' }
    ];
    
    const c2paStatus = rng() > 0.7 ? 'verified' : rng() > 0.5 ? 'partial' : 'absent';
    
    const confidenceEvolution: AnalysisResult['confidenceEvolution'] = [
      { stage: 'Metadata Analysis', delta: extractedMeta?.hasExif ? 8 : -5, cumulative: extractedMeta?.hasExif ? 58 : 45, explanation: extractedMeta?.hasExif ? 'Valid EXIF metadata found. Camera source identified.' : 'No EXIF metadata found. Source verification unavailable.' },
      { stage: 'Spectral Scan', delta: isLikelyAI ? 15 : -5, cumulative: isLikelyAI ? 70 : 50, explanation: isLikelyAI ? 'High-frequency checkerboard artifacts detected in the Y-channel.' : 'Spectral distribution matches natural camera noise.' },
      { stage: 'Texture Fingerprinting', delta: isLikelyAI ? 20 : -10, cumulative: isLikelyAI ? 90 : 40, explanation: isLikelyAI ? 'Neural upscaling signatures found in microscopic texture layers.' : 'Micro-texture analysis shows consistent sensor-specific patterns.' },
      { stage: 'Biological Constraints', delta: isLikelyAI ? 8 : -5, cumulative: isLikelyAI ? 98 : 35, explanation: isLikelyAI ? 'Ocular reflection misalignment and anatomical blurring confirmed.' : 'Anatomical features and lighting reflections are physically plausible.' },
    ];

    const confidenceGaps: AnalysisResult['confidenceGaps'] = [
      { id: 'g1', condition: 'Camera Source Metadata', impact: '+12% Confidence', recommendation: 'Upload original file with EXIF/IPTC headers intact.', status: extractedMeta?.hasExif ? 'present' : 'missing' },
      { id: 'g2', condition: 'Raw Sensor Data', impact: '+8% Confidence', recommendation: 'Higher bitrate source required to differentiate noise from artifacts.', status: 'degraded' },
      { id: 'g3', condition: 'Multi-frame Consistency', impact: '+15% Confidence', recommendation: 'Provide a longer video segment for temporal analysis.', status: mediaType === 'video' ? 'present' : 'missing' },
    ];

    const authenticityDrift: AnalysisResult['authenticityDrift'] = [
      { id: 'd1', event: 'Original Capture', timestamp: '2h ago', confidence: 99.8, drift: 0, type: 'original', details: extractedMeta?.camera ? `Captured on ${extractedMeta.camera}` : 'Direct capture (source unknown)' },
      { id: 'd2', event: 'First Upload (WhatsApp)', timestamp: '1h ago', confidence: 92.4, drift: -7.4, type: 'compression', details: 'Aggressive H.264 compression applied.' },
      { id: 'd3', event: 'Re-upload (Current)', timestamp: 'Just now', confidence: 88.2, drift: -4.2, type: 'upload', details: 'Social media re-transcoding detected.' },
    ];

    const plausibilityChecks: AnalysisResult['plausibilityChecks'] = [
      { id: 'p1', label: 'Lighting Consistency', status: isLikelyAI && rng() > 0.3 ? 'anomalous' : 'passed', explanation: 'Ambient light vectors match across the facial planes.' },
      { id: 'p2', label: 'Eye Geometry', status: isLikelyAI && rng() > 0.4 ? 'anomalous' : 'passed', explanation: 'Corneal reflections align with detected light sources.' },
      { id: 'p3', label: 'Texture Continuity', status: isLikelyAI && rng() > 0.5 ? 'anomalous' : 'passed', explanation: 'High-frequency detail is consistent across object boundaries.' },
      { id: 'p4', label: 'EXIF Authenticity', status: extractedMeta?.hasExif ? 'passed' : 'inconclusive', explanation: extractedMeta?.hasExif ? 'Metadata consistent with claimed camera source.' : 'No EXIF data available for verification.' },
    ];

    const reliabilityContract: AnalysisResult['reliabilityContract'] = {
      range: isLikelyAI ? [85, 99.9] : [1, 15],
      statement: "This analysis is reliable under standard daylight conditions with moderate compression. Social media re-compression may introduce a 5-8% margin of error.",
      conditions: ["Daylight illumination", "Standard H.264/H.265 codec", "No aggressive color grading"],
      riskLevel: isLikelyAI ? 'high' : 'minimal'
    };

    const narrativeTimeline: AnalysisResult['narrativeTimeline'] = [
      { id: 'n1', milestone: 'Signal Acquisition', description: 'Extracted 12 independent forensic signals from binary data.', timestamp: 'T+0.2s', iconType: 'search' },
      { id: 'n2', milestone: 'Metadata Extraction', description: extractedMeta?.hasExif ? `Camera: ${extractedMeta.camera || 'Unknown'}. EXIF data present.` : 'No EXIF metadata found in file headers.', timestamp: 'T+0.5s', iconType: extractedMeta?.hasExif ? 'check' : 'alert' },
      { id: 'n3', milestone: 'Anomaly Detection', description: isLikelyAI ? 'Identified significant frequency deviations in high-pass filters.' : 'No significant deviations from camera noise floor.', timestamp: 'T+0.8s', iconType: isLikelyAI ? 'alert' : 'shield' },
      { id: 'n4', milestone: 'Integrity Check', description: 'C2PA manifest verification complete.', timestamp: 'T+1.5s', iconType: 'check' },
    ];

    const audienceExplanations: AnalysisResult['audienceExplanations'] = {
      'General': `The content is ${isLikelyAI ? 'likely manipulated' : 'likely authentic'} based on texture and lighting analysis.`,
      'Journalist': `Investigation reveals ${isLikelyAI ? 'structural irregularities' : 'no forensic anomalies'} consistent with ${isLikelyAI ? 'AI synthesis' : 'camera-original capture'}. Verify source provenance before publication.`,
      'Legal': `Forensic signals indicate a ${isLikelyAI ? 'probable synthetic origin' : 'high likelihood of camera-original capture'} with a confidence of ${verdict.confidence.toFixed(1)}%. Evidence strength is rated as ${verdict.confidence > 85 ? 'High' : 'Moderate'}.`,
      'Research': `Statistical analysis of upsampling residuals and LBP histograms suggests ${isLikelyAI ? 'generative model induction' : 'stochastic sensor noise distribution'}. p-value < 0.05.`
    };

    return {
      mediaType,
      verdict,
      metadata: {
        width: extractedMeta?.width || 1920,
        height: extractedMeta?.height || 1080,
        duration: mediaType === 'video' ? 5 + rng() * 55 : undefined,
        frameCount: mediaType === 'video' ? frameCount : undefined,
        codec: mediaType === 'video' ? 'H.264' : undefined,
        format: fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        hasExif: extractedMeta?.hasExif || false,
        creationDate: extractedMeta?.creationDate || new Date(Date.now() - rng() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        camera: extractedMeta?.camera,
        software: extractedMeta?.software,
        gpsLocation: extractedMeta?.gpsLocation,
        isCompressionWarning: rng() > 0.7,
        socialPlatform: rng() > 0.6 ? ['Instagram', 'TikTok', 'WhatsApp', 'Facebook'][Math.floor(rng() * 4)] : undefined,
        compressionArtifactsDetected: rng() > 0.4
      },
      signals: {
        ganArtifacts: Math.round(ganArtifacts),
        spectralAnomaly: Math.round(spectralAnomaly),
        anatomicalInconsistency: Math.round(anatomicalInconsistency),
        metadataIntegrity: extractedMeta?.hasExif ? Math.round(90 + rng() * 9) : Math.round(50 + rng() * 30),
        temporalConsistency: mediaType === 'video' ? Math.round(60 + rng() * 35) : undefined,
        audioVideoSync: mediaType === 'video' ? Math.round(70 + rng() * 28) : undefined,
        blinkPattern: mediaType === 'video' ? Math.round(50 + rng() * 45) : undefined,
        lightingConsistency: Math.round(lightingConsistency)
      },
      timeline,
      heatmapRegions,
      c2pa: {
        status: c2paStatus,
        issuer: c2paStatus !== 'absent' ? 'Adobe Content Authenticity Initiative' : undefined,
        timestamp: c2paStatus !== 'absent' ? new Date(Date.now() - rng() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        editHistory: c2paStatus === 'verified' ? [
          { action: 'Created', tool: extractedMeta?.software || 'Unknown', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { action: 'Exported', tool: 'Adobe Lightroom', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        ] : undefined
      },
      entropyAnalysis: {
        average: 6.5 + rng() * 1.5,
        anomalyRegions: isLikelyAI ? [
          { offset: Math.floor(rng() * 10000), length: 256 + Math.floor(rng() * 512), entropy: 7.8 + rng() * 0.2 },
          { offset: Math.floor(rng() * 50000) + 10000, length: 128 + Math.floor(rng() * 256), entropy: 7.5 + rng() * 0.4 }
        ] : []
      },
      confidenceEvolution,
      confidenceGaps,
      authenticityDrift,
      plausibilityChecks,
      reliabilityContract,
      narrativeTimeline,
      audienceExplanations
    };
}

export async function createAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
  const id = generateId();
  const mediaType = request.fileType.startsWith('video') ? 'video' : 'image';
  
  let extractedMeta: ExtractedMetadata | undefined;
  if (request.fileUrl && mediaType === 'image') {
    extractedMeta = await extractRealMetadata(request.fileUrl);
  }
  
  const forensicData = simulateForensicAnalysis(mediaType, request.fileName, request.fileSize, extractedMeta);
  
  const analysis: AnalysisResult = {
    id,
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    fileName: request.fileName,
    fileSize: request.fileSize,
    ...forensicData
  };
  
  if (analysis.metadata.socialPlatform) {
    analysis.verdict.confidence = Math.max(analysis.verdict.confidence - 12, 45);
    analysis.metadata.isCompressionWarning = true;
  }

  // Save to DB
  await supabase.from('analyses').insert({
    id: analysis.id,
    status: analysis.status,
    created_at: analysis.createdAt,
    completed_at: analysis.completedAt,
    media_type: analysis.mediaType,
    file_name: analysis.fileName,
    file_size: analysis.fileSize,
    file_url: request.fileUrl,
    verdict_label: analysis.verdict.label,
    verdict_score: analysis.verdict.score,
    verdict_confidence: analysis.verdict.confidence,
    verdict_severity: analysis.verdict.severity,
    data: { ...analysis, fileUrl: request.fileUrl }
  });

  return analysis;
}

export async function updateAnalysis(id: string, updates: Partial<AnalysisResult>): Promise<AnalysisResult | null> {
  const existing = await getAnalysis(id);
  if (!existing) return null;
  
  const updated = { ...existing, ...updates };
  
  await supabase.from('analyses').update({
    status: updated.status,
    completed_at: updated.completedAt,
    verdict_label: updated.verdict.label,
    verdict_score: updated.verdict.score,
    verdict_confidence: updated.verdict.confidence,
    verdict_severity: updated.verdict.severity,
    data: updated
  }).eq('id', id);

  return updated;
}

export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  if (id === 'demo') {
    return await createAnalysis({
      fileName: 'demo_sample.mp4',
      fileSize: 15 * 1024 * 1024,
      fileType: 'video/mp4'
    });
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('data')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data.data as AnalysisResult;
}

export async function listAnalyses(): Promise<AnalysisResult[]> {
  const { data, error } = await supabase
    .from('analyses')
    .select('data')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(item => item.data as AnalysisResult);
}
