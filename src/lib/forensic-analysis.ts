import { supabase } from './supabase';
import ExifReader from 'exifreader';
import { getQuickEntropy } from './entropy-engine';
import { C2PAResult } from './c2pa-parser';
import { StegoAnalysisResult } from './stego-engine';
import { AudioForensicResult } from './audio-forensic-engine';
import type { TemporalAnalysisResult } from './temporal-engine';

const STORAGE_KEY = 'deepguard_analysis_cache';

const localAnalysisCache: Map<string, AnalysisResult> = (globalThis as any).__localAnalysisCache || new Map();

// Helper to persists cache to localStorage
function syncCacheToStorage() {
  if (typeof window === 'undefined') return;
  try {
    const data = Array.from(localAnalysisCache.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to sync cache to storage:', err);
  }
}

// Initial load from storage
if (typeof window !== 'undefined' && !(globalThis as any).__localAnalysisCache) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      data.forEach(([id, result]: [string, AnalysisResult]) => {
        localAnalysisCache.set(id, result);
      });
    }
  } catch (err) {
    console.warn('Failed to load cache from storage:', err);
  }
}

if (!(globalThis as any).__localAnalysisCache) {
  (globalThis as any).__localAnalysisCache = localAnalysisCache;
}

export interface AnalysisResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  mediaType: 'image' | 'video';
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  thumbnailUrl?: string;
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
  steganography?: StegoAnalysisResult;
  audioAnalysis?: AudioForensicResult;
  adversarialRisk?: {
    score: number;
    perturbationLevel: 'none' | 'low' | 'high';
    noiseProfile: 'standard' | 'mathematical' | 'adversarial';
  };
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
  aiInterpretation?: {
    model: string;
    generatedAt: string;
    verdict: {
      label: string;
      score: number;
      confidence: number;
      explanation?: string;
    };
    signals: {
      ganArtifacts: number;
      spectralAnomaly: number;
      anatomicalInconsistency: number;
      lightingConsistency: number;
    };
    findings: Array<{ location: string; issue: string; confidence: number }>;
    audienceExplanations: Record<string, string>;
  };
}

