'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, SkipBack, SkipForward, Ghost, Layers, Activity, 
  AlertTriangle, Info, HelpCircle, Eye, EyeOff, Maximize2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LandmarkPoint {
  x: number;
  y: number;
  displacement: number;
}

interface FrameData {
  frameNumber: number;
  timestamp: number;
  instabilityScore: number;
  landmarks: LandmarkPoint[];
  ghostIntensity: number;
}

interface DifferentialFrameAnalysisProps {
  videoSrc?: string;
  thumbnailSrc: string;
  totalFrames?: number;
  fps?: number;
  frameData?: FrameData[];
  onFrameSelect?: (frame: FrameData) => void;
}

const generateMockFrameData = (totalFrames: number): FrameData[] => {
  return Array.from({ length: totalFrames }, (_, i) => {
    const isAnomalous = (i > 35 && i < 55) || (i > 80 && i < 95);
    const baseInstability = isAnomalous ? Math.random() * 40 + 50 : Math.random() * 20 + 5;
    
    return {
      frameNumber: i + 1,
      timestamp: (i / 30) * 1000,
      instabilityScore: Math.round(baseInstability),
      ghostIntensity: isAnomalous ? Math.random() * 60 + 40 : Math.random() * 15,
      landmarks: Array.from({ length: 68 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        displacement: isAnomalous ? Math.random() * 8 + 2 : Math.random() * 2,
      })),
    };
  });
};

