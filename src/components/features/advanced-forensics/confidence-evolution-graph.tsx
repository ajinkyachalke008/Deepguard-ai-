'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
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
    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Confidence Evolution
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase font-mono bg-primary/5 border-primary/20">
          Recursive Signal Check
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

        {/* Connection Lines (SVG) - Solid Liquid Path */}
        <svg className="absolute inset-x-0 bottom-12 w-full h-[150px] pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2ff" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="path-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
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
                    className="relative cursor-help"
                    style={{ marginBottom: `${step.cumulative * 1.5}px` }}
                  >
                    <motion.div 
                      className="w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:scale-150 transition-transform relative z-10"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-primary/40 blur-md"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="glass border-white/10 p-3 max-w-xs shadow-2xl backdrop-blur-xl">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary flex justify-between">
                      {step.stage}
                      <span className="opacity-50">T+{(i * 0.4).toFixed(1)}s</span>
                    </div>
                    <p className="text-[11px] leading-tight text-muted-foreground font-medium">{step.explanation}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
                      <div className={`flex items-center gap-0.5 text-[10px] font-bold ${step.delta >= 0 ? 'text-forensic-green' : 'text-forensic-red'}`}>
                        {step.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {step.delta >= 0 ? '+' : ''}{step.delta}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 rounded-full">CONF: {step.cumulative}%</div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 + 0.8 }}
              className="text-[9px] font-bold font-mono text-muted-foreground mt-4 rotate-[-45deg] origin-top-left translate-x-2 group-hover:text-primary transition-colors"
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
    </Card>
  );
}
