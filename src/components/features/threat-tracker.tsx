'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { Target, Scan, AlertTriangle, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

export interface ThreatRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  label: string;
  explanation?: string;
}

interface ThreatTrackerProps {
  imageSrc: string;
  mediaType: 'image' | 'video';
  threats: ThreatRegion[];
  demoString?: string;
}

export function ThreatTrackerViewer({ imageSrc, mediaType, threats, demoString }: ThreatTrackerProps) {
  const [mounted, setMounted] = useState(false);
  const [scanLineY, setScanLineY] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Simple scanline animation loop
    let frame: number;
    const animateScan = () => {
      setScanLineY(prev => (prev >= 100 ? 0 : prev + 0.5));
      frame = requestAnimationFrame(animateScan);
    };
    frame = requestAnimationFrame(animateScan);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) return null;

  return (
    <SpotlightCard className="overflow-hidden p-0 border border-forensic-red/20 shadow-[0_0_30px_rgba(255,59,48,0.1)]">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forensic-red/10 flex items-center justify-center border border-forensic-red/20">
            <Target className="w-4 h-4 text-forensic-red animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-forensic-red">
              Active Threat Tracker
              <Badge variant="outline" className="bg-forensic-red/10 text-forensic-red border-forensic-red/30 text-[9px] font-mono animate-pulse">
                LIVE
              </Badge>
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground uppercase">
              {mediaType === 'video' ? 'TEMPORAL OBJECT TRACKING' : 'STATIC SPATIAL DETECTION'} • AUTO-TARGETING ENABLED
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-forensic-red" />
            <span className="text-[10px] font-mono font-bold text-white uppercase">
              {threats.length} THREATS DETECTED
            </span>
          </div>
          {demoString && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
              {demoString}
            </Badge>
          )}
        </div>
      </div>

      <div className="relative aspect-video bg-black overflow-hidden group border-b border-white/5">
        {/* The Media Player */}
        {mediaType === 'video' ? (
          <video 
            src={imageSrc} 
            crossOrigin="anonymous"
            className="w-full h-full object-cover grayscale brightness-75 contrast-125"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img 
            src={imageSrc} 
            alt="Threat target"
            className="w-full h-full object-cover grayscale brightness-75 contrast-125"
          />
        )}

        {/* Global Security Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2%_2%] pointer-events-none" />

        {/* Moving Scanline */}
        <div 
          className="absolute left-0 right-0 h-1 bg-forensic-red shadow-[0_0_15px_rgba(255,59,48,0.8)] opacity-50 z-10 pointer-events-none"
          style={{ top: `${scanLineY}%` }}
        />

        {/* The Threat Bounding Boxes */}
        <AnimatePresence>
          {threats.map((threat, index) => {
            const isCritical = threat.intensity > 70;
            const color = isCritical ? 'rgb(255, 59, 48)' : 'rgb(234, 179, 8)';
            const borderColor = isCritical ? 'border-forensic-red' : 'border-yellow-500';
            const bgColor = isCritical ? 'bg-forensic-red/10' : 'bg-yellow-500/10';

            return (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2, type: 'spring', stiffness: 200 }}
                className={`absolute ${borderColor} ${bgColor} border-2 pointer-events-none z-20`}
                style={{
                  left: `${threat.x}%`,
                  top: `${threat.y}%`,
                  width: `${threat.width}%`,
                  height: `${threat.height}%`,
                  boxShadow: `0 0 25px ${isCritical ? 'rgba(255,59,48,0.6)' : 'rgba(234,179,8,0.6)'}, inset 0 0 20px ${isCritical ? 'rgba(255,59,48,0.3)' : 'rgba(234,179,8,0.3)'}`
                }}
              >
                {/* Target Corners */}
                <div className={`absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 ${borderColor} drop-shadow-[0_0_8px_currentcolor]`} style={{ color: color }} />
                <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 ${borderColor} drop-shadow-[0_0_8px_currentcolor]`} style={{ color: color }} />
                <div className={`absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 ${borderColor} drop-shadow-[0_0_8px_currentcolor]`} style={{ color: color }} />
                <div className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 ${borderColor} drop-shadow-[0_0_8px_currentcolor]`} style={{ color: color }} />

                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className={`w-full h-[1px] bg-current`} style={{ color }} />
                  <div className={`absolute h-full w-[1px] bg-current`} style={{ color }} />
                  <Target className={`absolute w-8 h-8 opacity-50`} style={{ color }} />
                </div>

                {/* High-Tech Threat Label directly on the box */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                  className="absolute -top-8 left-0 bg-black/90 border border-current px-2 py-1 shadow-[0_0_15px_currentcolor] flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md"
                  style={{ color, borderColor: color }}
                >
                  {isCritical ? <ShieldAlert className="w-3 h-3 drop-shadow-[0_0_5px_currentcolor]" /> : <AlertTriangle className="w-3 h-3 drop-shadow-[0_0_5px_currentcolor]" />}
                  <span className="text-[10px] font-black tracking-widest uppercase text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                    {threat.label}
                  </span>
                  <span className="text-[9px] font-mono border-l border-current pl-1 drop-shadow-[0_0_5px_currentcolor]">
                    {threat.intensity}%
                  </span>
                </motion.div>
                
                {/* ID Tag */}
                <div className="absolute -bottom-4 right-0 text-[8px] font-mono text-white/90 bg-black/80 px-1 border border-current shadow-[0_0_10px_currentcolor]" style={{ color, borderColor: color }}>
                  TRGT_{threat.id.toUpperCase()}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <Badge variant="outline" className="glass bg-black/50 border-white/20 text-[9px] font-mono uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            <Scan className="w-3 h-3 mr-1 text-primary drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            Computer Vision System V4
          </Badge>
          <div className="text-[8px] font-mono text-white/80 ml-1 drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]">REC • {new Date().toISOString().split('T')[1].slice(0, 8)}</div>
        </div>
      </div>

      <div className="p-4 bg-black/90 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <div className="text-[9px] text-cyan-400/70 uppercase font-mono tracking-widest">Detection Mode</div>
          <div className="text-xs font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">AUTONOMOUS SEARCH</div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] text-cyan-400/70 uppercase font-mono tracking-widest">Filter Array</div>
          <div className="text-xs font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">EDGE / GAN_RESIDUAL</div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] text-cyan-400/70 uppercase font-mono tracking-widest">Confidence Floor</div>
          <div className="text-xs font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">85.0%</div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] text-cyan-400/70 uppercase font-mono tracking-widest">System Status</div>
          <div className="text-xs font-bold text-forensic-green flex items-center gap-1 drop-shadow-[0_0_5px_rgba(48,255,100,0.8)]">
            <ShieldCheck className="w-3 h-3" /> ACTIVE
          </div>
        </div>
      </div>

      {/* Threat List Data Panel */}
      {threats.length > 0 ? (
        <div className="border-t border-white/10 bg-black p-6 space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px] opacity-20 pointer-events-none" />
          
          <h4 className="text-[10px] font-black font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 relative z-10">
            <Target className="w-3 h-3 text-forensic-red drop-shadow-[0_0_5px_rgba(255,59,48,0.8)]" />
            Active Target Manifest
          </h4>
          <div className="space-y-3 relative z-10">
            {threats.map((threat, index) => {
              const isCritical = threat.intensity > 70;
              const colorClass = isCritical ? 'text-forensic-red' : 'text-amber-500';
              const borderClass = isCritical ? 'border-forensic-red/50' : 'border-amber-500/50';
              const bgClass = isCritical ? 'bg-forensic-red/5' : 'bg-amber-500/5';
              const shadowClass = isCritical ? 'shadow-[inset_0_0_15px_rgba(255,59,48,0.1),0_0_10px_rgba(255,59,48,0.15)]' : 'shadow-[inset_0_0_15px_rgba(245,158,11,0.1),0_0_10px_rgba(245,158,11,0.15)]';
              
              return (
                <div key={threat.id} className={`p-4 rounded-xl border ${borderClass} ${bgClass} ${shadowClass} flex gap-4 items-start group hover:bg-black/40 transition-colors backdrop-blur-md relative overflow-hidden`}>
                  <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center border ${borderClass} shrink-0 bg-black/60 shadow-inner`}>
                    <span className={`text-[9px] font-mono ${colorClass} drop-shadow-[0_0_5px_currentcolor]`}>0{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase tracking-wider ${colorClass} drop-shadow-[0_0_5px_currentcolor]`}>
                        {threat.label}
                      </span>
                      <Badge variant="outline" className={`text-[9px] font-mono ${borderClass} ${colorClass} bg-black/50 drop-shadow-[0_0_5px_currentcolor]`}>
                        {threat.intensity}% INTENSITY
                      </Badge>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed font-mono">
                      {threat.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border-t border-white/5 bg-black/80 p-8 flex flex-col items-center justify-center text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-forensic-green/50 mb-2 drop-shadow-[0_0_10px_rgba(48,255,100,0.5)]" />
          <h4 className="text-xs font-bold text-forensic-green drop-shadow-[0_0_5px_rgba(48,255,100,0.8)]">No Threats Detected</h4>
          <p className="text-[10px] text-muted-foreground font-mono max-w-[250px]">
            The autonomous search array did not identify any high-confidence threat vectors in this media.
          </p>
        </div>
      )}
    </SpotlightCard>
  );
}
