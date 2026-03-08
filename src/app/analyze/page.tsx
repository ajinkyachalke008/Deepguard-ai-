"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShaderAnimation, ForensicScanRing } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, FileVideo, FileImage, X, AlertCircle, Clock, Download, Search, Layers } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// DeepGuard Motion Language tokens
const MOTION = {
  easeOutSoft: [0.16, 1, 0.3, 1] as const,
  easeData: [0.22, 1, 0.36, 1] as const,
  durationReveal: 0.62,
  durationFast: 0.4,
};

interface HistoryItem {
  id: string;
  fileName: string;
  verdict: string;
  severity: 'low' | 'mid' | 'high';
  timestamp: string;
}

const ANALYSIS_PHASES = [
  { name: "Initializing forensic engine", icon: "⚡" },
  { name: "Preprocessing & Metadata extraction", icon: "📋" },
  { name: "Face detection & tracking", icon: "👁" },
  { name: "Landmark extraction", icon: "📍" },
  { name: "Frame-by-frame CNN analysis", icon: "🧠" },
  { name: "Temporal motion consistency check", icon: "⏱" },
  { name: "Eye blink & gaze modeling", icon: "👀" },
  { name: "Lip-audio synchronization analysis", icon: "🎙" },
  { name: "Lighting and shadow consistency", icon: "💡" },
  { name: "Finalizing report", icon: "📊" }
];

