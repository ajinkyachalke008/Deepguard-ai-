'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { 
  Eye, EyeOff, Info, Layers, ZoomIn, Target, HelpCircle, Activity,
  Scan, Crosshair, Cpu
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  label: string;
  explanation: string;
}

interface ExplainabilityHeatmapProps {
  imageSrc: string;
  mediaType: 'image' | 'video';
  frameNumber?: number;
  regions?: HeatmapRegion[];
  onRegionClick?: (region: HeatmapRegion) => void;
  demoString?: string;
}

const DEFAULT_REGIONS: HeatmapRegion[] = [
  { 
    id: 'r1', x: 28, y: 18, width: 18, height: 22, intensity: 92,
    label: 'Ocular Highlight Mismatch',
    explanation: 'Light reflection in eyes does not geometrically correspond to a single light source.'
  },
  { 
    id: 'r2', x: 52, y: 42, width: 22, height: 20, intensity: 78,
    label: 'Texture Periodicity',
    explanation: 'Microscopic checkerboard patterns detected, characteristic of GAN upsampling.'
  },
  { 
    id: 'r3', x: 22, y: 65, width: 16, height: 18, intensity: 45,
    label: 'Boundary Artifact',
    explanation: 'Subtle edge discontinuity between foreground and background layers.'
  },
  { 
    id: 'r4', x: 68, y: 12, width: 14, height: 16, intensity: 88,
    label: 'Hair Strand Anomaly',
    explanation: 'Hair rendering shows unnatural uniformity and missing stray strands.'
  },
];

