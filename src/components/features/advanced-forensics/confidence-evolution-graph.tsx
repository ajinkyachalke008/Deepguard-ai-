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

        {/* Connection Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <motion.polyline
            fill="none"
            stroke="url(#gradient-line)"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={steps.map((step, i) => {
              const x = (i / (steps.length - 1)) * 100;
              const y = 100 - step.cumulative;
              return `${x}% ${y}%`;
            }).join(' ')}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Data Nodes */}
        {steps.map((step, i) => (
          <div 
            key={i} 
            className="relative z-10 flex flex-col items-center group"
            style={{ width: `${100 / steps.length}%` }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="relative cursor-help"
                    style={{ marginBottom: `${step.cumulative * 1.5}px` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="glass border-white/10 p-3 max-w-xs">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-primary">{step.stage}</div>
                    <p className="text-[11px] leading-tight text-muted-foreground">{step.explanation}</p>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
                      <div className={`flex items-center gap-0.5 text-[10px] font-bold ${step.delta >= 0 ? 'text-forensic-green' : 'text-forensic-red'}`}>
                        {step.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {step.delta >= 0 ? '+' : ''}{step.delta}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">Total: {step.cumulative}%</div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="text-[9px] font-mono text-muted-foreground mt-2 rotate-[-45deg] origin-top-left translate-x-2">
              {step.stage.split(' ')[0]}
            </div>
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