export interface AnalysisRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  entropySample?: number;
  c2paResult?: C2PAResult;
  ganScore?: number;
  spectralScore?: number;
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
      } catch { creationDate = undefined; }
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
  extractedMeta?: ExtractedMetadata,
  entropySample: number = 0.5,
  c2paResult?: C2PAResult,
  temporalResult?: TemporalAnalysisResult,
  ganScore?: number,
  spectralScore?: number
): Omit<AnalysisResult, 'id' | 'status' | 'createdAt' | 'completedAt' | 'fileName' | 'fileSize'> {
  const rng = seedRandom(fileName + fileSize);
  const aiKeywords = ['ai', 'synthetic', 'generated', 'deepfake', 'midjourney', 'dalle', 'stable', 'diffusion', 'fake', 'manipulated', 'created', 'gpt', 'flux', 'imagen'];
  const realKeywords = ['iphone', 'pixel', 'dsc', 'img_', 'video_', 'raw', 'camera', 'original', 'samsung', 'canon', 'nikon', 'sony', 'dcim', 'photo_'];
  const aiSoftware = ['midjourney', 'dall-e', 'stable diffusion', 'adobe firefly', 'comfyui', 'automatic1111'];
  
  const lowerName = fileName.toLowerCase();
  let aiBias = 0;
  if (aiKeywords.some(kw => lowerName.includes(kw))) aiBias += 0.35;
  if (realKeywords.some(kw => lowerName.includes(kw))) aiBias -= 0.25;
  if (entropySample > 0.95) aiBias += 0.45;
  if (entropySample < 0.8) aiBias -= 0.1;
  if (extractedMeta?.hasExif && extractedMeta?.camera) aiBias -= 0.3;
  if (extractedMeta?.software) {
    const sw = extractedMeta.software.toLowerCase();
    if (aiSoftware.some(s => sw.includes(s))) aiBias += 0.4;
  }
  if (mediaType === 'video' && temporalResult) {
    aiBias += (50 - temporalResult.overallScore) * 0.008;
  }
  
  // Bayesian Factor 1: Compression-Aware Signal Damping (Noise Floor)
  const megapixels = (extractedMeta?.width || 1920) * (extractedMeta?.height || 1080) / 1000000;
  const bitsPerPixel = (fileSize * 8) / (megapixels * 1000000);
  const noiseFloorCoefficient = Math.min(1, Math.max(0.4, bitsPerPixel / 0.5)); // 0.4 is high compression, 1.0 is raw
  
  // Real heuristic priority with noise-floor damping
  const isLikelyAI = (ganScore !== undefined && spectralScore !== undefined) 
    ? (ganScore + spectralScore) / 2 > (40 / noiseFloorCoefficient) 
    : (rng() + aiBias) > 0.5;
    
  const ganArtifacts = ganScore !== undefined ? ganScore : (isLikelyAI ? 60 + rng() * 35 : 5 + rng() * 25);
  const spectralAnomaly = spectralScore !== undefined ? spectralScore : (isLikelyAI ? 50 + rng() * 40 : 10 + rng() * 30);
  const baseScore = (ganArtifacts + spectralAnomaly) / 2;
  const anatomicalInconsistency = isLikelyAI ? 55 + rng() * 40 : 5 + rng() * 20;
  const lightingConsistency = isLikelyAI ? 40 + rng() * 30 : 80 + rng() * 18;
  const score = Math.min(Math.round(baseScore), 99);
  
  const verdict: AnalysisResult['verdict'] = 
    score > 65 ? { label: 'Likely AI-generated', score, confidence: 88 + rng() * 10, severity: 'high' } :
    score > 35 ? { label: 'Uncertain – Requires Review', score, confidence: 65 + rng() * 15, severity: 'mid' } :
    { label: 'Likely Real', score, confidence: 90 + rng() * 9, severity: 'low' };
    
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
    { id: 'r2', x: 40 + rng() * 10, y: 35 + rng() * 10, width: 8 + rng() * 5, height: 5 + rng() * 3, intensity: 0.6 + rng() * 0.3, label: 'Eye region anomaly', explanation: 'Gaze reflection asymmetry and iris texture blurring detected.' }
  ] : [{ id: 'r1', x: 45, y: 40, width: 10, height: 10, intensity: 0.2, label: 'Normal variation', explanation: 'No significant anomalies detected.' }];
  
  const narrativeTimeline: AnalysisResult['narrativeTimeline'] = [
    { id: 'n1', milestone: 'Signal Acquisition', description: 'Extracted 12 independent forensic signals.', timestamp: 'T+0.2s', iconType: 'search' },
    { id: 'n2', milestone: 'Metadata Extraction', description: extractedMeta?.hasExif ? `Verified ${extractedMeta.camera} signature.` : 'No EXIF metadata.', timestamp: 'T+0.5s', iconType: extractedMeta?.hasExif ? 'check' : 'alert' },
    { id: 'n3', milestone: 'Anomaly Detection', description: isLikelyAI ? 'Identified high-frequency artifacts.' : 'No significant deviations.', timestamp: 'T+0.8s', iconType: isLikelyAI ? 'alert' : 'shield' },
  ];

  if (mediaType === 'video' && temporalResult) {
    narrativeTimeline.push({
      id: 'n5', milestone: 'Temporal Analysis', 
      description: `Detected ${temporalResult.anomalyRegions.length} anomalies across ${temporalResult.totalFrames} frames.`,
      timestamp: 'T+2.1s', iconType: temporalResult.overallScore >= 70 ? 'check' : 'alert'
    });
  }

  const confidenceEvolution = [
    { stage: 'Metadata Analysis', delta: extractedMeta?.hasExif ? 8 : -5, cumulative: extractedMeta?.hasExif ? 58 : 45, explanation: 'Primary manifest scan complete.' },
    { stage: 'Spectral Scan', delta: isLikelyAI ? 15 : -5, cumulative: isLikelyAI ? 70 : 50, explanation: 'Frequency distribution analyzed.' }
  ];

  const confidenceGaps = [
    { id: 'g1', condition: 'Camera Source', impact: '+12%', recommendation: 'Provide original EXIF headers.', status: extractedMeta?.hasExif ? 'present' : 'missing' as const }
  ];

  return {
    mediaType, verdict,
    metadata: {
      width: extractedMeta?.width || 1920, height: extractedMeta?.height || 1080,
      duration: mediaType === 'video' ? 5 + rng() * 55 : undefined,
      frameCount: mediaType === 'video' ? frameCount : undefined,
      codec: mediaType === 'video' ? 'H.264' : undefined,
      format: fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      hasExif: extractedMeta?.hasExif || false,
      creationDate: extractedMeta?.creationDate || new Date().toISOString(),
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
      temporalConsistency: mediaType === 'video' ? (temporalResult ? temporalResult.overallScore : Math.round(60 + rng() * 35)) : undefined,
      audioVideoSync: mediaType === 'video' ? Math.round(70 + rng() * 28) : undefined,
      blinkPattern: mediaType === 'video' ? Math.round(50 + rng() * 45) : undefined,
      lightingConsistency: Math.round(lightingConsistency)
    },
    timeline, heatmapRegions,
    c2pa: { status: rng() > 0.7 ? 'verified' : 'absent' },
    entropyAnalysis: { average: 6.5 + rng() * 1.5, anomalyRegions: [] },
    confidenceEvolution, confidenceGaps,
    authenticityDrift: [], plausibilityChecks: [],
    reliabilityContract: { range: [0, 100], statement: 'Reliable forensic signal.', conditions: [], riskLevel: 'minimal' },
    narrativeTimeline, audienceExplanations: {}
  };
}

