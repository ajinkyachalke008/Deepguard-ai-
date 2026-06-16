'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EvolutionStep {
  stage: string;
  delta: number;
  cumulative: number;
  explanation: string;
}

interface ConfidenceEvolutionGraphProps {
  steps: EvolutionStep[];
}

export function ConfidenceEvolutionGraph({ steps }: ConfidenceEvolutionGraphProps) {
  return (
    <SpotlightCard className="p-6 space-y-6">
      <div className="flex items-center justify-between relative z-10 border-b border-primary/10 pb-4">
        <div>
          <h3 className="text-sm font-black font-mono text-primary uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
            <TrendingUp className="w-4 h-4 text-primary" />
            Confidence Evolution Graph
          </h3>
          <p className="text-[10px] text-primary/60 leading-relaxed mt-1 font-mono uppercase tracking-widest">
            Recursive Forensic Analysis
          </p>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase font-mono border-primary/30 text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)] bg-primary/10 px-3 py-1">
          Evidence Accumulation
        </Badge>
      </div>

      <div className="relative h-48 w-full mt-8 flex items-end justify-between px-2">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
          {[100, 75, 50, 25, 0].map((level) => (
            <div key={level} className="w-full border-t border-white/5 flex justify-end">
              <span className="text-[8px] text-muted-foreground/30 pr-1 -mt-1.5">{level}%</span>
            </div>
          ))}
        </div>

        {/* Connection Lines (SVG) - Glowing Cyber Path */}
        <svg className="absolute inset-x-0 bottom-12 w-full h-[150px] pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00c8c8" />
              <stop offset="50%" stopColor="#00ffcc" />
              <stop offset="100%" stopColor="#ff3b30" />
            </linearGradient>
            <filter id="path-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <motion.path
            fill="none"
            stroke="url(#glow-gradient)"
            strokeWidth="3"
            filter="url(#path-glow)"
            d={steps.reduce((acc, step, i) => {
              const x = (i / (steps.length - 1)) * 100;
              const y = 100 - step.cumulative;
              return i === 0 ? `M 0,${y}%` : `${acc} L ${x}%,${y}%`;
            }, "")}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }} 
          />
        </svg>

        {/* Dynamic Global Scanline Scan */}
        <motion.div 
          initial={{ left: "-10%" }}
          animate={{ left: "110%" }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-y-0 w-[50px] bg-gradient-to-r from-transparent via-primary/10 to-transparent z-20 pointer-events-none"
        />

        {/* Data Nodes */}
        {steps.map((step, i) => (
          <div 
            key={i} 
            className="relative z-30 flex flex-col items-center group"
            style={{ width: `${100 / steps.length}%` }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 + 0.5, type: 'spring', stiffness: 200 }}
                    className="relative cursor-crosshair group/node"
                    style={{ marginBottom: `${step.cumulative * 1.5}px` }}
                  >
                    {/* Vertical Targeting Laser to Bottom Axis */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-[150px] bg-gradient-to-b from-primary/50 to-transparent pointer-events-none z-0" />
                    
                    <motion.div 
                      className="w-4 h-4 rounded-full bg-[#050505] border-[3px] border-primary group-hover/node:scale-150 group-hover/node:bg-primary transition-all relative z-10 shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/node:opacity-100 transition-opacity">
                        <div className="w-1 h-1 bg-black rounded-full" />
                      </div>
                    </motion.div>
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-primary/60 blur-md"
                      animate={{ scale: [1, 2, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="glass border-white/10 p-4 max-w-xs shadow-2xl backdrop-blur-xl rounded-xl">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary flex justify-between border-b border-white/10 pb-2">
                      {step.stage}
                      <span className="opacity-50">T+{(i * 0.4).toFixed(1)}s</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">{step.explanation}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className={`flex items-center gap-1 text-[10px] font-black tracking-widest ${step.delta >= 0 ? 'text-forensic-green' : 'text-forensic-red'}`}>
                        {step.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {step.delta >= 0 ? '+' : ''}{step.delta}% IMPACT
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 + 0.8 }}
              className={`absolute text-[9px] font-black font-mono px-2 py-0.5 rounded shadow-[0_0_10px_currentcolor] border -top-6 whitespace-nowrap z-40
                ${step.cumulative > 85 ? 'text-red-400 bg-red-950/80 border-red-500' : 
                  step.cumulative > 50 ? 'text-yellow-400 bg-yellow-950/80 border-yellow-500' : 
                  'text-primary bg-primary/10 border-primary/50'}`}
              style={{ top: `calc(${100 - step.cumulative}% - 2.5rem)` }}
            >
              {step.cumulative}%
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 + 0.8 }}
              className="text-[9px] font-bold font-mono text-muted-foreground mt-6 rotate-[-45deg] origin-top-left translate-x-3 group-hover:text-primary transition-colors whitespace-nowrap"
            >
              {step.stage.split(' ')[0]}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] text-muted-foreground italic leading-tight">
          <Info className="w-3 h-3 inline mr-1 text-primary" />
          Graph shows evidence accumulation. Confidence increases as independent forensic tests confirm consistent signals.
        </p>
      </div>
    </SpotlightCard>
  );
}
