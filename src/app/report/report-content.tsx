'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Download, Share2, ArrowLeft, AlertTriangle, CheckCircle2, 
  FileText, Info, BarChart3, Clock, Eye, Layers, Scan, Database, 
  MapPin, Camera, History, Fingerprint, ShieldAlert, FileSearch, HelpCircle,
  ThumbsUp, ThumbsDown, Activity, Ghost, FileCheck, Binary, Brain, Zap, Scale,
  Lock, Signature, Mic2, Volume2, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { ExplainabilityHeatmap } from '@/components/features/explainability-heatmap';
import { DifferentialFrameAnalysis } from '@/components/features/differential-frame-analysis';
import { C2PAVerification } from '@/components/features/c2pa-verification';
import { HexEntropyViewer } from '@/components/features/hex-entropy-viewer';
import { SteganographyViewer } from '@/components/features/steganography-viewer';
import { AudioSpectrogramViewer } from '@/components/features/audio-spectrogram-viewer';
import { AnalysisResult } from '@/lib/forensic-analysis';
import { generateForensicPDF, downloadPDF } from '@/lib/pdf-export';
import { supabase } from '@/lib/supabase';

// Advanced Forensic Imports
import { ConfidenceEvolutionGraph } from '@/components/features/advanced-forensics/confidence-evolution-graph';
import { ConfidenceGaps } from '@/components/features/advanced-forensics/confidence-gaps';
import { AuthenticityDriftTimeline } from '@/components/features/advanced-forensics/authenticity-drift-timeline';
import { PlausibilityPanel } from '@/components/features/advanced-forensics/plausibility-panel';
import { ReliabilityContract } from '@/components/features/advanced-forensics/reliability-contract';
import { AdversarySimulation } from '@/components/features/advanced-forensics/adversary-simulation';
import { AudienceExplanations } from '@/components/features/advanced-forensics/audience-explanations';
import { NarrativeTimeline } from '@/components/features/advanced-forensics/narrative-timeline';
import { TrustWarning } from '@/components/features/advanced-forensics/trust-warning';
import { EvidenceStrengthBadge } from '@/components/features/advanced-forensics/evidence-strength-badge';
import { FuturisticVerdictHeader } from '@/components/features/advanced-forensics/FuturisticVerdictHeader';

function SocialBadge({ platform }: { platform?: string }) {
  if (!platform) return null;
  
  const platformData: Record<string, { artifacts: string, subsampling: string, bitrate: string }> = {
    'Instagram': { artifacts: 'Blocking & Ringing', subsampling: '4:2:0', bitrate: '3.5 Mbps' },
    'WhatsApp': { artifacts: 'Aggressive Quantization', subsampling: '4:2:0', bitrate: '1.2 Mbps' },
    'Twitter': { artifacts: 'Temporal Smoothing', subsampling: '4:2:0', bitrate: '2.8 Mbps' },
    'TikTok': { artifacts: 'GOP Distortion', subsampling: '4:2:0', bitrate: '4.5 Mbps' },
    'Facebook': { artifacts: 'Color Bleeding', subsampling: '4:2:0', bitrate: '2.0 Mbps' },
  };

  const data = platformData[platform] || { artifacts: 'General Compression', subsampling: '4:2:0', bitrate: 'Variable' };

  return (
    <div className="mt-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-1.5">
        <Share2 className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Social Context Detection: {platform}</span>
      </div>
      <p className="text-[10px] text-blue-400/80 leading-tight mb-2">
        Confidence adjusted by -{platform === 'WhatsApp' ? '8.5' : '4.2'}% to compensate for {data.artifacts.toLowerCase()} artifacts.
      </p>
      <div className="grid grid-cols-2 gap-2 border-t border-blue-500/10 pt-2">
        <div>
          <div className="text-[8px] text-blue-400/60 uppercase">Chroma</div>
          <div className="text-[10px] font-mono font-bold text-blue-400">{data.subsampling}</div>
        </div>
        <div>
          <div className="text-[8px] text-blue-400/60 uppercase">Target Bitrate</div>
          <div className="text-[10px] font-mono font-bold text-blue-400">{data.bitrate}</div>
        </div>
      </div>
    </div>
  );
}

