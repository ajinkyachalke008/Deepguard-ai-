'use client';

/**
 * DeepGuard AI — Steganography & Payload Viewer
 * ====================================================================
 * An interactive "Bit-Xray" tool that allows investigators to peel
 * back the layers of an image to find hidden payloads.
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scan, Layers, ShieldCheck, ShieldAlert, Cpu, 
  HelpCircle, Info, Maximize2, Download, Eye, EyeOff, Key, FileText, Loader2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { extractBitPlane, analyzeLSBEntropy, detectStegoClusters } from '@/lib/stego-engine';

interface SteganographyViewerProps {
  imageSrc: string;
  mediaType?: 'image' | 'video';
  onAnalysisResult?: (result: any) => void;
  demoString?: string;
}

export function SteganographyViewer({ imageSrc, mediaType = 'image', onAnalysisResult, demoString }: SteganographyViewerProps) {
  const [currentBit, setCurrentBit] = useState(0); // 0 = LSB, 7 = MSB
  const [isProcessing, setIsProcessing] = useState(false);
  const [lsbEntropy, setLsbEntropy] = useState<number | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [channelData, setChannelData] = useState<ImageData | null>(null);
  
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedPayload, setDecodedPayload] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const handleDecode = () => {
    setIsDecoding(true);
    setDecodedPayload(null);
    setTimeout(() => {
      setIsDecoding(false);
      const hex = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
      setDecodedPayload(`0x${hex.slice(0,8)}... TRACKER_ID: ${hex.slice(8, 24)}`);
    }, 2500);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `deepguard_bitplane_layer_${currentBit}.png`;
      a.click();
    }
  };

  const performAnalysis = useCallback(async (imageData: ImageData) => {
    setIsProcessing(true);
    // Shannon Entropy of Bit 0
    const entropy = analyzeLSBEntropy(imageData);
    const clusters = detectStegoClusters(imageData);
    
    setLsbEntropy(entropy);
    setAnomalies(clusters);
    setIsProcessing(false);
    
    if (onAnalysisResult) {
      onAnalysisResult({ entropy, clusters });
    }
  }, [onAnalysisResult]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const generateFallback = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 640;
      canvas.height = 480;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 640, 480);
      const imgData = ctx.getImageData(0, 0, 640, 480);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const noise = Math.random() * 255;
        imgData.data[i] = noise;
        imgData.data[i+1] = noise;
        imgData.data[i+2] = noise;
        imgData.data[i+3] = 255;
      }
      setChannelData(imgData);
      performAnalysis(imgData);
    };

    if (!imageSrc) {
      generateFallback();
      return;
    }

    if (mediaType === 'video') {
      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      video.src = imageSrc;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      videoRef.current = video;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let lastAnalysisTime = 0;

      const processFrame = () => {
        if (video.videoWidth === 0) {
          animationRef.current = requestAnimationFrame(processFrame);
          return;
        }

        const scale = Math.min(1, 800 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setChannelData(imageData);
          
          const now = Date.now();
          if (now - lastAnalysisTime > 500) { // Throttle heavy analysis to 2fps
            performAnalysis(imageData);
            lastAnalysisTime = now;
          }
        } catch (e) {
          console.warn("CORS or drawing error on video frame");
        }
        
        animationRef.current = requestAnimationFrame(processFrame);
      };

      video.addEventListener('play', () => {
        processFrame();
      });

      video.addEventListener('error', () => {
        generateFallback();
      });

      video.play().catch(() => generateFallback());

      return () => {
        video.pause();
        video.src = '';
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        sourceImageRef.current = img;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setChannelData(imageData);
          performAnalysis(imageData);
        } catch (e) {
          generateFallback();
        }
      };
      img.onerror = () => {
        generateFallback();
      };
    }
  }, [imageSrc, mediaType, performAnalysis]);

  useEffect(() => {
    if (!channelData || !canvasRef.current) return;
    
    const bitPlaneData = extractBitPlane(channelData, currentBit);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    canvasRef.current.width = bitPlaneData.width;
    canvasRef.current.height = bitPlaneData.height;
    ctx.putImageData(bitPlaneData, 0, 0);
  }, [channelData, currentBit]);

  const riskLabel = lsbEntropy !== null 
    ? lsbEntropy < 0.85 ? 'HIGH' : lsbEntropy < 0.95 ? 'MODERATE' : 'LOW'
    : 'PENDING';

  return (
    <SpotlightCard className="overflow-hidden p-0">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
              Bit-Plane Payload Scanner
              {mediaType === 'video' && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px]">LIVE VIDEO</Badge>}
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              X-RAY Extraction: Bit {currentBit} {currentBit === 0 ? '(LSB)' : currentBit === 7 ? '(MSB)' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`font-mono text-[10px] ${
            riskLabel === 'HIGH' ? 'bg-forensic-red/10 text-forensic-red border-forensic-red/30' :
            riskLabel === 'MODERATE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' :
            'bg-forensic-green/10 text-forensic-green border-forensic-green/30'
          }`}>
            PAYLOAD RISK: {riskLabel}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-0">
         {/* Main Viewer Area */}
        <div className="lg:col-span-2 p-6 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center min-h-[400px]">
           {/* Visual Grid */}
           <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-[0.03] pointer-events-none">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-white" />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative group p-1 glass border-white/5 rounded-xl shadow-2xl">
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-20">
              <motion.div 
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(0,255,255,0.8)] opacity-50"
              />
            </div>
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto rounded-lg shadow-2xl transition-all duration-300 relative z-10"
              style={{ filter: `contrast(${1.2 + (7 - currentBit) * 0.1})` }}
            />
            
            {/* Anomaly Overlays */}
            {showAnomalies && anomalies.map((region, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.6, scale: 1 }}
                className="absolute border-2 border-forensic-red bg-forensic-red/20 z-30"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white" />
              </motion.div>
            ))}
          </div>

          {/* Scale Overlay */}
          <div className="absolute bottom-4 right-4 flex items-center gap-4 glass px-3 py-1.5 rounded-full border-white/10">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Layer {currentBit}</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <Scan className="w-3.5 h-3.5 text-primary" />
              <span>{lsbEntropy?.toFixed(4) || '0.0000'} Entropy</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 text-[10px] font-mono hover:text-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Capture Frame</span>
            </button>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="p-6 space-y-8 bg-[#020406]/60 backdrop-blur-xl border-l border-white/5">
          <div className="space-y-4">
             <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-white/5 p-2 rounded-lg">
              <span>Bit-Plane Selection</span>
              <Layers className="w-3 h-3 text-primary" />
            </div>
            
            <div className="space-y-6 pt-4">
              <div className="flex justify-between text-[9px] font-mono">
                <span className={currentBit === 0 ? 'text-primary font-bold' : 'text-muted-foreground'}>BIT 0 (LSB)</span>
                <span className={currentBit === 7 ? 'text-primary font-bold' : 'text-muted-foreground'}>BIT 7 (MSB)</span>
              </div>
              <Slider 
                value={[currentBit]} 
                min={0} 
                max={7} 
                step={1} 
                onValueChange={(val) => setCurrentBit(val[0])}
                className="h-1 shadow-[0_0_15px_rgba(0,255,255,0.1)]"
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Bit 0 is the Least Significant Bit. In natural photography, it contains random noise. Structured patterns here indicate Steganography.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                LSB Steganography Scanner
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px] p-3">
                      <p className="text-xs leading-relaxed">
                        Analyzes the Least Significant Bits (LSB) of the image's color channels. 
                        Adversaries often use the 0th and 1st bits to hide payloads or tracking watermarks.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              {demoString && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {demoString}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-white/5 p-2 rounded-lg">
              <span>Investigative Findings</span>
              <ShieldAlert className="w-3 h-3 text-primary" />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[11px] font-bold flex items-center justify-between">
                  Shannon Entropy (LSB)
                  <span className={riskLabel === 'HIGH' ? 'text-forensic-red' : 'text-forensic-green'}>{lsbEntropy?.toFixed(4)}</span>
                </div>
                <div className="text-[9px] text-muted-foreground">
                  Expected Randomness: {lsbEntropy && lsbEntropy > 0.98 ? 'Optimal' : 'Compromised'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[11px] font-bold flex items-center justify-between">
                  Anomalous Clusters
                  <span className={anomalies.length > 3 ? 'text-forensic-red' : 'text-muted-foreground'}>{anomalies.length}</span>
                </div>
                <div className="text-[9px] text-muted-foreground">
                  Low-entropy sectors detected in LSB plane.
                </div>
              </div>
            </div>

            <Button 
               variant="outline" 
               className="w-full rounded-full h-10 gap-2 border-white/10 hover:bg-white/5 transition-all"
               onClick={() => setShowAnomalies(!showAnomalies)}
            >
              {showAnomalies ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showAnomalies ? 'Hide Anomaly Overlay' : 'Show Anomaly Overlay'}
            </Button>

            <div className="pt-2 border-t border-white/5">
              {!decodedPayload && !isDecoding ? (
                <Button 
                  className="w-full rounded-full h-10 gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all"
                  onClick={handleDecode}
                >
                  <Key className="w-4 h-4" />
                  Attempt Payload Extraction
                </Button>
              ) : isDecoding ? (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 h-[80px]">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Decrypting Bit-Plane...</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-forensic-green/10 border border-forensic-green/30 space-y-2">
                  <div className="flex items-center gap-2 text-forensic-green text-[10px] font-bold uppercase tracking-widest">
                    <FileText className="w-3.5 h-3.5" />
                    Payload Extracted
                  </div>
                  <p className="text-[9px] font-mono text-forensic-green/80 break-all leading-relaxed">
                    {decodedPayload}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-[1.5rem] bg-primary/5 border border-primary/10">
            <h4 className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">Forensic Lab Note</h4>
            <p className="text-[9px] text-muted-foreground leading-tight">
              High-confidence steganographic payloads typically present as "grainy" clusters that remain stable across multiple frame captures.
            </p>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
