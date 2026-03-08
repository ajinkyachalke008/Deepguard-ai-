'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Zap, Shield, AlertTriangle, RefreshCcw } from 'lucide-react';

interface AdversarySimulationProps {
  baseConfidence: number;
}

export function AdversarySimulation({ baseConfidence }: AdversarySimulationProps) {
  const [compression, setCompression] = useState(0);
  const [noise, setNoise] = useState(0);
  const [cropping, setCropping] = useState(0);

  const simulatedConfidence = useMemo(() => {
    // Basic heuristic for simulation impact
    const impact = (compression * 0.15) + (noise * 0.1) + (cropping * 0.2);
    return Math.max(5, baseConfidence - impact);
  }, [baseConfidence, compression, noise, cropping]);

  const drift = baseConfidence - simulatedConfidence;

  return (
    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Adversary Simulation
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/10">
          Attack Robustness Test
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Simulate how common media transformations would degrade forensic confidence. This helps estimate the robustness of the current verdict against intentional obfuscation.
      </p>

      <div className="space-y-6 py-2">
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] uppercase font-mono text-muted-foreground">
            <span>Compression Intensity</span>
            <span className="text-primary">{compression}%</span>
          </div>
          <Slider 
            value={[compression]} 
            onValueChange={([v]) => setCompression(v)} 
            max={100} 
            step={1} 
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] uppercase font-mono text-muted-foreground">
            <span>Sensor Noise Level</span>
            <span className="text-primary">{noise}%</span>
          </div>
          <Slider 
            value={[noise]} 
            onValueChange={([v]) => setNoise(v)} 
            max={100} 
            step={1}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] uppercase font-mono text-muted-foreground">
            <span>Edge Cropping</span>
            <span className="text-primary">{cropping}%</span>
          </div>
          <Slider 
            value={[cropping]} 
            onValueChange={([v]) => setCropping(v)} 
            max={100} 
            step={1}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase text-muted-foreground">Simulated Confidence</div>
          <motion.div 
            key={simulatedConfidence}
            initial={{ scale: 1.1, color: '#3b82f6' }}
            animate={{ scale: 1, color: '#fff' }}
            className="text-xl font-mono font-bold"
          >
            {simulatedConfidence.toFixed(1)}%
          </motion.div>
        </div>

        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-forensic-red via-yellow-500 to-forensic-green"
            initial={{ width: `${baseConfidence}%` }}
            animate={{ width: `${simulatedConfidence}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
          <div 
            className="absolute top-0 h-full w-0.5 bg-white/50 z-10" 
            style={{ left: `${baseConfidence}%` }}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1">
            <span className="text-[8px] text-muted-foreground uppercase">Confidence Delta</span>
            <span className={`text-xs font-mono font-bold ${drift > 10 ? 'text-forensic-red' : 'text-primary'}`}>
              -{drift.toFixed(1)}%
            </span>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1">
            <span className="text-[8px] text-muted-foreground uppercase">Stability Rating</span>
            <span className="text-xs font-mono font-bold text-forensic-green">
              {drift > 20 ? 'FRAGILE' : drift > 10 ? 'MODERATE' : 'STABLE'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-[10px] text-muted-foreground italic leading-tight bg-primary/5 p-3 rounded-xl border border-primary/10">
          <RefreshCcw className="w-3 h-3 text-primary shrink-0 mt-0.5" />
          Simulated result. Actual media is not modified. Use this to gauge if current evidence is strong enough to survive re-encoding.
        </div>
      </div>
    </Card>
  );
}
