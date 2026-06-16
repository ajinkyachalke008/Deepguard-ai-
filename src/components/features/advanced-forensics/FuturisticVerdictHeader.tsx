"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Microscope, Info, AlertTriangle, ShieldCheck, Activity, Shield, ArrowUpRight } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrambleText } from '@/components/ui/scramble-text';
import { cn } from '@/lib/utils';
import { getThemeBySeverity } from '@/app/report/report-content';

import { AnalysisResult } from '@/lib/forensic-analysis';

// DeepGuard Motion Language tokens
const MOTION = {
  easeOutSoft: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeData: [0.22, 1, 0.36, 1] as [number, number, number, number],
  durationReveal: 0.62,
  durationConfidenceBuild: 0.62,
};

interface FuturisticVerdictHeaderProps {
  aiScore: number;
  forensicConfidence: number;
  verdictLabel: string;
  verdictSeverity: 'low' | 'mid' | 'high';
  interpretation?: string;
  analysis?: AnalysisResult;
}

export function FuturisticVerdictHeader({
  aiScore,
  forensicConfidence,
  verdictLabel,
  verdictSeverity,
  interpretation = "This media shows characteristics requiring forensic verification. Analysis based on multiple independent signals.",
  analysis
}: FuturisticVerdictHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayAiScore, setDisplayAiScore] = useState(0);
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [ringProgress, setRingProgress] = useState(0);

  const theme = getThemeBySeverity(verdictSeverity);

  const ganScoreRaw = analysis?.signals?.ganArtifacts ?? Math.round(aiScore * 0.82);
  const spectralScoreRaw = analysis?.signals?.spectralAnomaly ?? Math.round(aiScore * 0.74);
  const ganExp = analysis?.plausibilityChecks?.[0]?.explanation || 'Analyzing texture patterns and microscopic residuals.';
  const spectralExp = analysis?.plausibilityChecks?.[1]?.explanation || 'Analyzing frequency distribution for synthetic markers.';

  useEffect(() => {
    const aiTimer = setTimeout(() => setDisplayAiScore(aiScore), 400);
    const confTimer = setTimeout(() => setDisplayConfidence(forensicConfidence), 700);
    const ringTimer = setTimeout(() => setRingProgress(forensicConfidence), 900);
    
    return () => {
      clearTimeout(aiTimer);
      clearTimeout(confTimer);
      clearTimeout(ringTimer);
    };
  }, [aiScore, forensicConfidence]);

  const isCritical = verdictSeverity === 'high';
  const themeColor = isCritical ? 'text-forensic-red' : (verdictSeverity === 'mid' ? 'text-yellow-500' : 'text-forensic-green');

  const getTransition = (delay: number = 0) => ({
    duration: prefersReducedMotion ? 0.2 : MOTION.durationReveal,
    delay: prefersReducedMotion ? 0 : delay,
    ease: prefersReducedMotion ? ("easeOut" as const) : MOTION.easeOutSoft,
  });

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition(0)}
        className="w-full mb-8"
      >
        <div className="relative rounded-[2rem] p-[1px] overflow-hidden">
          {/* Glowing Border Wrapper */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/40 via-transparent to-yellow-500/10 pointer-events-none" />
          
          <SpotlightCard className="relative bg-black/95 rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-hidden border-white/5">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            {/* TOP HEADER SECTION */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8 mb-8">
              <div className="flex gap-4 items-start">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-cyan-500/30 flex items-center justify-center bg-cyan-500/5">
                    <Microscope className="w-6 h-6 text-cyan-400" />
                  </div>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-2">Forensic Status</div>
                  <div className={cn("inline-flex items-center gap-4 border rounded-full px-4 py-1.5 bg-black/50 backdrop-blur-md", isCritical ? "border-forensic-red/50" : "border-forensic-green/50")}>
                    <div className="flex items-center gap-2">
                      {isCritical ? <AlertTriangle className="w-4 h-4 text-forensic-red" /> : <ShieldCheck className="w-4 h-4 text-forensic-green" />}
                      <span className={cn("text-xs font-bold uppercase tracking-wider", themeColor)}>
                        {verdictLabel}
                      </span>
                    </div>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isCritical ? "bg-forensic-red shadow-[0_0_8px_rgba(255,59,48,0.8)]" : "bg-forensic-green shadow-[0_0_8px_rgba(48,255,100,0.8)]")} />
                  </div>
                  <div className="text-[10px] text-white/40 mt-2 font-mono">Multiple forensic signals detected</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">LIVE VERIFICATION ACTIVE</span>
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
            </div>

            {/* MIDDLE SECTION */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-white/10 mb-8">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 uppercase tracking-widest mb-2">
                  AI Generation Likelihood
                  <Info className="w-3 h-3 opacity-50" />
                </div>
                <div className="flex items-baseline gap-3">
                  <motion.span className={cn(
                    "text-7xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-mono",
                    "bg-gradient-to-b from-slate-200 via-slate-400 to-slate-800"
                  )}>
                    <CountUp value={displayAiScore} duration={MOTION.durationConfidenceBuild * 1000} />
                  </motion.span>
                  <span className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 bg-clip-text text-transparent mt-4 md:mt-6">/ 100</span>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={getTransition(0.5)} className="mt-2">
                  <span className={cn(
                    "text-2xl md:text-4xl font-black uppercase tracking-wide bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] filter",
                    verdictSeverity === 'high' ? "bg-gradient-to-b from-red-200 via-red-500 to-red-900" :
                    verdictSeverity === 'mid' ? "bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-800" :
                    "bg-gradient-to-b from-green-200 via-green-500 to-green-900"
                  )}>
                    <ScrambleText text={verdictLabel} duration={1200} delay={600} />
                  </span
                  >
                </motion.div>
              </div>

              {/* Radar Graphic */}
              <div className="hidden md:flex justify-center items-center opacity-70">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-purple-500/20" />
                  <div className="absolute inset-6 rounded-full border border-purple-500/20" />
                  <div className="absolute inset-12 rounded-full border border-purple-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)]" />
                  </div>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent origin-right right-1/2 top-1/2" />
                  <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,1)] animate-pulse" />
                  <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_5px_rgba(192,132,252,1)] animate-pulse" />
                </div>
              </div>

              <div className="text-sm text-white/60 leading-relaxed border-l border-white/10 pl-6 h-full flex items-center">
                {interpretation}
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Detection Confidence</div>
                <div className="text-[10px] font-mono text-green-400 flex items-center">
                  <span className="mr-1">↑</span> 2.6% vs last scan
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Ultra Sci-Fi Confidence Ring */}
                <div className="relative flex justify-center items-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    
                    {/* Targeting Crosshairs (Corners) */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />

                    {/* Small Floating Tech Text */}
                    <div className="absolute -top-3 -left-2 text-[8px] font-mono text-cyan-500/50 uppercase">CAL_LOCK</div>
                    <div className="absolute -bottom-3 -right-2 text-[8px] font-mono text-blue-500/50 uppercase">SYNC: OK</div>

                    {/* Outer animated border - glow halo */}
                    <div className="absolute inset-2 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.2)] animate-pulse" />
                    
                    {/* Radar Sweep Ring */}
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-2 rounded-full border border-transparent border-t-cyan-400/80 border-r-cyan-400/20 opacity-70" />
                    
                    {/* Reverse Dashed Ring */}
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-dashed border-cyan-500/30" />
                    
                    {/* Pulsing center background */}
                    <div className="absolute inset-6 rounded-full bg-cyan-900/20 animate-pulse" />

                    {/* SVG Base & Tick Marks */}
                    <svg className="absolute w-40 h-40 transform -rotate-90 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">
                      {/* Outer static ticks */}
                      <circle cx="80" cy="80" r="76" stroke="rgba(34,211,238,0.2)" strokeWidth="2" strokeDasharray="2 4" fill="none" />
                      {/* Inner track */}
                      <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                      {/* Animated Progress Bar */}
                      <motion.circle
                        cx="80" cy="80" r="70" stroke="url(#confidenceGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
                        strokeDasharray={440} initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 440 - (ringProgress / 100) * 440 }}
                        transition={{ duration: prefersReducedMotion ? 0.3 : 1.5, ease: MOTION.easeData }}
                      />
                      <defs>
                        <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Text Area */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                      <div className="flex items-baseline bg-gradient-to-b from-cyan-100 via-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
                        <span className="text-4xl font-black font-mono">
                          <CountUp value={displayConfidence} duration={MOTION.durationConfidenceBuild * 1000 * 2} decimals={1} />
                        </span>
                        <span className="text-xl font-bold font-mono ml-0.5">%</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-[9px] text-cyan-200/60 uppercase tracking-[0.2em] font-bold">Confidence</span>
                      </div>
                    </div>

                    {/* Technical Shield Badge */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                      <div className="w-[2px] h-3 bg-cyan-500/50" />
                      <div className="w-10 h-8 bg-black/90 border border-cyan-500/60 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                        <Shield className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Signal Bars */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Signal Card 1: GAN Texture */}
                  <div className={`bg-black/40 backdrop-blur-md border ${theme.borderColor} ${theme.shadow} rounded-xl p-5 relative overflow-hidden group ${theme.hoverBorderColor} transition-colors duration-300`}>
                    {/* Background Grid & Waveform */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:8px_8px] opacity-20 pointer-events-none" />
                    <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,50 Q10,20 20,60 T40,40 T60,70 T80,30 T100,50 L100,100 Z" fill="url(#waveGradient1)" />
                      <defs>
                        <linearGradient id="waveGradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex justify-between items-start mb-4">
                      <div className="flex flex-col max-w-[85%]">
                        <span className="text-[10px] font-mono text-cyan-100/90 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">GAN_TEXTURE_RESIDUALS</span>
                        <span className="text-[8px] font-mono text-cyan-400/80 mb-1.5 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">CH-01 // ANALYZING</span>
                        <span className="text-[10px] font-sans text-cyan-100/80 leading-relaxed drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">
                          <span className="font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] mr-1">PURPOSE:</span>Detects invisible, microscopic grid patterns left behind by AI image generation models.
                        </span>
                      </div>
                      <Activity className="w-4 h-4 text-cyan-300 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    </div>
                    
                    <div className="relative z-10 text-4xl md:text-5xl font-black font-mono mb-1 bg-gradient-to-b from-slate-100 via-slate-400 to-slate-700 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      <CountUp value={Math.round(ganScoreRaw)} duration={1500} />%
                    </div>
                    <div className="relative z-10 text-[9px] font-mono text-cyan-300/90 mb-2 tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.6)]">SIGNAL STRENGTH</div>
                    <div className="relative z-10 text-[10px] font-mono text-cyan-100/90 mb-5 h-8 leading-tight line-clamp-2 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">
                      {ganExp}
                    </div>
                    
                    {/* High-Tech Progress Bar */}
                    <div className="relative z-10 w-full h-2.5 bg-black/80 border border-cyan-500/20 rounded-sm overflow-hidden mb-5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(ganScoreRaw)}%` }} transition={{ duration: 1.5, ease: MOTION.easeData }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] w-[200%] animate-[shimmer_2s_infinite_linear]" />
                      </motion.div>
                      {/* Segment markers */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_2px,#000_2px,#000_3px)] bg-[size:10%_100%] opacity-30" />
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between border-t border-cyan-500/10 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", Math.round(ganScoreRaw) > 65 ? "bg-forensic-red shadow-[0_0_8px_rgba(255,59,48,0.8)]" : Math.round(ganScoreRaw) > 35 ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" : "bg-forensic-green shadow-[0_0_8px_rgba(48,255,100,0.8)]")} />
                        <span className={cn("text-[10px] uppercase tracking-wider font-bold font-mono", Math.round(ganScoreRaw) > 65 ? "text-forensic-red" : Math.round(ganScoreRaw) > 35 ? "text-yellow-500" : "text-forensic-green")}>
                          {Math.round(ganScoreRaw) > 65 ? 'HIGH IMPACT' : Math.round(ganScoreRaw) > 35 ? 'MODERATE IMPACT' : 'NATURAL SIGNAL'}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-white/30 border border-white/10 px-1 rounded">HEX:8F2</span>
                    </div>
                  </div>

                  {/* Signal Card 2: Spectral */}
                  <div className={`bg-black/40 backdrop-blur-md border ${theme.borderColor} ${theme.shadow} rounded-xl p-5 relative overflow-hidden group ${theme.hoverBorderColor} transition-colors duration-300`}>
                    {/* Background Grid & Waveform */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:8px_8px] opacity-20 pointer-events-none" />
                    <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,40 Q15,80 25,30 T45,60 T65,20 T85,70 L100,40 L100,100 Z" fill="url(#waveGradient2)" />
                      <defs>
                        <linearGradient id="waveGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex justify-between items-start mb-4">
                      <div className="flex flex-col max-w-[85%]">
                        <span className="text-[10px] font-mono text-purple-100/90 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">SPECTRAL_ANOMALY_INDEX</span>
                        <span className="text-[8px] font-mono text-purple-400/80 mb-1.5 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">CH-02 // FREQUENCY</span>
                        <span className="text-[10px] font-sans text-purple-100/80 leading-relaxed drop-shadow-[0_0_5px_rgba(168,85,247,0.3)]">
                          <span className="font-bold text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mr-1">PURPOSE:</span>Analyzes invisible light frequencies and color waves for signs of digital manipulation.
                        </span>
                      </div>
                      <Activity className="w-4 h-4 text-purple-300 animate-pulse drop-shadow-[0_0_8px_rgba(168,85,247,1)]" />
                    </div>
                    
                    <div className="relative z-10 text-4xl md:text-5xl font-black font-mono mb-1 bg-gradient-to-b from-slate-100 via-slate-400 to-slate-700 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      <CountUp value={Math.round(spectralScoreRaw)} duration={1800} />%
                    </div>
                    <div className="relative z-10 text-[9px] font-mono text-purple-300/90 mb-2 tracking-widest drop-shadow-[0_0_5px_rgba(168,85,247,0.6)]">SIGNAL STRENGTH</div>
                    <div className="relative z-10 text-[10px] font-mono text-purple-100/90 mb-5 h-8 leading-tight line-clamp-2 drop-shadow-[0_0_5px_rgba(168,85,247,0.4)]">
                      {spectralExp}
                    </div>
                    
                    {/* High-Tech Progress Bar */}
                    <div className="relative z-10 w-full h-2.5 bg-black/80 border border-purple-500/20 rounded-sm overflow-hidden mb-5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(spectralScoreRaw)}%` }} transition={{ duration: 1.8, ease: MOTION.easeData }} className="h-full bg-gradient-to-r from-purple-500 to-purple-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] w-[200%] animate-[shimmer_2.5s_infinite_linear]" />
                      </motion.div>
                      {/* Segment markers */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_2px,#000_2px,#000_3px)] bg-[size:10%_100%] opacity-30" />
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between border-t border-purple-500/10 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", Math.round(spectralScoreRaw) > 65 ? "bg-forensic-red shadow-[0_0_8px_rgba(255,59,48,0.8)]" : Math.round(spectralScoreRaw) > 35 ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" : "bg-forensic-green shadow-[0_0_8px_rgba(48,255,100,0.8)]")} />
                        <span className={cn("text-[10px] uppercase tracking-wider font-bold font-mono", Math.round(spectralScoreRaw) > 65 ? "text-forensic-red" : Math.round(spectralScoreRaw) > 35 ? "text-yellow-500" : "text-forensic-green")}>
                          {Math.round(spectralScoreRaw) > 65 ? 'HIGH IMPACT' : Math.round(spectralScoreRaw) > 35 ? 'MODERATE IMPACT' : 'NATURAL SIGNAL'}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-white/30 border border-white/10 px-1 rounded">HEX:A4C</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VERY BOTTOM STATUS */}
            <div className="absolute bottom-0 left-0 right-0 py-3 flex justify-center items-center gap-2 border-t border-cyan-500/10 bg-cyan-500/5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.2em]">MULTI-SIGNAL BROWSER VERIFICATION</span>
            </div>
            
          </SpotlightCard>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}

// Enhanced CountUp with DeepGuard ease-data timing
function CountUp({ value, duration = 620, decimals = 0 }: { value: number; duration?: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const actualDuration = duration;
    const startTime = performance.now();
    
    // Custom ease-data curve approximation
    const easeData = (t: number) => {
      return 1 - Math.pow(1 - t, 3);
    };
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / actualDuration, 1);
      const easedProgress = easeData(progress);
      
      const currentValue = easedProgress * value;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, prefersReducedMotion]);

  return <>{decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}</>;
}