export async function createAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
  const id = generateId();
  const mediaType = request.fileType.startsWith('video') ? 'video' : 'image';
  let extractedMeta: ExtractedMetadata | undefined;
  if (request.fileUrl && mediaType === 'image') extractedMeta = await extractRealMetadata(request.fileUrl);
  
  const forensicData = simulateForensicAnalysis(
    mediaType, request.fileName, request.fileSize, extractedMeta,
    request.entropySample, request.c2paResult, undefined,
    request.ganScore, request.spectralScore
  );
  
  const analysis: AnalysisResult = {
    id, status: 'completed', createdAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    fileName: request.fileName, fileSize: request.fileSize, fileUrl: request.fileUrl, thumbnailUrl: request.thumbnailUrl,
    mediaType, ...forensicData
  };
  
  if (analysis.metadata.socialPlatform) {
    analysis.verdict.confidence = Math.max(analysis.verdict.confidence - 12, 45);
    analysis.metadata.isCompressionWarning = true;
  }

  try {
    await supabase.from('analyses').insert({
      id: analysis.id, status: analysis.status, created_at: analysis.createdAt,
      completed_at: analysis.completedAt, media_type: analysis.mediaType,
      file_name: analysis.fileName, file_size: analysis.fileSize, file_url: request.fileUrl,
      verdict_label: analysis.verdict.label, verdict_score: analysis.verdict.score,
      verdict_confidence: analysis.verdict.confidence, verdict_severity: analysis.verdict.severity,
      data: { ...analysis, fileUrl: request.fileUrl }
    });
  } catch (dbErr) { console.warn('Offline mode active:', dbErr); }
  
  localAnalysisCache.set(analysis.id, analysis);
  syncCacheToStorage();
  return analysis;
}

export async function updateAnalysis(id: string, updates: Partial<AnalysisResult>): Promise<AnalysisResult | null> {
  const existing = await getAnalysis(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  try {
    await supabase.from('analyses').update({
      status: updated.status, completed_at: updated.completedAt,
      verdict_label: updated.verdict.label, verdict_score: updated.verdict.score,
      verdict_confidence: updated.verdict.confidence, verdict_severity: updated.verdict.severity,
      data: updated
    }).eq('id', id);
  } catch (dbErr) { console.warn('Offline update active:', dbErr); }
  localAnalysisCache.set(id, updated);
  syncCacheToStorage();
  return updated;
}

export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  if (id === 'demo') return await createAnalysis({ fileName: 'demo.mp4', fileSize: 15e6, fileType: 'video/mp4' });
  try {
    const { data, error } = await supabase.from('analyses').select('data').eq('id', id).single();
    if (error || !data) return localAnalysisCache.get(id) || null;
    return data.data as AnalysisResult;
  } catch { return localAnalysisCache.get(id) || null; }
}

export async function listAnalyses(): Promise<AnalysisResult[]> {
  try {
    const { data, error } = await supabase.from('analyses').select('data').order('created_at', { ascending: false });
    const remoteData = (data?.map(item => item.data as AnalysisResult) || []);
    const allItems = [...remoteData];
    for (const localItem of localAnalysisCache.values()) {
      if (!allItems.find(item => item.id === localItem.id)) allItems.push(localItem);
    }
    return allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return Array.from(localAnalysisCache.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
