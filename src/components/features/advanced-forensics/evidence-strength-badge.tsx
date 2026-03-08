'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Scale, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EvidenceStrengthBadgeProps {
  confidence: number;
}

export function EvidenceStrengthBadge({ confidence }: EvidenceStrengthBadgeProps) {
  const strength = React.useMemo(() => {
    if (confidence > 95) return { 
      label: 'Conclusive Evidence', 
      color: 'text-forensic-green border-forensic-green/30 bg-forensic-green/10',
      description: 'The forensic signals are highly consistent and clear. The probability of error is negligible under current analysis parameters.',
      level: 5
    };
    if (confidence > 85) return { 
      label: 'Strong Evidence', 
      color: 'text-forensic-green border-forensic-green/20 bg-forensic-green/5',
      description: 'Multiple independent signals point to this conclusion with high correlation. Very low likelihood of alternative interpretation.',
      level: 4
    };
    if (confidence > 70) return { 
      label: 'Substantial Evidence', 
      color: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
      description: 'Primary signals are clear, but some secondary markers are missing or degraded due to compression.',
      level: 3
    };
    if (confidence > 50) return { 
      label: 'Limited Evidence', 
      color: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
      description: 'Signals are present but weak. The data quality prevents a more definitive assessment.',
      level: 2
    };
    return { 
      label: 'Inconclusive', 
      color: 'text-forensic-red border-forensic-red/20 bg-forensic-red/5',
      description: 'The analysis cannot determine authenticity with any reasonable degree of certainty. Signals are contradictory or insufficient.',
      level: 1
    };
  }, [confidence]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cursor-help"
          >
            <Badge 
              variant="outline" 
              className={`${strength.color} text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 transition-all hover:brightness-125`}
            >
              <Scale className="w-3 h-3" />
              {strength.label}
            </Badge>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="glass border-white/10 p-4 max-w-xs space-y-2 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-primary">Evidence Rating</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-3 rounded-full ${i <= strength.level ? 'bg-primary' : 'bg-white/10'}`} 
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {strength.description}
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center gap-2">
            <Info className="w-3 h-3 text-primary" />
            <span className="text-[9px] text-muted-foreground italic">Rating derived from multi-signal convergence.</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
