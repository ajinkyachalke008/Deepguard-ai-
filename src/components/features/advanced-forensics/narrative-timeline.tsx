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
  severity?: 'low' | 'mid' | 'high';
}

export function NarrativeTimeline({ milestones, severity = 'mid' }: NarrativeTimelineProps) {
  const getTheme = () => {
    switch (severity) {
      case 'high': return {
        container: 'border-forensic-red/40 shadow-[inset_0_0_30px_rgba(255,59,48,0.05),0_0_15px_rgba(255,59,48,0.1)] hover:border-forensic-red/60',
        blurBg: 'bg-forensic-red/10',
        headerText: 'text-red-100/90 drop-shadow-[0_0_5px_rgba(255,59,48,0.8)]',
        iconText: 'text-forensic-red drop-shadow-[0_0_8px_rgba(255,59,48,1)]',
        badge: 'border-forensic-red/30 text-forensic-red bg-forensic-red/10 shadow-[0_0_10px_rgba(255,59,48,0.2)] drop-shadow-[0_0_5px_rgba(255,59,48,0.5)]',
        lineGradient: 'before:from-forensic-red before:via-red-500/50 before:shadow-[0_0_10px_rgba(255,59,48,0.5)]',
        connector: 'from-forensic-red/80 shadow-[0_0_5px_rgba(255,59,48,0.5)]',
        nodeBg: 'bg-forensic-red',
        nodeBorder: 'border-forensic-red/60 shadow-[inset_0_0_20px_rgba(255,59,48,0.3),0_0_15px_rgba(255,59,48,0.4)]',
        timestampBracket: 'text-forensic-red/40',
        timestampText: 'text-forensic-red/70'
      };
      case 'low': return {
        container: 'border-cyan-500/40 shadow-[inset_0_0_30px_rgba(34,211,238,0.05),0_0_15px_rgba(34,211,238,0.1)] hover:border-cyan-400/60',
        blurBg: 'bg-cyan-500/10',
        headerText: 'text-cyan-100/90 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]',
        iconText: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,1)]',
        badge: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.2)] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]',
        lineGradient: 'before:from-cyan-500 before:via-cyan-400/50 before:shadow-[0_0_10px_rgba(34,211,238,0.5)]',
        connector: 'from-cyan-500/80 shadow-[0_0_5px_rgba(34,211,238,0.5)]',
        nodeBg: 'bg-cyan-500',
        nodeBorder: 'border-cyan-400/60 shadow-[inset_0_0_20px_rgba(34,211,238,0.3),0_0_15px_rgba(34,211,238,0.4)]',
        timestampBracket: 'text-cyan-400/40',
        timestampText: 'text-cyan-500/70'
      };
      case 'mid':
      default: return {
        container: 'border-amber-500/40 shadow-[inset_0_0_30px_rgba(245,158,11,0.05),0_0_15px_rgba(245,158,11,0.1)] hover:border-amber-400/60',
        blurBg: 'bg-amber-500/10',
        headerText: 'text-amber-100/90 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]',
        iconText: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,1)]',
        badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)] drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]',
        lineGradient: 'before:from-amber-500 before:via-yellow-500/50 before:shadow-[0_0_10px_rgba(245,158,11,0.5)]',
        connector: 'from-amber-500/80 shadow-[0_0_5px_rgba(245,158,11,0.5)]',
        nodeBg: 'bg-amber-500',
        nodeBorder: 'border-amber-400/60 shadow-[inset_0_0_20px_rgba(245,158,11,0.3),0_0_15px_rgba(245,158,11,0.4)]',
        timestampBracket: 'text-amber-400/40',
        timestampText: 'text-amber-500/70'
      };
    }
  };

  const theme = getTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case 'shield': return <Shield className={`w-4 h-4 ${theme.iconText}`} />;
      case 'search': return <Search className={`w-4 h-4 ${theme.iconText}`} />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-forensic-red drop-shadow-[0_0_5px_rgba(255,59,48,0.8)]" />;
      case 'check': return <CheckCircle2 className="w-4 h-4 text-forensic-green drop-shadow-[0_0_5px_rgba(48,255,100,0.8)]" />;
      default: return <History className={`w-4 h-4 ${theme.iconText}`} />;
    }
  };

  return (
    <div className={`bg-black/40 backdrop-blur-md border ${theme.container} p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden group transition-colors duration-300`}>
      {/* Background intelligence grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700" />
      <div className={`absolute top-0 right-0 w-64 h-64 ${theme.blurBg} rounded-full blur-[60px] pointer-events-none`} />

      <div className={`flex items-center justify-between relative z-10 border-b border-white/10 pb-4`}>
        <div>
          <h3 className={`text-sm font-black font-mono ${theme.headerText} uppercase tracking-[0.2em] flex items-center gap-2`}>
            <History className={`w-4 h-4 ${theme.iconText}`} />
            Intelligence Narrative
          </h3>
          <p className="text-[10px] text-white/40 leading-relaxed mt-1 font-mono uppercase tracking-widest">
            Chronological Evidence Chain
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className={`text-[9px] uppercase font-mono px-3 py-1 ${theme.badge}`}>
            Active Investigation
          </Badge>
          <span className="text-[8px] font-mono text-white/30 tracking-widest">SYS.LOG.09</span>
        </div>
      </div>

      <div className={`space-y-6 relative z-10 before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-gradient-to-b ${theme.lineGradient} before:to-transparent`}>
        
        {/* Animated Data Stream */}
        <div className="absolute inset-y-0 left-[19px] w-[2px] overflow-hidden z-20">
          <motion.div 
            animate={{ y: ["-100%", "1000%"] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
            className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent via-white to-transparent opacity-80 shadow-[0_0_15px_#fff]" 
          />
        </div>

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
                {/* Horizontal Connector Line */}
                <div className={`absolute top-5 left-[20px] w-6 h-[2px] bg-gradient-to-r ${theme.connector} to-transparent z-0`} />

                <div className="flex flex-col items-center gap-2 relative z-10 mt-1">
                  <div className={`absolute inset-0 rounded-full blur-md opacity-20 group-hover/item:opacity-60 transition-opacity duration-500 ${
                    milestone.iconType === 'alert' ? 'bg-forensic-red' : 
                    milestone.iconType === 'check' ? 'bg-forensic-green' : theme.nodeBg
                  }`} />
                  <div 
                    className={`w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-300 relative z-10 border-2 bg-black ${
                      milestone.iconType === 'alert' ? 'border-forensic-red/60 shadow-[inset_0_0_20px_rgba(255,59,48,0.3),0_0_15px_rgba(255,59,48,0.4)]' : 
                      milestone.iconType === 'check' ? 'border-forensic-green/60 shadow-[inset_0_0_20px_rgba(48,255,100,0.3),0_0_15px_rgba(48,255,100,0.4)]' : 
                      theme.nodeBorder
                    }`}
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    {getIcon(milestone.iconType)}
                  </div>
                </div>

                <div className="flex-1 space-y-3 pb-6 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black tracking-wide bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                        {milestone.milestone}
                      </span>
                      <div className={`flex items-center gap-1 text-[8px] font-mono ${theme.timestampText} tracking-widest bg-black/60 px-2 py-0.5 rounded shadow-inner border border-white/5`}>
                        <span className={`${theme.timestampBracket}`}>[</span>
                        <span className="text-white/80">{milestone.timestamp}</span>
                        <span className={`${theme.timestampBracket}`}>]</span>
                      </div>
                    </div>
                    {/* Confidence Impact Indicator */}
                    <div className="flex items-center gap-2 bg-black/60 border border-white/5 px-3 py-1 rounded-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                      <span className="text-[8px] font-mono text-cyan-200/50 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">Impact</span>
                      <span className={`text-[11px] font-black font-mono ${
                        impact > 0 ? 'text-forensic-green drop-shadow-[0_0_8px_rgba(48,255,100,0.8)]' : 
                        impact < 0 ? 'text-forensic-red drop-shadow-[0_0_8px_rgba(255,59,48,0.8)]' : 
                        'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                      }`}>
                        {impact > 0 ? '+' : ''}{impact}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative group/desc">
                    <div className="absolute inset-y-0 -left-4 w-1 bg-gradient-to-b from-cyan-500/50 to-transparent opacity-0 group-hover/desc:opacity-100 transition-opacity" />
                    <p className="text-[11px] text-slate-300/80 leading-relaxed max-w-2xl font-medium tracking-wide">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