export function ExplainabilityHeatmap({
  imageSrc,
  mediaType,
  frameNumber = 1,
  regions = DEFAULT_REGIONS,
  onRegionClick,
  demoString,
}: ExplainabilityHeatmapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [opacity, setOpacity] = useState(65);
  const [threshold, setThreshold] = useState(30); // Add this
  const [hoveredRegion, setHoveredRegion] = useState<HeatmapRegion | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<HeatmapRegion | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visionMode, setVisionMode] = useState<'standard'|'xray'|'thermal'>('standard');
  const [scanEffect, setScanEffect] = useState({ duration: 3, delay: 0, height: 2, direction: 1, color: 'rgb(0, 255, 255)' });

  useEffect(() => {
    setMounted(true);
    // Randomize the scanline speed, height, direction, and hue each time it loads
    const colors = ['rgb(0, 255, 255)', 'rgb(255, 59, 48)', 'rgb(234, 179, 8)', 'rgb(168, 85, 247)'];
    setScanEffect({
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 1.5,
      height: 1 + Math.random() * 3,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }, []);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return { bg: 'bg-forensic-red', glow: 'shadow-[0_0_40px_rgba(255,59,48,0.6)]', text: 'text-forensic-red' };
    if (intensity >= 50) return { bg: 'bg-yellow-500', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.5)]', text: 'text-yellow-500' };
    return { bg: 'bg-forensic-cyan', glow: 'shadow-[0_0_20px_rgba(0,200,200,0.4)]', text: 'text-forensic-cyan' };
  };

  const filteredRegions = useMemo(() => 
    regions.filter(r => r.intensity >= threshold)
      .sort((a, b) => b.intensity - a.intensity), 
    [regions, threshold]
  );

  const getVisionClasses = () => {
    if (!showHeatmap) return '';
    switch (visionMode) {
      case 'xray': return 'invert contrast-150 grayscale brightness-125 hue-rotate-180 mix-blend-exclusion';
      case 'thermal': return 'sepia contrast-[200%] hue-rotate-[280deg] saturate-[300%] brightness-75';
      default: return 'brightness-75 contrast-110 saturate-[80%]';
    }
  };

  if (!mounted) return null;

  return (
    <SpotlightCard className="overflow-hidden p-0">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              XAI Explainability Heatmap
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px] p-3">
                    <p className="text-xs leading-relaxed">
                      Highlighted regions indicate areas the AI model focused on during analysis. 
                      <span className="block mt-2 font-bold text-yellow-500">These highlights are not definitive evidence of manipulation.</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            {demoString && (
              <Badge variant="outline" className="mt-1 mb-1 bg-primary/10 text-primary border-primary/20 text-[10px]">
                {demoString}
              </Badge>
            )}
            <p className="text-[10px] font-mono text-muted-foreground">
              {mediaType === 'video' ? `FRAME ${frameNumber}` : 'STATIC ANALYSIS'} • GRAD-CAM v2.1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Vision Mode Toggles */}
          <div className="flex items-center bg-black/40 rounded-full border border-white/10 p-0.5">
            <Button 
              size="sm" 
              variant={visionMode === 'standard' ? 'default' : 'ghost'} 
              onClick={() => setVisionMode('standard')}
              className={`h-6 px-2 text-[9px] rounded-full ${visionMode === 'standard' ? 'bg-primary text-black' : 'text-muted-foreground'}`}
            >
              <Scan className="w-3 h-3 mr-1" /> RAW
            </Button>
            <Button 
              size="sm" 
              variant={visionMode === 'xray' ? 'default' : 'ghost'} 
              onClick={() => setVisionMode('xray')}
              className={`h-6 px-2 text-[9px] rounded-full ${visionMode === 'xray' ? 'bg-white text-black' : 'text-muted-foreground'}`}
            >
              <Cpu className="w-3 h-3 mr-1" /> X-RAY
            </Button>
            <Button 
              size="sm" 
              variant={visionMode === 'thermal' ? 'default' : 'ghost'} 
              onClick={() => setVisionMode('thermal')}
              className={`h-6 px-2 text-[9px] rounded-full ${visionMode === 'thermal' ? 'bg-orange-500 text-black' : 'text-muted-foreground'}`}
            >
              <Activity className="w-3 h-3 mr-1" /> THERMAL
            </Button>
          </div>

          <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-mono">
            {filteredRegions.length} REGIONS
          </Badge>
          <Button 
            size="sm" 
            variant={showHeatmap ? "default" : "outline"} 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="rounded-full h-8 gap-2"
          >
            {showHeatmap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showHeatmap ? 'Visible' : 'Hidden'}
          </Button>
        </div>
      </div>

      <div className="relative aspect-video bg-black overflow-hidden group">
        {/* Animated Scanner Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4%_4%] pointer-events-none z-10" />
        
        <img 
          src={imageSrc} 
          alt="Analysis target"
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${getVisionClasses()}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop") {
              target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop";
            }
          }}
        />

        <AnimatePresence>
          {showHeatmap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: opacity / 100 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none"
            >
              {filteredRegions.map((region) => {
                const colors = getIntensityColor(region.intensity);
                const isHovered = hoveredRegion?.id === region.id;
                const isSelected = selectedRegion?.id === region.id;
                const isHighIntensity = region.intensity >= 80;

                return (
                  <motion.div
                    key={region.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isHovered || isSelected ? 1.05 : 1, 
                      opacity: [0.8, 1, 0.9, 1],
                      backgroundColor: isHovered 
                        ? 'rgba(255, 255, 255, 0.15)' 
                        : (isHighIntensity ? 'rgba(255, 59, 48, 0.15)' : region.intensity >= 50 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(0, 255, 255, 0.1)')
                    }}
                    transition={{ 
                      scale: { type: 'spring', stiffness: 300, damping: 20 },
                      opacity: { duration: 1.5 + Math.random() * 2, repeat: Infinity, repeatType: 'mirror', ease: "easeInOut" }
                    }}
                    className={`absolute rounded-xl border border-current pointer-events-auto cursor-pointer group`}
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.width}%`,
                      height: `${region.height}%`,
                      color: isHighIntensity ? 'rgb(255, 59, 48)' : (region.intensity >= 50 ? 'rgb(234, 179, 8)' : 'rgb(0, 255, 255)'),
                    }}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => {
                      setSelectedRegion(region);
                      onRegionClick?.(region);
                    }}
                  >
                    {/* Central Crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                      <Crosshair className="w-6 h-6 border-current opacity-70" />
                    </div>

                    {/* Concentric Ping for High Intensity */}
                    {isHighIntensity && (
                      <motion.div 
                        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-x-0 inset-y-0 rounded-xl border-2 border-current pointer-events-none shadow-[0_0_15px_currentcolor]"
                      />
                    )}

                    {/* ALWAYS-ON Technical Reticle Corners */}
                    <motion.div 
                      className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-current transition-all" 
                      animate={{ scale: isHovered || isSelected ? 1.5 : 1, opacity: isHovered || isSelected ? 1 : 0.5 }}
                    />
                    <motion.div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-current transition-all" 
                      animate={{ scale: isHovered || isSelected ? 1.5 : 1, opacity: isHovered || isSelected ? 1 : 0.5 }}
                    />
                    <motion.div 
                      className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-current transition-all" 
                      animate={{ scale: isHovered || isSelected ? 1.5 : 1, opacity: isHovered || isSelected ? 1 : 0.5 }}
                    />
                    <motion.div 
                      className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-current transition-all" 
                      animate={{ scale: isHovered || isSelected ? 1.5 : 1, opacity: isHovered || isSelected ? 1 : 0.5 }}
                    />

                    {/* ALWAYS-ON Floating Forensic Suspect Label */}
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 border border-current px-2 py-0.5 rounded shadow-[0_0_10px_currentcolor] flex items-center gap-1.5 z-30 pointer-events-none"
                    >
                      <Target className="w-3 h-3 animate-pulse" />
                      <span className="text-[9px] font-black tracking-widest uppercase text-white">{region.label}</span>
                      <span className="text-[8px] font-mono opacity-80 border-l border-white/20 pl-1">{region.intensity}%</span>
                    </motion.div>

                    {/* Detailed Tooltip on Hover/Select */}
                    <AnimatePresence>
                      {(isHovered || isSelected) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-3 z-[100] min-w-[220px]"
                        >
                          <div className="glass p-4 rounded-xl border-white/20 space-y-2 shadow-2xl relative">
                            {/* Inner Accent Line */}
                            <div className={`absolute top-0 left-0 w-full h-[2px] ${colors.bg} opacity-50`} />
                            
                            <div className={`text-[11px] font-black uppercase tracking-widest ${colors.text}`}>{region.label}</div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                              {region.explanation}
                            </p>
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                              <Target className="w-3 h-3 text-primary/60" />
                              <span className="text-[9px] font-mono text-muted-foreground uppercase">
                                SIGNAL_CERTAINTY: {region.intensity}%
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              <div className="absolute inset-0 grid grid-cols-16 grid-rows-9 opacity-10 pointer-events-none">
                {Array.from({ length: 144 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="border border-white/20"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
                  />
                ))}
              </div>

              {/* Dynamic Sweeping Scanline */}
              <motion.div
                initial={{ top: scanEffect.direction === 1 ? '-10%' : '110%' }}
                animate={{ top: scanEffect.direction === 1 ? '110%' : '-10%' }}
                transition={{ duration: scanEffect.duration, delay: scanEffect.delay, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 pointer-events-none z-10"
                style={{ 
                  height: `${scanEffect.height}px`,
                  backgroundColor: scanEffect.color,
                  opacity: 0.6,
                  boxShadow: `0 0 ${scanEffect.height * 8}px ${scanEffect.color}, 0 0 ${scanEffect.height * 2}px white`
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="glass border-white/20 px-2 py-1 text-[9px] font-mono">
            <Layers className="w-3 h-3 mr-1 text-primary" />
            GRAD-CAM OVERLAY
          </Badge>
        </div>

        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="glass border-yellow-500/30 bg-yellow-500/10 text-yellow-500 px-2 py-1 text-[9px]">
            <Info className="w-3 h-3 mr-1" />
            Highlights are explanatory, not conclusive
          </Badge>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5">
        <div className="space-y-6">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-white/5 p-2 rounded-lg">
            <span>Filtering Controls</span>
            <Layers className="w-3 h-3" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground uppercase">
                <span>Overlay Density</span>
                <span>{opacity}%</span>
              </div>
              <Slider value={[opacity]} min={10} max={100} onValueChange={(val) => setOpacity(val[0])} className="h-1 shadow-inner" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground uppercase">
                <span>Saliency Threshold</span>
                <span>min {threshold}% intensity</span>
              </div>
              <Slider value={[threshold]} min={0} max={90} onValueChange={(val) => setThreshold(val[0])} className="h-1" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase opacity-60">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-forensic-red" /> High Signal</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Medium Signal</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-forensic-cyan" /> Low Signal</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-white/5 p-2 rounded-lg">
            <span>Anomalous Regions</span>
            <Badge variant="outline" className="text-[8px] bg-primary/10 border-primary/20">{filteredRegions.length} Active</Badge>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
            {filteredRegions.map((region) => {
              const colors = getIntensityColor(region.intensity);
              const isSelected = selectedRegion?.id === region.id;
              return (
                <div 
                  key={region.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected ? 'bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedRegion(isSelected ? null : region)}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="heatmap-selection"
                      className="absolute inset-y-0 left-0 w-1 bg-primary"
                    />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className={`w-3.5 h-3.5 ${colors.text}`} />
                      <span className={`text-[11px] font-black uppercase tracking-wide ${colors.text}`}>{region.label}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-mono font-bold ${colors.text} border-${colors.text}/20 bg-black/50`}>
                      {region.intensity}% SIGNAL
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed pl-5">
                    {region.explanation}
                  </p>
                  
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/10 pl-5 space-y-2"
                      >
                        <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase">
                          <span>Confidence Impact</span>
                          <span className={region.intensity > 80 ? 'text-forensic-red' : 'text-primary'}>High</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase">
                          <span>Detection Vector</span>
                          <span>GRAD-CAM Attn</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-white/5 bg-yellow-500/5">
        <p className="text-[10px] text-yellow-500/80 text-center font-mono">
          NOTICE: Explainability highlights are not definitive evidence. They indicate model attention areas only.
        </p>
      </div>
    </SpotlightCard>
  );
}
