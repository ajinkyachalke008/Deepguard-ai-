'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';

interface TrustWarningProps {
  verdictLabel: string;
  confidence: number;
}

export function TrustWarning({ verdictLabel, confidence }: TrustWarningProps) {
  // Logic: Show warning if confidence is low or if it's uncertain
  const isRisky = confidence < 75 || verdictLabel.toLowerCase().includes('uncertain');

  if (!isRisky) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0, y: -20 }}
      animate={{ height: 'auto', opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <Card className="glass border-yellow-500/30 bg-yellow-500/5 p-4 rounded-2xl flex items-start gap-4 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-yellow-500" />
        </div>
        
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
            Advisory: High Uncertainty Context
          </h4>
          <p className="text-[11px] text-yellow-500/80 leading-relaxed">
            The forensic signals for this media are inconclusive. High levels of compression or unusual lighting may be interfering with signal extraction. <strong>Exercise extreme caution</strong> before using this result for critical decision-making or social distribution.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-[9px] font-mono text-yellow-500/60 uppercase">Manual Review Recommended</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
              <span className="text-[9px] font-mono text-yellow-500/60 uppercase">Contextual Verification Required</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
