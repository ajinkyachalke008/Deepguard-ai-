'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
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
    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Authenticity Narrative
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/10">
          Chronological Evidence
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        A structured story of how the analysis unfolded, from signal acquisition to final integrity verification.
      </p>

      <div className="space-y-4">
          {milestones.map((milestone, i) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              className="flex items-start gap-4 group"
            >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-colors">
                {getIcon(milestone.iconType)}
              </div>
              {i < milestones.length - 1 && (
                <div className="w-0.5 h-12 bg-gradient-to-b from-primary/20 to-transparent" />
              )}
            </div>

            <div className="flex-1 space-y-1 pt-0.5 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">{milestone.milestone}</span>
                <span className="text-[9px] font-mono text-muted-foreground/50">{milestone.timestamp}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {milestone.description}
              </p>
              <div className="flex items-center gap-1 text-[9px] font-mono text-primary/50 uppercase pt-1 group-hover:text-primary transition-colors cursor-default">
                Verified
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
