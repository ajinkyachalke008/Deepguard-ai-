'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

interface Milestone {
  id: string;
  milestone: string;
  description: string;
  timestamp: string;
  iconType: 'shield' | 'search' | 'alert' | 'check';
  confidenceImpact?: number; // Optional impact for forensic depth
}

interface NarrativeTimelineProps {
  milestones: Milestone[];
}

export function NarrativeTimeline({ milestones }: NarrativeTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'shield': return <Shield className="w-4 h-4 text-primary" />;
      case 'search': return <Search className="w-4 h-4 text-primary" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-forensic-red" />;
      case 'check': return <CheckCircle2 className="w-4 h-4 text-forensic-green" />;
      default: return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <SpotlightCard className="p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
      {/* Background intelligence grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-sm font-black font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Intelligence Narrative
          </h3>
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed mt-1 font-mono uppercase tracking-widest">
            Chronological Evidence Chain
          </p>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase font-mono border-primary/20 text-primary bg-primary/5 px-3 py-1">
          Active Investigation
        </Badge>
      </div>

      <div className="space-y-6 relative z-10 before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent">
          {milestones.map((milestone, i) => {
            const impact = milestone.confidenceImpact || (milestone.iconType === 'alert' ? -15 : milestone.iconType === 'check' ? 10 : 5);
            
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100, damping: 20 }}
                className="flex items-start gap-6 group/item relative"
              >
                <div className="flex flex-col items-center gap-2 relative z-10 mt-1">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  <div className={`w-10 h-10 rounded-xl glass border flex items-center justify-center shrink-0 transition-all duration-300 relative z-10 ${
                    milestone.iconType === 'alert' ? 'border-forensic-red/30 bg-forensic-red/5' : 
                    milestone.iconType === 'check' ? 'border-forensic-green/30 bg-forensic-green/5' : 
                    'border-primary/30 bg-primary/5'
                  }`}>
                    {getIcon(milestone.iconType)}
                  </div>
                </div>

                <div className="flex-1 space-y-3 pb-6 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white tracking-wide">{milestone.milestone}</span>
                      <Badge variant="outline" className="text-[8px] font-mono border-white/10 uppercase tracking-widest bg-black/40">
                        {milestone.timestamp}
                      </Badge>
                    </div>
                    {/* Confidence Impact Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Impact</span>
                      <span className={`text-[10px] font-black font-mono ${impact > 0 ? 'text-forensic-green' : impact < 0 ? 'text-forensic-red' : 'text-primary'}`}>
                        {impact > 0 ? '+' : ''}{impact}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl border hover:border-white/10 transition-colors backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[9px] font-mono text-primary/40 uppercase pt-1 group-hover/item:text-primary transition-colors cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    Verified by DeepGuard Neural Engine
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </SpotlightCard>
  );
}
