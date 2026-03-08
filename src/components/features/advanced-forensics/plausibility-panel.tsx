'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle2, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';

interface Check {
  id: string;
  label: string;
  status: 'passed' | 'inconclusive' | 'anomalous';
  explanation: string;
}

interface PlausibilityPanelProps {
  checks: Check[];
}

export function PlausibilityPanel({ checks }: PlausibilityPanelProps) {
  return (
    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Cognitive Plausibility
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/10">
          Biological & Physical Logic
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Rule-based verification of physical, biological, and logical constraints. Synthetic media often fails basic geometry or anatomical consistency.
      </p>

      <div className="grid gap-3 pt-2">
        {checks.map((check, i) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-2xl border transition-all ${
              check.status === 'anomalous' 
                ? 'bg-forensic-red/5 border-forensic-red/20 shadow-[0_0_15px_rgba(255,59,48,0.1)]' 
                : 'bg-white/5 border-white/5 hover:border-primary/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <motion.div 
                animate={check.status === 'anomalous' ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`mt-0.5 shrink-0 ${
                  check.status === 'passed' ? 'text-forensic-green' :
                  check.status === 'anomalous' ? 'text-forensic-red' : 'text-yellow-500'
                }`}
              >
                {check.status === 'passed' && <CheckCircle2 className="w-4 h-4" />}
                {check.status === 'anomalous' && <Sparkles className="w-4 h-4" />}
                {check.status === 'inconclusive' && <HelpCircle className="w-4 h-4" />}
              </motion.div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold">{check.label}</span>
                  <span className={`text-[9px] uppercase font-mono ${
                    check.status === 'passed' ? 'text-forensic-green/70' :
                    check.status === 'anomalous' ? 'text-forensic-red font-bold' : 'text-yellow-500/70'
                  }`}>
                    {check.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {check.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
