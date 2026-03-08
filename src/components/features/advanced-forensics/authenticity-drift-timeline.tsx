'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Share2, FileDown, Layers } from 'lucide-react';

interface DriftEvent {
  id: string;
  event: string;
  timestamp: string;
  confidence: number;
  drift: number;
  type: 'upload' | 'compression' | 'editing' | 'original';
  details: string;
}

interface AuthenticityDriftTimelineProps {
  events: DriftEvent[];
}

export function AuthenticityDriftTimeline({ events }: AuthenticityDriftTimelineProps) {
  return (
    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Authenticity Drift
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/10">
          Signal Decay Tracking
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Tracking how forensic signatures degrade across re-uploads. Loss of evidence is treated as uncertainty, not as manipulation.
      </p>

      <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="relative pl-12 group"
          >
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
              event.type === 'original' ? 'text-primary border-primary/30' : 'text-muted-foreground'
            }`}>
              {event.type === 'original' && <Layers className="w-5 h-5" />}
              {event.type === 'upload' && <Share2 className="w-4 h-4" />}
              {event.type === 'compression' && <FileDown className="w-4 h-4" />}
              {event.type === 'editing' && <Clock className="w-4 h-4" />}
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{event.event}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{event.timestamp}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${event.confidence}%` }}
                    transition={{ duration: 1, delay: i * 0.2 + 0.5 }}
                    className={`h-full ${event.confidence > 90 ? 'bg-forensic-green' : event.confidence > 70 ? 'bg-yellow-500' : 'bg-forensic-red'}`}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold whitespace-nowrap">
                  {event.confidence.toFixed(1)}% <span className="text-muted-foreground">Est.</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-muted-foreground italic leading-tight max-w-[70%]">
                  {event.details}
                </p>
                {event.drift !== 0 && (
                  <Badge variant="outline" className={`text-[9px] font-mono ${event.drift < 0 ? 'text-forensic-red border-forensic-red/20 bg-forensic-red/5' : 'text-forensic-green border-forensic-green/20 bg-forensic-green/5'}`}>
                    {event.drift > 0 ? '+' : ''}{event.drift.toFixed(1)}% Drift
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