// Frequency bar visualization component
function FrequencyBars({ isActive }: { isActive: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="flex items-end justify-center gap-1 h-8">
      {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5, 0.7, 0.4].map((height, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary/60 rounded-full"
          animate={isActive && !prefersReducedMotion ? {
            height: [`${height * 20}px`, `${height * 32}px`, `${height * 20}px`],
          } : { height: `${height * 20}px` }}
          transition={{
            duration: 1.2 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isExportingHistory, setIsExportingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const historyRaw = localStorage.getItem('deepguard_history');
    if (historyRaw) {
      try {
        setHistory(JSON.parse(historyRaw));
      } catch {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 2)
    );
  };

  const handleExportHistory = () => {
    setIsExportingHistory(true);
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepguard_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setTimeout(() => {
      setIsExportingHistory(false);
      toast.success('Analysis history exported as JSON');
    }, 1000);
  };

  const validateFile = (file: File) => {
    setError(null);
    const maxSize = 200 * 1024 * 1024;
    const allowedTypes = [
      'video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm',
      'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|jpg|jpeg|png|webp|heic|heif|mkv|webm)$/i)) {
      setError("Unsupported file format. Please use MP4, MOV, MKV, WEBM, JPG, PNG, WEBP or HEIC.");
      return false;
    }
    
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 200MB.");
      return false;
    }
    
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const selectDemo = (demoType: 'video' | 'image') => {
    const dummyFile = new File([""], demoType === 'video' ? "deepfake_sample_01.mp4" : "ai_generated_portrait.jpg", {
      type: demoType === 'video' ? 'video/mp4' : 'image/jpeg',
    });
    setFile(dummyFile);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setProgress(5);
    setCurrentPhase("Uploading media to forensic bucket...");
    setCurrentPhaseIndex(0);
    
    try {
      let fileUrl = "";
      
      if (file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file, {
            onUploadProgress: (evt) => {
              const percent = (evt.loaded / evt.total) * 100;
              setUploadProgress(percent);
              setProgress(5 + (percent * 0.1));
            }
          });
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload file to storage');
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      setProgress(15);
      setCurrentPhase("Initializing analysis...");

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (file.type.startsWith('image/') && file.size > 0) {
        try {
          const base64 = await fileToBase64(file);
          fetch('/api/analyze/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Image: base64,
              fileName: file.name,
              fileType: file.type,
              analysisId: data.analysis.id
            })
          }).catch(err => console.error('Background AI analysis failed:', err));
        } catch (err) {
          console.warn('Could not trigger background AI analysis:', err);
        }
      }
      
      for (let i = 0; i < ANALYSIS_PHASES.length; i++) {
        setCurrentPhase(ANALYSIS_PHASES[i].name);
        setCurrentPhaseIndex(i);
        const phaseDuration = 800 + Math.random() * 600;
        const stepProgress = 15 + ((i + 1) * (85 / ANALYSIS_PHASES.length));
        
        const startProgress = progress;
        const diff = stepProgress - startProgress;
        const steps = 10;
        for(let s = 1; s <= steps; s++) {
          setProgress(startProgress + (diff * (s / steps)));
          await new Promise(r => setTimeout(r, phaseDuration / steps));
        }
      }

      const reportParams = new URLSearchParams({
        analysis_id: data.analysis.id,
        type: file.type.startsWith('video') ? 'video' : 'image',
      });

      router.push(`/report?${reportParams.toString()}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const getTransition = (duration: number, delay: number = 0) => ({
    duration: prefersReducedMotion ? 0.2 : duration,
    delay: prefersReducedMotion ? 0 : delay,
    ease: prefersReducedMotion ? 'easeOut' : MOTION.easeOutSoft,
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center">
      <ShaderAnimation variant={isAnalyzing ? 'analyzing' : 'default'} />
      
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition(MOTION.durationReveal)}
        className="fixed top-4 w-[calc(100%-2rem)] z-50 px-6 py-4 flex items-center justify-between glass border-b-0 rounded-full max-w-7xl left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
          >
            <Shield className="text-black w-5 h-5" />
          </motion.div>
          <span className="font-bold tracking-tight text-xl">DeepGuard AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors duration-300">Features</Link>
          <Link href="/transparency" className="hover:text-foreground transition-colors duration-300">Transparency</Link>
          <Link href="/review-queue" className="hover:text-foreground transition-colors duration-300">Review Queue</Link>
          <Link href="/report?analysis_id=demo" className="hover:text-foreground transition-colors duration-300">Demo Report</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/batch-analyze">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="sm" className="rounded-full px-4 gap-2 glass hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] transition-all duration-300">
                <Layers className="w-4 h-4" />
                Batch Mode
              </Button>
            </motion.div>
          </Link>
          <Link href="/analyze">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" className="rounded-full px-6 shadow-[0_0_15px_rgba(0,255,255,0.15)] hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all duration-300">
                Analyze Media
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.nav>

      <main className="relative z-10 w-full max-w-7xl px-6 pt-32 pb-20 flex flex-col items-center">
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-8">
            <AnimatePresence mode="wait">
              {!isAnalyzing ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={getTransition(MOTION.durationReveal)}
                  className="space-y-8"
                >
                  {/* Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={getTransition(MOTION.durationFast, 0.1)}
                    className="text-center lg:text-left space-y-4"
                  >
                    <h1 className="text-4xl font-bold tracking-tight">Media Analysis</h1>
                    <p className="text-muted-foreground text-lg">
                      Upload a video or image for frame-by-frame forensic analysis.
                    </p>
                  </motion.div>

                  {/* Upload Container with pulsing glass border */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={getTransition(MOTION.durationReveal, 0.2)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-[2rem] p-12 transition-all duration-500
                      ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/10 glass hover:border-primary/50'}
                      flex flex-col items-center justify-center gap-6 min-h-[400px]
                    `}
                  >
                    {/* Faint circuit grid background */}
                    <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="circuit-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M0 20h40M20 0v40" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary"/>
                            <circle cx="20" cy="20" r="2" fill="currentColor" className="text-primary"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
                      </svg>
                    </div>

                    {/* Pulsing border glow when dragging */}
                    {isDragging && (
                      <motion.div
                        className="absolute inset-0 rounded-[2rem] border-2 border-primary/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    {!file ? (
                      <>
                        {/* Upload icon with slow ambient rotation */}
                        <motion.div 
                          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary relative"
                          animate={prefersReducedMotion ? {} : { rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Upload className="w-10 h-10" />
                          <motion.div
                            className="absolute inset-0 rounded-full border border-primary/20"
                            animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                        </motion.div>
                        
                        <div className="text-center space-y-2">
                          <p className="text-xl font-medium">Drop your media here</p>
                          <p className="text-muted-foreground">MP4, MOV, JPG, PNG or WEBP (max 200MB)</p>
                        </div>
                        
                        {error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-forensic-red text-sm font-medium bg-forensic-red/10 px-4 py-2 rounded-full border border-forensic-red/20"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                          </motion.div>
                        )}

                        <div className="flex flex-col gap-4 items-center">
                          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                            <Button 
                              variant="secondary" 
                              className="rounded-full px-8"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Browse Files
                            </Button>
                          </motion.div>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="video/mp4,video/quicktime,video/x-matroska,video/webm,image/jpeg,image/png,image/webp,image/heic,image/heif" 
                            onChange={handleFileChange} 
                          />
                          
                          <div className="flex items-center gap-4 mt-4">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest">Or try a demo case:</span>
                            <div className="flex gap-2">
                              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                                <Button variant="outline" size="sm" onClick={() => selectDemo('video')} className="rounded-full h-8 text-xs glass hover:border-primary/30">
                                  Deepfake Video
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                                <Button variant="outline" size="sm" onClick={() => selectDemo('image')} className="rounded-full h-8 text-xs glass hover:border-primary/30">
                                  AI Image
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-6"
                      >
                        <div className="flex items-center justify-between glass p-6 rounded-2xl border-primary/20">
                          <div className="flex items-center gap-4">
                            <motion.div 
                              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {file.type.startsWith('video') ? <FileVideo className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}
                            </motion.div>
                            <div>
                              <p className="font-medium truncate max-w-[200px] md:max-w-md">{file.name}</p>
                              <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="rounded-full">
                              <X className="w-5 h-5" />
                            </Button>
                          </motion.div>
                        </div>

                        <div className="glass p-6 rounded-2xl border-white/5 space-y-4">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <span>Analysis will be performed on our local forensic engine. No data is stored permanently.</span>
                          </div>
                          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              onClick={startAnalysis} 
                              className="w-full rounded-full py-6 text-lg font-bold shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all duration-300"
                            >
                              Start Forensic Analysis
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={getTransition(MOTION.durationReveal)}
                  className="glass p-12 rounded-[2.5rem] border-primary/20 space-y-10 text-center relative overflow-hidden"
                >
                  {/* Scanline effect */}
                  <div className="scanline" />
                  
                  {/* Background glow */}
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  </div>

                  {/* Forensic Shield Ring */}
                  <div className="relative mx-auto w-32 h-32">
                    {/* Outer rotating ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-primary/20"
                      style={{ borderTopColor: 'rgba(0, 255, 255, 0.8)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    
                    {/* Middle pulsing ring */}
                    <motion.div
                      className="absolute inset-2 rounded-full border-2 border-primary/30"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Inner rotating ring (opposite direction) */}
                    <motion.div
                      className="absolute inset-4 rounded-full border-2 border-primary/40"
                      style={{ borderBottomColor: 'rgba(0, 255, 255, 0.6)' }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    
                    {/* Center shield icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Shield className="w-10 h-10 text-primary" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Status Text */}
                  <div className="space-y-4 relative z-10">
                    <motion.h2 
                      className="text-3xl font-bold tracking-tight"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Analyzing Media...
                    </motion.h2>
                    <div className="flex items-center justify-center gap-2 text-primary font-mono text-sm tracking-widest uppercase">
                      <motion.span 
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ●
                      </motion.span>
                      {currentPhase}
                    </div>
                  </div>

                  {/* Frequency Bars */}
                  <div className="relative z-10">
                    <FrequencyBars isActive={true} />
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{uploadProgress < 100 ? "Uploading..." : "Forensic Processing..."}</span>
                      <motion.span
                        key={Math.round(progress)}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {Math.round(progress)}%
                      </motion.span>
                    </div>
                    
                    {/* Liquid gradient progress bar */}
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative">
                      <motion.div 
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ 
                          width: `${progress}%`,
                          background: 'linear-gradient(90deg, rgba(0,150,150,0.8), rgba(0,255,255,0.9), rgba(0,200,200,0.8))',
                          backgroundSize: '200% 100%',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ width: '50%' }}
                      />
                    </div>
                    
                    {uploadProgress < 100 && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-muted-foreground font-mono"
                      >
                        UPLOAD PROGRESS: {uploadProgress.toFixed(1)}%
                      </motion.p>
                    )}
                  </div>

                  {/* Phase indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 relative z-10">
                    {ANALYSIS_PHASES.slice(0, 5).map((phase, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`text-[9px] uppercase tracking-tighter p-2 rounded-lg border transition-all duration-500 ${
                          currentPhaseIndex >= i 
                            ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]' 
                            : 'border-white/5 text-muted-foreground opacity-40'
                        }`}
                      >
                        <span className="mr-1">{phase.icon}</span>
                        {phase.name.split(' ').slice(0, 2).join(' ')}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition(MOTION.durationReveal, 0.3)}
            className="w-full lg:w-80 space-y-6"
          >
            <Card className="glass p-6 rounded-[2rem] border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Recent History
                </h3>
                <div className="flex gap-1">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full hover:bg-white/10" 
                      onClick={handleExportHistory}
                      disabled={isExportingHistory || history.length === 0}
                      title="Export History"
                    >
                      <Download className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <div className="space-y-4">
                {history.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-muted-foreground">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-muted-foreground">No recent analyses found.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                      >
                        <motion.div 
                          whileHover={{ y: -2, borderColor: 'rgba(0, 255, 255, 0.3)' }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedForCompare.includes(item.id) 
                              ? 'bg-primary/10 border-primary/50' 
                              : 'bg-white/5 border-white/5'
                          }`}
                          onClick={() => toggleCompare(item.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">{item.fileName}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[8px] h-4 uppercase ${
                                item.severity === 'high' ? 'border-forensic-red text-forensic-red bg-forensic-red/5' : 
                                item.severity === 'mid' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 
                                'border-forensic-green text-forensic-green bg-forensic-green/5'
                              }`}
                            >
                              {item.verdict.split(' ')[0]}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            <Link href={`/report?analysis_id=${item.id}`}>
                              <span className="group-hover:text-primary transition-colors">View →</span>
                            </Link>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {selectedForCompare.length === 2 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Button 
                      className="w-full rounded-xl bg-primary text-black font-bold text-xs h-8"
                      onClick={() => toast.info('Batch comparison mode coming soon to Pro interface')}
                    >
                      Compare Selected (2)
                    </Button>
                  </motion.div>
                )}

                {history.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                    <div className="text-[9px] text-muted-foreground flex items-center gap-1.5 px-1">
                      <Shield className="w-2.5 h-2.5" />
                      LOCAL RETENTION: 7 DAYS
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[10px] uppercase text-muted-foreground hover:text-white h-7"
                      onClick={() => {
                        localStorage.removeItem('deepguard_history');
                        setHistory([]);
                        setSelectedForCompare([]);
                        toast.success('History cleared');
                      }}
                    >
                      Clear All History
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="glass p-6 rounded-[2rem] border-white/5 bg-primary/5 border-primary/20">
              <h3 className="text-sm font-bold mb-2">Pro Tip</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For the most accurate results, ensure the media has not been heavily compressed or resized multiple times. Original source files provide the cleanest forensic signatures.
              </p>
            </Card>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