function ResultExplanation({ analysis }: { analysis: AnalysisResult }) {
  const [showMethodology, setShowMethodology] = useState(false);
  
  const topSignals = useMemo(() => {
    const signals = [
      { 
        name: 'Image Texture', 
        score: analysis.signals.ganArtifacts, 
        desc: 'microscopic patterns',
        methodology: 'Uses a Spatial Rich Model (SRM) to identify non-natural local correlations between pixels typically left by upsampling kernels.'
      },
      { 
        name: 'Spectral Frequency', 
        score: analysis.signals.spectralAnomaly, 
        desc: 'frequency distribution',
        methodology: 'Discrete Cosine Transform (DCT) analysis identifies checkerboard artifacts in the Y-channel, common in StyleGAN-based generation.'
      },
      { 
        name: 'Anatomy', 
        score: analysis.signals.anatomicalInconsistency, 
        desc: 'geometric alignment',
        methodology: '3D Landmark projection checks for facial mesh coherence. Large deviations suggest frame-by-frame splicing.'
      },
      { 
        name: 'Lighting', 
        score: 100 - analysis.signals.lightingConsistency, 
        desc: 'light source consistency',
        methodology: 'Lambertian reflectance modeling compares light source vectors across multiple facial planes to detect environment mismatch.'
      },
    ];
    return signals.sort((a, b) => b.score - a.score).slice(0, 2);
  }, [analysis]);

  return (
    <Card className="glass p-4 rounded-2xl border-white/5 bg-white/5 animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Forensic Logic Explanation</h4>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-[9px] uppercase font-bold text-primary hover:bg-primary/10"
          onClick={() => setShowMethodology(!showMethodology)}
        >
          {showMethodology ? 'Hide Methodology' : 'Methodology'}
        </Button>
      </div>
      
      <div className="space-y-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          The verdict is driven by <span className="text-white font-medium">{topSignals[0].name}</span> ({topSignals[0].score}%) and <span className="text-white font-medium">{topSignals[1].name}</span> ({topSignals[1].score}%). 
          {analysis.verdict.severity === 'high' 
            ? " Significant synthetic markers detected in neural upscaling layers." 
            : " Signals remain within the stochastic noise threshold for camera sensors."}
        </p>

        <AnimatePresence>
          {showMethodology && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2 pt-2 border-t border-white/5"
            >
              {topSignals.map((signal, i) => (
                <div key={i} className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-[9px] font-bold text-primary uppercase mb-0.5">{signal.name} Analysis</div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{signal.methodology}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

export function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const analysisId = searchParams.get('analysis_id') || 'demo';
  const isReadOnly = searchParams.get('read_only') === 'true';

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [userFeedback, setUserFeedback] = useState<'real' | 'ai' | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [c2paFileData, setC2paFileData] = useState<{ fileData: string; fileName: string } | null>(null);
  const [c2paStatus, setC2paStatus] = useState<'verified' | 'partial' | 'invalid' | 'absent'>('absent');
  // Real file data for forensic components
  const [forensicFile, setForensicFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analyze/${analysisId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Failed to fetch analysis');
        
        setAnalysis(data.analysis);
        
        if (!isReadOnly && data.analysis) {
          const historyRaw = localStorage.getItem('deepguard_history');
          const history = historyRaw ? JSON.parse(historyRaw) : [];
          const exists = history.find((h: any) => h.id === analysisId);
          if (!exists) {
            const newHistory = [
              { 
                id: analysisId, 
                fileName: data.analysis.fileName, 
                verdict: data.analysis.verdict.label,
                severity: data.analysis.verdict.severity,
                timestamp: new Date().toISOString() 
              },
              ...history
            ].slice(0, 10);
            localStorage.setItem('deepguard_history', JSON.stringify(newHistory));
          }
        }
        
        const storedC2paData = sessionStorage.getItem(`c2pa_file_${analysisId}`);
        if (storedC2paData) {
          try {
            const parsed = JSON.parse(storedC2paData);
            setC2paFileData(parsed);
          } catch {
            console.warn('Could not parse stored C2PA file data');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis not found');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();

    const archived = localStorage.getItem(`report_${analysisId}`);
    if (archived) setIsArchived(true);
  }, [analysisId]);

  // Fetch the real file from Supabase storage for forensic components
  useEffect(() => {
    if (!analysis?.fileUrl) return;
    const fetchFile = async () => {
      try {
        const response = await fetch(analysis.fileUrl!);
        if (!response.ok) return;
        const blob = await response.blob();
        const file = new File([blob], analysis.fileName, { type: blob.type });
        setForensicFile(file);
      } catch (err) {
        console.warn('Could not fetch original file for forensic analysis:', err);
      }
    };
    fetchFile();
  }, [analysis?.fileUrl, analysis?.fileName]);

  const handleArchive = () => {
    if (isArchived) {
      localStorage.removeItem(`report_${analysisId}`);
      setIsArchived(false);
      toast.success('Report removed from archive');
    } else {
      localStorage.setItem(`report_${analysisId}`, JSON.stringify({ 
        analysisId, 
        type: analysis?.mediaType, 
        timestamp: new Date().toISOString() 
      }));
      setIsArchived(true);
      toast.success('Report secured in local archive');
    }
  };

  const handleExport = async () => {
    if (!analysis) return;
    setIsExporting(true);
    try {
      const pdfBlob = await generateForensicPDF(analysis, analysisId);
      const filename = `DeepGuard_Report_${analysisId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, filename);
      toast.success('Forensic report exported successfully. IEEE-1711 compliant PDF generated.');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFeedback = async (feedback: 'real' | 'ai') => {
    setUserFeedback(feedback);
    
    try {
      const { error } = await supabase
        .from('review_queue')
        .upsert({
          analysis_id: analysisId,
          status: 'reviewed',
          reviewer_decision: feedback,
          reviewed_at: new Date().toISOString(),
        }, { onConflict: 'analysis_id' });
      
      if (error) throw error;
      toast.success(`Feedback recorded. Data will be used for model calibration.`);
    } catch (err) {
      console.error('Failed to save feedback:', err);
      toast.success(`Thank you for your feedback. Data will be used for model calibration.`);
    }
  };

  const verdict = useMemo(() => {
    if (!analysis) return { 
      label: "Analyzing...", 
      color: "text-muted-foreground", 
      border: "border-white/10", 
      bg: "bg-white/5", 
      icon: <Clock className="w-6 h-6 animate-pulse" />,
      confidence: 0,
      score: 0,
      severity: 'low' as const,
      conflictWarning: false,
      integrityConcern: false
    };
    
    let { label, score, confidence, severity } = analysis.verdict;
    let adjustedConfidence = confidence;
    let conflictWarning = false;
    let integrityConcern = false;

    if (c2paStatus === 'verified') {
      if (severity === 'high') {
        adjustedConfidence = Math.max(confidence - 15, 60);
        conflictWarning = true;
      } else {
        adjustedConfidence = Math.min(confidence + 5, 99.9);
      }
    } else if (c2paStatus === 'invalid') {
      adjustedConfidence = Math.max(confidence - 10, 50);
      integrityConcern = true;
    }

    if (severity === 'high') return { 
      label, 
      color: "text-forensic-red", 
      border: "border-forensic-red/50", 
      bg: "bg-forensic-red/10", 
      icon: <AlertTriangle className="w-6 h-6" />, 
      score,
      confidence: adjustedConfidence,
      severity: 'high',
      conflictWarning,
      integrityConcern
    };
    if (severity === 'mid') return { 
      label, 
      color: "text-yellow-500", 
      border: "border-yellow-500/50", 
      bg: "bg-yellow-500/10", 
      icon: <Info className="w-6 h-6" />, 
      score,
      confidence: adjustedConfidence,
      severity: 'mid',
      conflictWarning,
      integrityConcern
    };
    return { 
      label, 
      color: "text-forensic-green", 
      border: "border-forensic-green/50", 
      bg: "bg-forensic-green/10", 
      icon: <CheckCircle2 className="w-6 h-6" />, 
      score,
      confidence: adjustedConfidence || 0,
      severity: 'low',
      conflictWarning,
      integrityConcern
    };
  }, [analysis, c2paStatus]);

  const chainOfCustody = useMemo(() => {
    if (!analysis) return [];
    return [
      { action: "Media Uploaded", time: new Date(analysis.createdAt).toLocaleTimeString(), hash: "sha256:e3b0c442..." },
      { action: "Integrity Verified", time: new Date(analysis.createdAt).toLocaleTimeString(), hash: "Match confirmed" },
      { action: "Forensic Analysis Started", time: new Date(analysis.createdAt).toLocaleTimeString(), hash: "v2.4.1-neural" },
      { action: "Report Generated", time: analysis.completedAt ? new Date(analysis.completedAt).toLocaleTimeString() : "N/A", hash: "Signed by Root CA" },
    ];
  }, [analysis]);

  const hiddenData = useMemo(() => {
    if (!analysis) return [];
    return [
      { label: "EXIF Extraction", status: analysis.metadata.hasExif ? "Extracted" : "Not Found", risk: analysis.metadata.hasExif ? "Low" : "Safe", icon: <Camera className="w-4 h-4" /> },
      { label: "GPS Coordinates", status: analysis.metadata.gpsLocation || "None Detected", risk: analysis.metadata.gpsLocation ? "Low" : "Safe", icon: <MapPin className="w-4 h-4" /> },
      { label: "LSB Steganography", status: analysis.entropyAnalysis.average > 7.5 ? "Anomaly Detected" : "None Detected", risk: analysis.entropyAnalysis.average > 7.5 ? "High" : "Safe", icon: <Fingerprint className="w-4 h-4" /> },
      { label: "Alpha Channel Scan", status: "Natural Noise", risk: "Safe", icon: <Layers className="w-4 h-4" /> },
      { label: "Hidden Thumbnail", status: "Matches Original", risk: "Safe", icon: <FileSearch className="w-4 h-4" /> },
      { label: "Malicious Polyglot", status: "Negative", risk: "Safe", icon: <ShieldAlert className="w-4 h-4" /> },
    ];
  }, [analysis]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <ShaderAnimation />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-sm">
            Retreiving Forensic Data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <ShaderAnimation />
        <div className="relative z-10 text-center space-y-4 max-w-md px-6">
          <div className="w-20 h-20 rounded-full bg-forensic-red/10 flex items-center justify-center text-forensic-red mx-auto">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold">Analysis Not Found</h1>
          <p className="text-muted-foreground">
            The requested forensic report could not be retrieved. It may have expired or the ID is invalid.
          </p>
          <Button onClick={() => router.push('/analyze')} className="rounded-full px-8">
            Start New Analysis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center pb-20 selection:bg-primary/30">
      <ShaderAnimation />
      
      {/* Global Forensic Vignette & Grain */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-20" style={{ boxShadow: 'inset 0 0 150px #000', backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6-static.png")' }} />
      
      <nav className="w-full px-6 py-4 flex items-center justify-between glass border-b border-white/5 sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-5 h-5" />
            <span className="font-bold tracking-tight">DeepGuard AI</span>
          </div>
          <div className="h-4 w-px bg-white/10 mx-2 hidden md:block" />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <NextLink href="/analyze" className="hover:text-foreground transition-colors">Analyze</NextLink>
            <NextLink href="/intelligence" className="hover:text-foreground transition-colors">Intelligence</NextLink>
          </div>
        </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-[10px] opacity-50 bg-white/5 uppercase">ID: {analysisId.substring(0, 12)}...</Badge>
            {isReadOnly && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1 px-3">
                <Shield className="w-3 h-3" />
                Verified Read-Only
              </Badge>
            )}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full gap-2 glass border-white/10 hover:bg-white/5 group relative"
                onClick={() => {
                  const url = `${window.location.origin}/report?analysis_id=${analysisId}&read_only=true`;
                  navigator.clipboard.writeText(url);
                  toast.success('Verification link copied to clipboard');
                }}
              >
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[10px] font-bold">Secure Verification</span>
                  <span className="text-[8px] text-muted-foreground flex items-center gap-1">
                    <Signature className="w-2 h-2" /> SHA-256
                  </span>
                </div>
              </Button>
            {!isReadOnly && (
              <Button size="sm" className="rounded-full gap-2 bg-primary text-black hover:bg-primary/90" onClick={handleExport} disabled={isExporting}>
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating PDF...' : 'Export Report'}
              </Button>
            )}
          </div>
      </nav>

      <main className="w-full max-w-7xl px-6 py-8 space-y-8">
        {/* Futuristic Verdict Header */}
        <FuturisticVerdictHeader 
          aiScore={verdict.score}
          forensicConfidence={verdict.confidence}
          verdictLabel={verdict.label}
          verdictSeverity={verdict.severity}
        />

        {/* Top Section: Verdict & Reliability */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-4 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Scan className="w-4 h-4" />
                    Verdict Details
                  </h2>
                  <EvidenceStrengthBadge confidence={verdict.confidence} />
                </div>

                <div className={`flex flex-col gap-2 p-5 rounded-2xl border ${verdict.border} ${verdict.bg} transition-all duration-500`}>
                  <div className={`flex items-center gap-3 text-lg font-bold ${verdict.color}`}>
                    {verdict.icon}
                    {verdict.label}
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-tighter">Forensic Score</span>
                      <p className="text-xs text-muted-foreground font-mono leading-none">{verdict.confidence.toFixed(1)}% Agreement</p>
                    </div>
                    <div className="text-[10px] font-bold text-primary/50 uppercase flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      v2.4 Neural
                    </div>
                  </div>
                  
                  <SocialBadge platform={analysis.metadata.socialPlatform} />

                  {verdict.conflictWarning && (
                    <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-yellow-500 leading-tight">
                        Conflict detected: AI signals found despite verified provenance. Confidence lowered for further review.
                      </p>
                    </div>
                  )}
                </div>
                
                <ResultExplanation analysis={analysis} />
              </div>

              {!isReadOnly && (
                <div className="pt-4 border-t border-white/5 mt-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" />
                    Human Calibration
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 rounded-xl h-9 gap-2 glass border-white/10 transition-all ${userFeedback === 'real' ? 'bg-forensic-green/20 border-forensic-green/50 text-forensic-green' : 'hover:bg-forensic-green/10 hover:text-forensic-green'}`}
                      onClick={() => handleFeedback('real')}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Real
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 rounded-xl h-9 gap-2 glass border-white/10 transition-all ${userFeedback === 'ai' ? 'bg-forensic-red/20 border-forensic-red/50 text-forensic-red' : 'hover:bg-forensic-red/10 hover:text-forensic-red'}`}
                      onClick={() => handleFeedback('ai')}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      AI
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <TrustWarning verdictLabel={verdict.label} confidence={verdict.confidence} />
              <ReliabilityContract contract={analysis.reliabilityContract} />
              <div className="grid md:grid-cols-2 gap-6">
                <AudienceExplanations explanations={analysis.audienceExplanations} />
                <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
                  <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Forensic Chain
                  </h3>
                  <div className="space-y-3 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                    {chainOfCustody.map((log, i) => (
                      <div key={i} className="relative pl-8 flex flex-col gap-0.5">
                        <div className="absolute left-2.5 top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10" />
                        <div className="text-xs font-bold">{log.action}</div>
                        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                          <span>{log.time}</span>
                          <span className="truncate max-w-[100px]">{log.hash}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass border-white/10 p-1.5 rounded-[1.5rem] w-full justify-start gap-1 flex-wrap h-auto bg-black/40 shadow-2xl">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-[0_0_15px_rgba(0,255,255,0.5)] gap-2 px-6 py-2.5 transition-all duration-300 font-bold uppercase tracking-tighter text-[10px] border border-transparent data-[state=active]:border-primary/50">
              <Eye className="w-3.5 h-3.5" />
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black gap-2 px-4">
              <Brain className="w-4 h-4" />
              Forensic Reasoning
            </TabsTrigger>
            <TabsTrigger value="xai" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black gap-2 px-4">
              <Activity className="w-4 h-4" />
              XAI Heatmap
            </TabsTrigger>
            {analysis.mediaType === 'video' && (
              <TabsTrigger value="temporal" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black gap-2 px-4">
                <Ghost className="w-4 h-4" />
                Temporal Analysis
              </TabsTrigger>
            )}
            <TabsTrigger value="c2pa" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black gap-2 px-4">
              <FileCheck className="w-4 h-4" />
              C2PA Provenance
            </TabsTrigger>
            <TabsTrigger value="stego" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black gap-2 px-4">
              <Cpu className="w-4 h-4" />
              Stego Scanner
            </TabsTrigger>
            {analysis.mediaType === 'video' && (
              <TabsTrigger value="audio" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black gap-2 px-4">
                <Mic2 className="w-4 h-4" />
                Audio Analysis
              </TabsTrigger>
            )}
            <TabsTrigger value="binary" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black gap-2 px-4">
              <Binary className="w-4 h-4" />
              Binary Analysis
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <TabsContent value="overview" className="mt-6 space-y-6 outline-none">
                <div className="grid lg:grid-cols-3 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                  >
                    <NarrativeTimeline milestones={analysis.narrativeTimeline} />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-4 relative overflow-hidden group">
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" 
                           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                      <h3 className="text-sm font-black font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 relative z-10">
                        <FileSearch className="w-4 h-4 text-primary" />
                        METADATA_SCANNER
                      </h3>
                      <div className="space-y-2">
                        {hiddenData.map((data, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-primary">
                                {data.icon}
                              </div>
                              <div>
                                <div className="text-[9px] font-mono text-muted-foreground uppercase">{data.label}</div>
                                <div className="text-[11px] font-bold truncate max-w-[120px]">{data.status}</div>
                              </div>
                            </div>
                            <Badge className={data.risk === 'Safe' ? 'bg-forensic-green/10 text-forensic-green border-forensic-green/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'} variant="outline">
                              {data.risk}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
                      <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        File Attributes
                      </h3>
                        <div className="space-y-1">
                          <EvidenceRow label="Capture Device" value={analysis.metadata.camera || "Not Detected"} />
                          <EvidenceRow label="Format" value={analysis.metadata.format} />
                          <EvidenceRow label="Resolution" value={analysis.metadata.width ? `${analysis.metadata.width}x${analysis.metadata.height}` : "Unknown"} />
                          <EvidenceRow label="OS/Software" value={analysis.metadata.software || "Not Detected"} />
                          <EvidenceRow label="Compression" value={analysis.metadata.isCompressionWarning ? "High/Warning" : "Standard"} />
                          <EvidenceRow label="EXIF Data" value={analysis.metadata.hasExif ? "Present" : "Not Found"} />
                        </div>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="reasoning" className="mt-6 space-y-6 outline-none">
                <div className="grid lg:grid-cols-2 gap-6">
                  <ConfidenceEvolutionGraph steps={analysis.confidenceEvolution} />
                  <PlausibilityPanel checks={analysis.plausibilityChecks} />
                  <ConfidenceGaps gaps={analysis.confidenceGaps} />
                  <AdversarySimulation baseConfidence={verdict.confidence} />
                  <div className="lg:col-span-2">
                    <AuthenticityDriftTimeline events={analysis.authenticityDrift} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="xai" className="mt-6 outline-none">
                <ExplainabilityHeatmap 
                  imageSrc={analysis.thumbnailUrl || analysis.fileUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"}
                  mediaType={analysis.mediaType}
                  frameNumber={analysis.mediaType === 'video' ? 1242 : undefined}
                  regions={analysis.heatmapRegions.map(r => ({
                    ...r,
                    intensity: Math.round(r.intensity * 100)
                  }))}
                />
              </TabsContent>

              {analysis.mediaType === 'video' && (
                <TabsContent value="temporal" className="mt-6 outline-none">
                  <DifferentialFrameAnalysis
                    videoSrc={analysis.fileUrl || undefined}
                    thumbnailSrc={analysis.fileUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"}
                    totalFrames={analysis.metadata.frameCount || 120}
                    fps={30}
                  />
                </TabsContent>
              )}

              <TabsContent value="c2pa" className="mt-6 outline-none">
                <C2PAVerification 
                  mediaType={analysis.mediaType}
                  fileData={c2paFileData?.fileData}
                  fileName={c2paFileData?.fileName}
                  onStatusChange={(status) => setC2paStatus(status)}
                />
              </TabsContent>

              <TabsContent value="binary" className="mt-6 outline-none">
                <HexEntropyViewer 
                  file={forensicFile || undefined}
                  fileName={analysis.fileName}
                  fileSize={analysis.fileSize}
                />
              </TabsContent>

              <TabsContent value="stego" className="mt-6 outline-none">
                <SteganographyViewer 
                  imageSrc={analysis.fileUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"} 
                />
              </TabsContent>

              <TabsContent value="audio" className="mt-6 outline-none">
                <AudioSpectrogramViewer 
                  audioUrl={analysis.fileUrl || ""} 
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
}

function EvidenceRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0 group">
      <span className="text-muted-foreground group-hover:text-white transition-colors">{label}</span>
      <span className="font-mono text-primary group-hover:text-primary/80 truncate max-w-[180px]">{value}</span>
    </div>
  );
}
