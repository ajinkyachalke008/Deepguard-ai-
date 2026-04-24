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
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scan, Layers, ShieldCheck, ShieldAlert, Cpu, 
  HelpCircle, Info, Maximize2, Download, Eye, EyeOff
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
  onAnalysisResult?: (result: any) => void;
}

export function SteganographyViewer({ imageSrc, onAnalysisResult }: SteganographyViewerProps) {
  const [currentBit, setCurrentBit] = useState(0); // 0 = LSB, 7 = MSB
  const [isProcessing, setIsProcessing] = useState(false);
  const [lsbEntropy, setLsbEntropy] = useState<number | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [channelData, setChannelData] = useState<ImageData | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

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

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      sourceImageRef.current = img;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Keep dimensions reasonable for processing
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setChannelData(imageData);
      performAnalysis(imageData);
    };
  }, [imageSrc, performAnalysis]);

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
    <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Bit-Plane Payload Scanner</h3>
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
        <div className="lg:col-span-2 p-4 bg-zinc-950/50 relative overflow-hidden flex items-center justify-center min-h-[400px]">
           {/* Visual Grid */}
           <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-5 pointer-events-none">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>

          <div className="relative group">
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto rounded-lg shadow-2xl transition-all duration-300"
              style={{ filter: `contrast(${1.2 + (7 - currentBit) * 0.1})` }}
            />
            
            {/* Anomaly Overlays */}
            {showAnomalies && anomalies.map((region, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="absolute border border-forensic-red bg-forensic-red/10"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
              />
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
          </div>

          <div className="p-4 rounded-[1.5rem] bg-primary/5 border border-primary/10">
            <h4 className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">Forensic Lab Note</h4>
            <p className="text-[9px] text-muted-foreground leading-tight">
              High-confidence steganographic payloads typically present as "grainy" clusters that remain stable across multiple frame captures.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
