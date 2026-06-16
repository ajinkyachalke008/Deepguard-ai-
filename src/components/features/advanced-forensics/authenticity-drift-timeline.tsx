'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/spotlight-card';
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
    <SpotlightCard className="p-8 space-y-8">
      <div className="flex items-center justify-between relative z-10 border-b border-primary/10 pb-4">
        <div>
          <h3 className="text-sm font-black font-mono text-primary uppercase tracking-[0.2em] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
            <Activity className="w-4 h-4 text-primary" />
            Authenticity Drift
          </h3>
          <p className="text-[10px] text-primary/60 leading-relaxed mt-1 font-mono uppercase tracking-widest">
            Signal Decay Tracking
          </p>
        </div>
        <Badge variant="outline" className="text-[9px] uppercase font-mono border-primary/30 text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)] bg-primary/10 px-3 py-1">
          Forensic Degradation
        </Badge>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed relative z-10 border-l-2 border-primary/20 pl-3">
        Tracking how forensic signatures degrade across re-uploads. Loss of evidence is treated as uncertainty, not as manipulation.
      </p>

      <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20 before:z-0">
        {/* Animated glowing beam down the timeline */}
        <motion.div
          className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent z-10"
          animate={{ backgroundPosition: ['0% -100%', '0% 200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundSize: '100% 50%' }}
        />
        
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="relative pl-12 group/event"
          >
            <div className={`absolute left-0 top-0 w-10 h-10 rounded-full bg-[#050505] border-[2px] flex items-center justify-center z-20 transition-all duration-300 group-hover/event:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
              event.type === 'original' 
                ? 'text-primary border-primary shadow-[0_0_15px_rgba(0,255,255,0.5)] group-hover/event:bg-primary/20' 
                : 'text-muted-foreground border-white/20 group-hover/event:border-primary/50 group-hover/event:text-primary'
            }`}>
              {event.type === 'original' && <Layers className="w-4 h-4" />}
              {event.type === 'upload' && <Share2 className="w-4 h-4" />}
              {event.type === 'compression' && <FileDown className="w-4 h-4" />}
              {event.type === 'editing' && <Clock className="w-4 h-4" />}
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-[#050505] border border-primary/10 group-hover/event:border-primary/40 group-hover/event:shadow-[inset_0_0_20px_rgba(0,255,255,0.05)] transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(0,255,255,0.05),transparent)] -translate-x-full group-hover/event:animate-[shimmer_1.5s_infinite]" />
              
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-black tracking-wider uppercase text-white group-hover/event:text-primary transition-colors">{event.event}</span>
                <span className="text-[10px] font-mono text-primary/70">{event.timestamp}</span>
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex-1 h-1.5 bg-[#020202] rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${event.confidence}%` }}
                    transition={{ duration: 1, delay: i * 0.2 + 0.5 }}
                    className={`h-full shadow-[0_0_10px_currentcolor] ${event.confidence > 90 ? 'bg-forensic-green' : event.confidence > 70 ? 'bg-yellow-500' : 'bg-forensic-red'}`}
                  />
                </div>
                <span className="text-[10px] font-mono font-black whitespace-nowrap text-white">
                  {event.confidence.toFixed(1)}% <span className="text-primary/50">Est.</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                <p className="text-[10px] text-muted-foreground italic leading-relaxed max-w-[75%]">
                  {event.details}
                </p>
                {event.drift !== 0 && (
                  <Badge variant="outline" className={`text-[9px] font-mono font-black px-2 ${event.drift < 0 ? 'text-forensic-red border-forensic-red/20 bg-forensic-red/10' : 'text-forensic-green border-forensic-green/20 bg-forensic-green/10'}`}>
                    {event.drift > 0 ? '+' : ''}{event.drift.toFixed(1)}% DRIFT
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SpotlightCard>
  );
}
