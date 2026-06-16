'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { SpotlightCard } from '@/components/ui/spotlight-card';
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
    <SpotlightCard className="p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity" 
           style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-sm font-black font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Cognitive Plausibility
          </h3>
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed mt-1 font-mono uppercase tracking-widest">
            Biological & Physical Logic
          </p>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase font-mono border-primary/20 text-primary bg-primary/5 px-3 py-1">
          Constraint Verification
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed relative z-10 border-l-2 border-primary/20 pl-3">
        Rule-based verification of physical, biological, and logical constraints. Synthetic media often fails basic geometry or anatomical consistency.
      </p>

      <div className="grid gap-3 pt-4 relative z-10">
        {checks.map((check, i) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
              check.status === 'anomalous' 
                ? 'bg-forensic-red/5 border-forensic-red/20 shadow-[0_0_15px_rgba(255,59,48,0.1)]' 
                : 'bg-white/5 border-white/5 hover:border-primary/20 hover:bg-white/10'
            }`}
          >
            {check.status === 'anomalous' && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-forensic-red/10 to-transparent"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div className="flex items-start gap-4 relative z-10">
              <motion.div 
                animate={check.status === 'anomalous' ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`mt-1 shrink-0 p-1.5 rounded-lg bg-black/50 border ${
                  check.status === 'passed' ? 'text-forensic-green border-forensic-green/30' :
                  check.status === 'anomalous' ? 'text-forensic-red border-forensic-red/30' : 'text-yellow-500 border-yellow-500/30'
                }`}
              >
                {check.status === 'passed' && <CheckCircle2 className="w-4 h-4" />}
                {check.status === 'anomalous' && <Sparkles className="w-4 h-4" />}
                {check.status === 'inconclusive' && <HelpCircle className="w-4 h-4" />}
              </motion.div>
              
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-black tracking-wide text-white">{check.label}</span>
                  <Badge variant="outline" className={`text-[8px] uppercase font-mono tracking-widest px-2 ${
                    check.status === 'passed' ? 'text-forensic-green border-forensic-green/20 bg-forensic-green/5' :
                    check.status === 'anomalous' ? 'text-forensic-red font-black border-forensic-red/30 bg-forensic-red/10' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
                  }`}>
                    {check.status === 'anomalous' ? 'CRITICAL ANOMALY' : check.status}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border backdrop-blur-sm">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {check.explanation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SpotlightCard>
  );
}
