'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReliabilityContractProps {
  contract: {
    range: [number, number];
    statement: string;
    conditions: string[];
    riskLevel: 'minimal' | 'moderate' | 'high';
  };
}

export function ReliabilityContract({ contract }: ReliabilityContractProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SpotlightCard className="rounded-[2rem] overflow-hidden transition-all duration-500">
      <div 
        className="p-6 cursor-pointer hover: transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Reliability Contract
          </h3>
          <Badge className={`${
            contract.riskLevel === 'minimal' ? 'bg-forensic-green/10 text-forensic-green border-forensic-green/20' :
            contract.riskLevel === 'moderate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
            'bg-forensic-red/10 text-forensic-red border-forensic-red/20'
          } text-[9px] uppercase`}>
            {contract.riskLevel} Risk Profile
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-primary">{contract.range[0]}% - {contract.range[1]}%</span>
              <span className="text-[10px] text-muted-foreground uppercase">Expected Variance</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {contract.statement}
            </p>
          </div>
          <div className="shrink-0 text-muted-foreground">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t p-6 space-y-4"
          >
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Reliability Conditions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {contract.conditions.map((condition, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-background/50 border">
                    <CheckCircle2 className="w-3 h-3 text-forensic-green" />
                    <span className="text-[10px] text-muted-foreground">{condition}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase text-primary">Technical Limitation Notice</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Forensic signals are extracted within the defined ranges assuming no intentional anti-forensic countermeasures (e.g., GAN-generated noise injection) have been applied to specifically target these models.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SpotlightCard>
  );
}