export function DifferentialFrameAnalysis({
  videoSrc,
  thumbnailSrc,
  totalFrames = 120,
  fps = 30,
  frameData: providedFrameData,
  onFrameSelect,
}: DifferentialFrameAnalysisProps) {
  const [mounted, setMounted] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGhosting, setShowGhosting] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [viewMode, setViewMode] = useState<'ghost' | 'diff' | 'landmarks'>('ghost');

  const frameData = useMemo(() => 
    providedFrameData || generateMockFrameData(totalFrames),
    [providedFrameData, totalFrames]
  );

  const currentFrameData = useMemo(() => 
    frameData[currentFrame - 1] || frameData[0],
    [frameData, currentFrame]
  );

  const anomalousRegions = useMemo(() => {
    const regions: { start: number; end: number; maxScore: number }[] = [];
    let inRegion = false;
    let regionStart = 0;
    let maxScore = 0;

    frameData.forEach((frame, i) => {
      if (frame.instabilityScore > 40) {
        if (!inRegion) {
          inRegion = true;
          regionStart = i;
          maxScore = frame.instabilityScore;
        } else {
          maxScore = Math.max(maxScore, frame.instabilityScore);
        }
      } else if (inRegion) {
        regions.push({ start: regionStart, end: i - 1, maxScore });
        inRegion = false;
      }
    });

    if (inRegion) {
      regions.push({ start: regionStart, end: frameData.length - 1, maxScore });
    }

    return regions;
  }, [frameData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
      }, 1000 / fps);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalFrames, fps]);

  const formatTimestamp = useCallback((frame: number) => {
    const seconds = frame / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }, [fps]);

  const getInstabilityColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-forensic-red', text: 'text-forensic-red', border: 'border-forensic-red' };
    if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
    return { bg: 'bg-forensic-green', text: 'text-forensic-green', border: 'border-forensic-green' };
  };

  const handleFrameClick = (frame: number) => {
    setCurrentFrame(frame);
    setIsPlaying(false);
    onFrameSelect?.(frameData[frame - 1]);
  };

  if (!mounted) return null;

  const colors = getInstabilityColor(currentFrameData.instabilityScore);

  return (
    <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Ghost className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              Differential Frame Analysis
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px] p-3">
                    <p className="text-xs leading-relaxed">
                      Analyzes frame-to-frame facial landmark displacement to detect temporal inconsistencies.
                      <span className="block mt-2 font-bold text-yellow-500">Artifacts may also occur from low-quality video or compression.</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              {totalFrames} FRAMES • {fps} FPS • LSTM-TEMPORAL v1.8
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {anomalousRegions.length > 0 && (
            <Badge variant="outline" className="bg-forensic-red/10 border-forensic-red/30 text-forensic-red text-[10px]">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {anomalousRegions.length} ANOMALOUS REGION{anomalousRegions.length > 1 ? 'S' : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="relative aspect-video bg-zinc-950">
        <img 
          src={thumbnailSrc} 
          alt="Video frame"
          className="w-full h-full object-cover"
        />

        <AnimatePresence>
          {showGhosting && viewMode === 'ghost' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: currentFrameData.ghostIntensity / 100 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <img 
                src={thumbnailSrc} 
                alt="Ghost overlay"
                className="w-full h-full object-cover opacity-50 mix-blend-difference"
                style={{ 
                  transform: `translate(${currentFrameData.instabilityScore > 40 ? '2px' : '0'}, ${currentFrameData.instabilityScore > 40 ? '1px' : '0'})`,
                  filter: `blur(${currentFrameData.instabilityScore > 60 ? '2px' : '0'}) hue-rotate(${currentFrameData.instabilityScore * 2}deg)`
                }}
              />
              
              {currentFrameData.instabilityScore > 40 && (
                <div className="absolute inset-0 bg-forensic-red/10 mix-blend-overlay animate-pulse" />
              )}
            </motion.div>
          )}

          {showLandmarks && viewMode === 'landmarks' && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {currentFrameData.landmarks.slice(0, 20).map((point, i) => {
                const isUnstable = point.displacement > 3;
                return (
                  <g key={i}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isUnstable ? 1.5 : 0.8}
                      fill={isUnstable ? '#ff3b30' : '#00c8c8'}
                      opacity={0.8}
                    />
                    {isUnstable && (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={3}
                        fill="none"
                        stroke="#ff3b30"
                        strokeWidth={0.3}
                        opacity={0.5}
                        className="animate-ping"
                      />
                    )}
                    {i < currentFrameData.landmarks.length - 1 && i % 4 === 0 && (
                      <line
                        x1={point.x}
                        y1={point.y}
                        x2={currentFrameData.landmarks[i + 1]?.x || point.x}
                        y2={currentFrameData.landmarks[i + 1]?.y || point.y}
                        stroke={isUnstable ? '#ff3b30' : '#00c8c8'}
                        strokeWidth={0.2}
                        opacity={0.4}
                      />
                    )}
                  </g>
                );
              })}
            </motion.svg>
          )}

          {viewMode === 'diff' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${currentFrameData.instabilityScore > 40 ? 'rgba(255,59,48,0.4)' : 'rgba(0,200,200,0.2)'} 0%, transparent 60%)`,
              }}
            />
          )}
        </AnimatePresence>

        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="outline" className="glass border-white/20 px-2 py-1 text-[9px] font-mono">
            FRAME {currentFrame}/{totalFrames}
          </Badge>
          <Badge variant="outline" className="glass border-white/20 px-2 py-1 text-[9px] font-mono">
            {formatTimestamp(currentFrame)}
          </Badge>
        </div>

        <div className="absolute top-3 right-3">
          <Badge 
            variant="outline" 
            className={`glass ${colors.border}/30 ${colors.bg}/10 ${colors.text} px-2 py-1 text-[9px] font-mono`}
          >
            INSTABILITY: {currentFrameData.instabilityScore}%
          </Badge>
        </div>

        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button 
            size="sm" 
            variant={viewMode === 'ghost' ? "default" : "outline"}
            onClick={() => setViewMode('ghost')}
            className="rounded-full h-7 px-3 text-[10px]"
          >
            <Ghost className="w-3 h-3 mr-1" />
            Ghost
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'diff' ? "default" : "outline"}
            onClick={() => setViewMode('diff')}
            className="rounded-full h-7 px-3 text-[10px]"
          >
            <Layers className="w-3 h-3 mr-1" />
            Diff
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'landmarks' ? "default" : "outline"}
            onClick={() => setViewMode('landmarks')}
            className="rounded-full h-7 px-3 text-[10px]"
          >
            <Activity className="w-3 h-3 mr-1" />
            Landmarks
          </Button>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleFrameClick(Math.max(1, currentFrame - 10))}
            className="rounded-full h-8 w-8 p-0"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="default"
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-full h-8 w-8 p-0"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleFrameClick(Math.min(totalFrames, currentFrame + 10))}
            className="rounded-full h-8 w-8 p-0"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>

          <div className="flex-1 relative">
            <div className="absolute inset-0 h-full pointer-events-none">
              {anomalousRegions.map((region, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 bg-forensic-red/20 border-x border-forensic-red/40"
                  style={{
                    left: `${(region.start / totalFrames) * 100}%`,
                    width: `${((region.end - region.start + 1) / totalFrames) * 100}%`,
                  }}
                />
              ))}
            </div>
            <Slider
              value={[currentFrame]}
              onValueChange={(val) => handleFrameClick(val[0])}
              max={totalFrames}
              min={1}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="relative h-16 w-full bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${totalFrames} 100`}>
            <defs>
              <linearGradient id="instabilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#eab308" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00c8c8" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            
            <path
              d={`M 0 100 ${frameData.map((f, i) => `L ${i} ${100 - f.instabilityScore}`).join(' ')} L ${totalFrames} 100 Z`}
              fill="url(#instabilityGradient)"
              opacity={0.4}
            />
            
            <path
              d={`M 0 ${100 - frameData[0].instabilityScore} ${frameData.map((f, i) => `L ${i} ${100 - f.instabilityScore}`).join(' ')}`}
              fill="none"
              stroke="#00c8c8"
              strokeWidth={1}
              opacity={0.8}
            />
            
            <line
              x1={currentFrame}
              y1={0}
              x2={currentFrame}
              y2={100}
              stroke="#fff"
              strokeWidth={1}
              opacity={0.8}
            />
          </svg>
          
          <div className="absolute bottom-1 left-2 text-[8px] font-mono text-muted-foreground">00:00</div>
          <div className="absolute bottom-1 right-2 text-[8px] font-mono text-muted-foreground">{formatTimestamp(totalFrames)}</div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <span className="uppercase">Timeline Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-forensic-red/40" />
            <span>High Instability</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/40" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-forensic-cyan/40" />
            <span>Stable</span>
          </div>
        </div>

        {anomalousRegions.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Detected Anomalous Regions</div>
            <div className="flex flex-wrap gap-2">
              {anomalousRegions.map((region, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  onClick={() => handleFrameClick(region.start + 1)}
                  className="h-7 px-3 text-[10px] rounded-full bg-forensic-red/10 border-forensic-red/30 text-forensic-red hover:bg-forensic-red/20"
                >
                  {formatTimestamp(region.start + 1)} - {formatTimestamp(region.end + 1)}
                  <Badge className="ml-2 h-4 px-1 text-[8px] bg-forensic-red/20">{region.maxScore}%</Badge>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/5 bg-yellow-500/5">
        <p className="text-[10px] text-yellow-500/80 text-center font-mono">
          NOTICE: Temporal artifacts may also occur due to low-quality video or compression. Results are probabilistic.
        </p>
      </div>
    </Card>
  );
}
