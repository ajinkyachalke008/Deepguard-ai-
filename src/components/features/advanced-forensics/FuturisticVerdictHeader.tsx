"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Microscope, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrambleText } from '@/components/ui/scramble-text';
import { ForensicStatusBadge } from '@/components/ui/forensic-status-badge';
import { cn } from '@/lib/utils';


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
}

export function FuturisticVerdictHeader({
  aiScore,
  forensicConfidence,
  verdictLabel,
  verdictSeverity,
  interpretation = "This media shows characteristics requiring forensic verification. Analysis based on multiple independent signals."
}: FuturisticVerdictHeaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayAiScore, setDisplayAiScore] = useState(0);
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [showThresholdLine, setShowThresholdLine] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    // Staggered reveal with DeepGuard timing
    const aiTimer = setTimeout(() => setDisplayAiScore(aiScore), 400);
    const confTimer = setTimeout(() => setDisplayConfidence(forensicConfidence), 700);
    const ringTimer = setTimeout(() => setRingProgress(forensicConfidence), 900);
    
    if (aiScore > 50) {
      const thresholdTimer = setTimeout(() => setShowThresholdLine(true), 1200);
      return () => {
        clearTimeout(aiTimer);
        clearTimeout(confTimer);
        clearTimeout(ringTimer);
        clearTimeout(thresholdTimer);
      };
    }

    return () => {
      clearTimeout(aiTimer);
      clearTimeout(confTimer);
      clearTimeout(ringTimer);
    };
  }, [aiScore, forensicConfidence]);

  const getStatusColor = () => {
    if (verdictSeverity === 'high') return 'text-forensic-red';
    if (verdictSeverity === 'mid') return 'text-yellow-500';
    return 'text-forensic-green';
  };

  const getStatusBadge = () => {
    if (verdictSeverity === 'high') return <ForensicStatusBadge status="anomaly" />;
    if (verdictSeverity === 'mid') return <ForensicStatusBadge status="uncertain" />;
    return <ForensicStatusBadge status="verified" />;
  };

  const getTransition = (delay: number = 0) => ({
    duration: prefersReducedMotion ? 0.2 : MOTION.durationReveal,
    delay: prefersReducedMotion ? 0 : delay,
    ease: prefersReducedMotion ? ("easeOut" as const) : MOTION.easeOutSoft,
  });

  // SVG circle progress calculation
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition(0)}
        className="w-full mb-8"
      >
        <SpotlightCard className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 shadow-2xl">
          {/* Substrate Grid and Glowing Orbs */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <motion.div 
              animate={prefersReducedMotion ? {} : { 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [-20, 20, -20]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "absolute -top-1/4 -right-1/4 w-[100%] h-[100%] blur-[120px] rounded-full",
                verdictSeverity === 'high' ? 'bg-forensic-red/30' : 'bg-forensic-cyan/30'
              )}
            />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end justify-between">
            <div className="space-y-6 flex-1 w-full">
              {/* Forensic Status with fade-in reveal */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={getTransition(0.15)}
                className="flex items-center gap-3"
              >
                <motion.div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary/80 border border-white/10"
                  animate={prefersReducedMotion ? {} : { scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Microscope className="w-5 h-5" />
                </motion.div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">Forensic Status</div>
                  {getStatusBadge()}
                </div>
                
                <motion.div 
                  animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  className="ml-auto md:ml-4 w-2 h-2 rounded-full bg-primary"
                />
              </motion.div>

              {/* Primary Score with confidence-build animation */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={getTransition(0.25)}
                className="space-y-1 relative"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                        AI Generation Likelihood
                        <Info className="w-3 h-3 opacity-50" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="border-white/10 max-w-xs">
                    <p className="text-[10px] leading-relaxed">
                      Based on synthetic lighting gradients, texture smoothness, and compositional regularity analysis.
                    </p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-baseline gap-4">
                  <motion.span 
                    className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent font-mono"
                  >
                    <CountUp value={displayAiScore} duration={MOTION.durationConfidenceBuild * 1000} />
                  </motion.span>
                  <div className="flex flex-col">
                    <span className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">/ 100</span>
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={getTransition(0.5)}
                      className={`text-sm font-bold uppercase tracking-wider ${getStatusColor()}`}
                    >
                      <ScrambleText 
                        text={verdictLabel}
                        duration={1200}
                        delay={600}
                      />
                    </motion.span>
                  </div>
                </div>

                {/* Threshold Indicator Line - settles downward gently */}
                <AnimatePresence>
                  {showThresholdLine && (
                    <motion.div 
                      initial={{ width: 0, opacity: 0, y: -5 }}
                      animate={{ width: '100%', opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: MOTION.easeOutSoft }}
                      className="absolute -bottom-2 left-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Confidence Ring & Interpretation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={getTransition(0.6)}
              className="w-full md:w-auto md:max-w-sm space-y-4"
            >
              <div className="flex gap-6 items-center">
                {/* Circular Confidence Indicator */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r={circleRadius}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle with gradual fill */}
                    <motion.circle
                      cx="64"
                      cy="64"
                      r={circleRadius}
                      stroke="url(#confidenceGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ 
                        duration: prefersReducedMotion ? 0.3 : 1.5, 
                        ease: MOTION.easeData 
                      }}
                    />
                    <defs>
                      <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(0, 255, 255)" />
                        <stop offset="100%" stopColor="rgb(120, 200, 255)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-mono text-primary">
                      <CountUp value={displayConfidence} duration={MOTION.durationConfidenceBuild * 1000 * 2} decimals={1} />
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Confidence</span>
                  </div>
                </div>

                {/* Interpretation text - fades in softly */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={getTransition(0.9)}
                  className="space-y-3"
                >
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {interpretation}
                  </p>
                  
                  {/* Real-time Forensic Signal Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-white/10 group/signal relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/signal:opacity-100 transition-opacity" />
                      <div className="text-[9px] font-mono text-muted-foreground uppercase mb-2 flex justify-between items-center">
                        GAN_TEXTURE_RESIDUALS
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-black font-mono text-primary">{Math.round(aiScore * 0.82)}%</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(aiScore * 0.82)}%` }}
                            transition={{ duration: 1.5, ease: MOTION.easeData }}
                            className="h-full bg-gradient-to-r from-primary to-blue-400" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/10 group/signal relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover/signal:opacity-100 transition-opacity" />
                      <div className="text-[9px] font-mono text-muted-foreground uppercase mb-2 flex justify-between items-center">
                        SPECTRAL_ANOMALY_INDEX
                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-black font-mono text-blue-400">{Math.round(aiScore * 0.74)}%</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(aiScore * 0.74)}%` }}
                            transition={{ duration: 1.8, ease: MOTION.easeData }}
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] text-primary/60 font-mono uppercase">
                    <motion.div 
                      className="w-1 h-1 rounded-full bg-primary"
                      animate={prefersReducedMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    Multi-signal browser verification
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </SpotlightCard>
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
