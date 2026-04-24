'use client';

/**
 * DeepGuard AI — Comparative Forensic Terminal
 * ====================================================================
 * The primary interface for side-by-side media comparison.
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Upload, Split, Shield, 
  HelpCircle, Info, FileImage, FileVideo, X,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelComparator } from '@/components/features/pixel-comparator';

export default function ComparePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [suspectUrl, setSuspectUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'suspect') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'original') setOriginalUrl(url); else setSuspectUrl(url);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col bg-[#020406]">
      <ShaderAnimation />
      
      {/* Header */}
      <nav className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Split className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Comparative Forensic Terminal</h1>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">A/B Difference Laboratory</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {originalUrl && suspectUrl && (
             <Button 
               size="sm" 
               className="rounded-full px-6 bg-primary text-black font-bold h-9"
               onClick={() => setIsReady(true)}
             >
                Initialize Comparison
             </Button>
           )}
           <Link href="/analyze">
              <Button variant="ghost" size="sm" className="rounded-full text-xs font-medium h-9">
                Return to Analysis
              </Button>
           </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 p-6 flex flex-col items-center">
        {!isReady ? (
          <div className="w-full max-w-5xl mt-12 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Comparative Logic</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Upload two versions of the same media to identify exact pixel manipulations, localized retouching, and artifacts of generative editing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Original File */}
              <Card className={`glass p-8 rounded-[2.5rem] border-dashed border-2 flex flex-col items-center justify-center gap-6 min-h-[350px] transition-all duration-500 ${originalUrl ? 'border-forensic-green/20' : 'border-white/10 hover:border-primary/40'}`}>
                {originalUrl ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-forensic-green/10 flex items-center justify-center text-forensic-green mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest">Original Reference Set</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-1">Loaded from local buffer</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white" onClick={() => setOriginalUrl(null)}>Remove</Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground mx-auto">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Original Reference</p>
                    </div>
                    <label className="cursor-pointer">
                        <Button variant="outline" className="rounded-full h-10 px-8 border-white/10 hover:bg-white/5 pointer-events-none">Select File</Button>
                        <input type="file" className="hidden" onChange={(e) => handleFile(e, 'original')} />
                    </label>
                  </div>
                )}
              </Card>

               {/* Suspect File */}
               <Card className={`glass p-8 rounded-[2.5rem] border-dashed border-2 flex flex-col items-center justify-center gap-6 min-h-[350px] transition-all duration-500 ${suspectUrl ? 'border-primary/20' : 'border-white/10 hover:border-primary/40'}`}>
                {suspectUrl ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest">Suspect Target</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-1">Ready for delta analysis</p>
                    </div>
                     <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white" onClick={() => setSuspectUrl(null)}>Remove</Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground mx-auto">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Suspect Target</p>
                    </div>
                    <label className="cursor-pointer">
                        <Button variant="outline" className="rounded-full h-10 px-8 border-white/10 hover:bg-white/5 pointer-events-none">Select File</Button>
                        <input type="file" className="hidden" onChange={(e) => handleFile(e, 'suspect')} />
                    </label>
                  </div>
                )}
              </Card>
            </div>

            <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-indigo-400" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-sm font-bold text-indigo-100 uppercase tracking-wide">Comparative Methodology</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By contrasting a known-good reference with a suspect version, we isolate pixel deviations that signify generative infilling, deepfake face-swaps, or background manipulations. Differential mapping amplifies these changes by up to 10x for investigative clarity.
                  </p>
               </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PixelComparator originalSrc={originalUrl!} suspectSrc={suspectUrl!} />
            
            <div className="mt-8 flex justify-center">
              <Button 
                variant="ghost" 
                className="text-xs text-muted-foreground hover:text-white gap-2"
                onClick={() => setIsReady(false)}
              >
                <X className="w-4 h-4" /> Reset Comparison Session
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Lab credit */}
      <footer className="relative z-10 p-6 text-center">
         <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">
           Engineered for Transparency — DeepGuard AI Forensic Lab
         </p>
      </footer>
    </div>
  );
}
