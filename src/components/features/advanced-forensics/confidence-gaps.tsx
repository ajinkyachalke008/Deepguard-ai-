'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

interface Gap {
  id: string;
  condition: string;
  impact: string;
  recommendation: string;
  status: 'missing' | 'degraded' | 'present';
}

interface ConfidenceGapsProps {
  gaps: Gap[];
}

export function ConfidenceGaps({ gaps }: ConfidenceGapsProps) {
  return (
    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          Confidence Gaps
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/10">
          Evidence Requirements
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        To achieve higher forensic certainty, the following evidentiary conditions should be met. These are non-judgmental requirements for optimal signal extraction.
      </p>

      <div className="space-y-3 pt-2">
        {gaps.map((gap, i) => (
          <motion.div
            key={gap.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  gap.status === 'present' ? 'text-forensic-green' : 
                  gap.status === 'degraded' ? 'text-yellow-500' : 'text-muted-foreground/50'
                }`}>
                  {gap.status === 'present' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold">{gap.condition}</span>
                    <Badge variant="secondary" className="text-[8px] h-4 px-1.5 bg-primary/10 text-primary border-none">
                      {gap.impact}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {gap.recommendation}
                  </p>
                </div>
              </div>
              {gap.status !== 'present' && (
                <div className="text-[9px] font-mono text-primary/50 uppercase flex items-center gap-1 group-hover:text-primary transition-colors cursor-help">
                  Required
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
