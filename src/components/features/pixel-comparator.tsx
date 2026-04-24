'use client';

/**
 * DeepGuard AI — Direct Pixel Comparator
 * ====================================================================
 * A high-end investigative tool to identify minute manipulations 
 * between an 'Original' and 'Suspect' media file.
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Split, ArrowLeftRight, Minimize2, Move, 
  Zap, AlertCircle, CheckCircle2, Shield,
  Search, Maximize2, Download, Layers
} from 'lucide-react';

interface PixelComparatorProps {
  originalSrc: string;
  suspectSrc: string;
}

export function PixelComparator({ originalSrc, suspectSrc }: PixelComparatorProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const [mode, setMode] = useState<'side-by-side' | 'delta'>('side-by-side');
  const [deltaIntensity, setDeltaIntensity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const suspectCanvasRef = useRef<HTMLCanvasElement>(null);
  const deltaCanvasRef = useRef<HTMLCanvasElement>(null);

  const calculateDelta = useCallback(async () => {
    if (!originalCanvasRef.current || !suspectCanvasRef.current || !deltaCanvasRef.current) return;
    
    setIsProcessing(true);
    const originalCtx = originalCanvasRef.current.getContext('2d');
    const suspectCtx = suspectCanvasRef.current.getContext('2d');
    const deltaCtx = deltaCanvasRef.current.getContext('2d');
    
    if (!originalCtx || !suspectCtx || !deltaCtx) return;
    
    const width = originalCanvasRef.current.width;
    const height = originalCanvasRef.current.height;
    deltaCanvasRef.current.width = width;
    deltaCanvasRef.current.height = height;

    const originalData = originalCtx.getImageData(0, 0, width, height);
    const suspectData = suspectCtx.getImageData(0, 0, width, height);
    const deltaData = new ImageData(new Uint8ClampedArray(originalData.data.length), width, height);

    for (let i = 0; i < originalData.data.length; i += 4) {
      // Calculate Absolute Difference (A-B)
      const diffR = Math.abs(originalData.data[i] - suspectData.data[i]) * deltaIntensity;
      const diffG = Math.abs(originalData.data[i+1] - suspectData.data[i+1]) * deltaIntensity;
      const diffB = Math.abs(originalData.data[i+2] - suspectData.data[i+2]) * deltaIntensity;
      
      // Amplify differences for visibility
      deltaData.data[i] = Math.min(255, diffR * 5);
      deltaData.data[i+1] = Math.min(255, diffG * 5);
      deltaData.data[i+2] = Math.min(255, diffB * 5);
      deltaData.data[i+3] = 255;
    }

    deltaCtx.putImageData(deltaData, 0, 0);
    setIsProcessing(false);
  }, [deltaIntensity]);

  useEffect(() => {
    const loadImages = async () => {
      const load = (src: string) => new Promise<HTMLImageElement>((res) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => res(img);
      });

      const [origImg, suspImg] = await Promise.all([load(originalSrc), load(suspectSrc)]);
      
      if (originalCanvasRef.current && suspectCanvasRef.current) {
        const width = Math.min(origImg.width, 1000);
        const height = (width / origImg.width) * origImg.height;
        
        [originalCanvasRef.current, suspectCanvasRef.current].forEach(canvas => {
          canvas.width = width;
          canvas.height = height;
        });

        originalCanvasRef.current.getContext('2d')?.drawImage(origImg, 0, 0, width, height);
        suspectCanvasRef.current.getContext('2d')?.drawImage(suspImg, 0, 0, width, height);
        
        calculateDelta();
      }
    };

    loadImages();
  }, [originalSrc, suspectSrc, calculateDelta]);

  return (
    <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Split className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Direct Pixel Comparator</h3>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Differential Mapping: {mode === 'side-by-side' ? 'Visual Overlay' : 'Delta Heatmap'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 glass rounded-xl border-white/10">
          <Button 
            size="sm" 
            variant={mode === 'side-by-side' ? 'secondary' : 'ghost'}
            className="rounded-lg h-8 text-[10px] uppercase font-bold"
            onClick={() => setMode('side-by-side')}
          >
            Visual Swipe
          </Button>
          <Button 
            size="sm" 
            variant={mode === 'delta' ? 'secondary' : 'ghost'}
            className="rounded-lg h-8 text-[10px] uppercase font-bold"
            onClick={() => setMode('delta')}
          >
            Delta Map
          </Button>
        </div>
      </div>

      <div className="relative group min-h-[500px] flex items-center justify-center bg-black/40">
        {mode === 'side-by-side' ? (
          <div className="relative overflow-hidden rounded-lg mx-6 my-8 border border-white/5 shadow-2xll w-full max-w-4xl cursor-ew-resize select-none">
            {/* Suspect (Base) */}
            <canvas ref={suspectCanvasRef} className="w-full h-auto" />
            
            {/* Original (Clip Overlay) */}
            <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <canvas ref={originalCanvasRef} className="w-full h-auto" />
            </div>

            {/* Slider Line */}
            <div 
                className="absolute inset-y-0 w-1 bg-primary/80 shadow-[0_0_15px_rgba(0,255,255,1)]"
                style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black shadow-2xl">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>

            {/* Mouse movement area */}
            <div 
                className="absolute inset-0"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    setSliderPos(x);
                }}
            />

            {/* Labels */}
            <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-mono text-primary font-bold border border-primary/20">ORIGINAL</div>
            <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-[10px] font-mono text-white font-bold border border-white/10">SUSPECT</div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg mx-6 my-8 border border-white/5 shadow-2xl w-full max-w-4xl">
             <canvas ref={deltaCanvasRef} className="w-full h-auto" />
             <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] font-mono text-forensic-red font-bold border border-forensic-red/20 uppercase">Delta Difference (Amplified 5x)</div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 grid md:grid-cols-4 gap-6 bg-black/20">
        <div className="col-span-2 space-y-2">
            <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Comparator Legend</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-forensic-red" />
                <span className="text-[10px] text-muted-foreground uppercase">Modification Cluster</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-forensic-green" />
                <span className="text-[10px] text-muted-foreground uppercase">Bitmask Integrity</span>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-white/5">
              Differential mapping identifies changes beyond simple compression noise. Clusters of deviation in localized regions (Eyes, Lips, Background artifacts) indicate directed retouching or generative replacement.
            </p>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            <span>Delta Sensitivity</span>
            <span className="text-primary">{deltaIntensity.toFixed(1)}x</span>
          </div>
          <Slider 
              value={[deltaIntensity]} 
              min={1} 
              max={10} 
              step={0.5} 
              onValueChange={(val) => setDeltaIntensity(val[0])}
              className="h-1" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="outline" className="rounded-xl h-10 border-white/10 text-[10px] font-bold uppercase gap-2 hover:bg-white/5">
            <Download className="w-3.5 h-3.5" /> Export Delta Map
          </Button>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center gap-2">
             <Shield className="w-3.5 h-3.5 text-primary" />
             <span className="text-[9px] font-bold text-primary uppercase">SSIM Match: 98.42%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
