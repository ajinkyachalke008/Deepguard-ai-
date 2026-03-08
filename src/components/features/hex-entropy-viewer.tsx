'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Binary, AlertTriangle, Eye, EyeOff, HelpCircle, FileCode, BarChart3,
  ChevronDown, ChevronUp, ZoomIn, ZoomOut, Search, Lock, FileWarning, Shield
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Anomaly {
  offset: number;
  length: number;
  type: 'appended' | 'polyglot' | 'encrypted' | 'steganography' | 'eof_data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface HexEntropyViewerProps {
  fileName?: string;
  fileSize?: number;
  anomalies?: Anomaly[];
}

const generateMockHexData = (rows: number): string[] => {
  return Array.from({ length: rows }, (_, i) => {
    const offset = (i * 16).toString(16).padStart(8, '0').toUpperCase();
    const hex = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(' ');
    const ascii = Array.from({ length: 16 }, () => {
      const code = Math.floor(Math.random() * 94) + 32;
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
    }).join('');
    return `${offset}  ${hex}  |${ascii}|`;
  });
};

const generateEntropyData = (points: number, hasAnomaly: boolean): number[] => {
  return Array.from({ length: points }, (_, i) => {
    const base = 0.6 + Math.random() * 0.2;
    if (hasAnomaly && i > points * 0.7 && i < points * 0.85) {
      return 0.95 + Math.random() * 0.05;
    }
    if (hasAnomaly && i > points * 0.4 && i < points * 0.45) {
      return 0.1 + Math.random() * 0.1;
    }
    return base;
  });
};

const DEFAULT_ANOMALIES: Anomaly[] = [
  { 
    offset: 0x2F400, 
    length: 512, 
    type: 'appended', 
    severity: 'medium',
    description: 'Data detected beyond standard EOF marker. May indicate hidden payload.'
  },
  { 
    offset: 0x1A200, 
    length: 64, 
    type: 'encrypted', 
    severity: 'high',
    description: 'High-entropy block suggesting encrypted or compressed data.'
  },
  { 
    offset: 0x0800, 
    length: 128, 
    type: 'steganography', 
    severity: 'low',
    description: 'LSB pattern deviation detected. Possible steganographic content.'
  },
];

export function HexEntropyViewer({
  fileName = 'sample_image.jpg',
  fileSize = 2457600,
  anomalies = DEFAULT_ANOMALIES,
}: HexEntropyViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [hexData, setHexData] = useState<string[]>([]);
  const [entropyData, setEntropyData] = useState<number[]>([]);
  const [highlightAnomalies, setHighlightAnomalies] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredOffset, setHoveredOffset] = useState<number | null>(null);
  const hexContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setHexData(generateMockHexData(100));
    setEntropyData(generateEntropyData(200, anomalies.length > 0));
  }, [anomalies.length]);

  const averageEntropy = useMemo(() => {
    if (entropyData.length === 0) return 0;
    return entropyData.reduce((a, b) => a + b, 0) / entropyData.length;
  }, [entropyData]);

  const getSeverityConfig = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return { color: 'text-forensic-red', bg: 'bg-forensic-red', border: 'border-forensic-red' };
      case 'high':
        return { color: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500' };
      case 'medium':
        return { color: 'text-yellow-500', bg: 'bg-yellow-500', border: 'border-yellow-500' };
      case 'low':
        return { color: 'text-forensic-cyan', bg: 'bg-forensic-cyan', border: 'border-forensic-cyan' };
    }
  };

  const getTypeIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'appended': return <FileWarning className="w-3.5 h-3.5" />;
      case 'polyglot': return <FileCode className="w-3.5 h-3.5" />;
      case 'encrypted': return <Lock className="w-3.5 h-3.5" />;
      case 'steganography': return <Eye className="w-3.5 h-3.5" />;
      case 'eof_data': return <Binary className="w-3.5 h-3.5" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isOffsetHighlighted = (rowIndex: number) => {
    if (!highlightAnomalies) return false;
    const rowOffset = rowIndex * 16;
    return anomalies.some(a => rowOffset >= a.offset && rowOffset < a.offset + a.length);
  };

  const getRowAnomaly = (rowIndex: number) => {
    const rowOffset = rowIndex * 16;
    return anomalies.find(a => rowOffset >= a.offset && rowOffset < a.offset + a.length);
  };

  if (!mounted) return null;

  return (
    <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Binary className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              Hex & Entropy Viewer
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[280px] p-3">
                    <p className="text-xs leading-relaxed">
                      Raw binary analysis for expert forensic inspection.
                      <span className="block mt-2 font-bold text-yellow-500">Binary anomalies do not automatically indicate malicious or fake content.</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              {fileName} • {formatBytes(fileSize)} • EXPERT MODE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-mono">
            {anomalies.length} ANOMALIES
          </Badge>
          <Button 
            size="sm" 
            variant={highlightAnomalies ? "default" : "outline"} 
            onClick={() => setHighlightAnomalies(!highlightAnomalies)}
            className="rounded-full h-8 gap-2"
          >
            {highlightAnomalies ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Anomalies
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Entropy Distribution
          </span>
          <span className="text-[10px] font-mono">
            Average: <span className={averageEntropy > 0.9 ? 'text-forensic-red' : averageEntropy > 0.75 ? 'text-yellow-500' : 'text-forensic-green'}>
              {(averageEntropy * 100).toFixed(1)}%
            </span>
          </span>
        </div>

        <div className="relative h-20 w-full bg-zinc-950 rounded-xl border border-white/10 overflow-hidden">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${entropyData.length} 100`}>
            <defs>
              <linearGradient id="entropyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff3b30" />
                <stop offset="30%" stopColor="#eab308" />
                <stop offset="70%" stopColor="#00c8c8" />
                <stop offset="100%" stopColor="#00c8c8" />
              </linearGradient>
            </defs>

            <path
              d={`M 0 100 ${entropyData.map((v, i) => `L ${i} ${100 - v * 100}`).join(' ')} L ${entropyData.length} 100 Z`}
              fill="url(#entropyGradient)"
              opacity={0.3}
            />

            <path
              d={`M 0 ${100 - entropyData[0] * 100} ${entropyData.map((v, i) => `L ${i} ${100 - v * 100}`).join(' ')}`}
              fill="none"
              stroke="url(#entropyGradient)"
              strokeWidth={1.5}
            />

            <line x1="0" y1="10" x2={entropyData.length} y2="10" stroke="#ff3b30" strokeWidth={0.5} strokeDasharray="4,4" opacity={0.5} />
            <line x1="0" y1="25" x2={entropyData.length} y2="25" stroke="#eab308" strokeWidth={0.5} strokeDasharray="4,4" opacity={0.3} />

            {anomalies.map((anomaly, i) => {
              const startX = (anomaly.offset / fileSize) * entropyData.length;
              const width = Math.max(2, (anomaly.length / fileSize) * entropyData.length);
              return (
                <rect
                  key={i}
                  x={startX}
                  y={0}
                  width={width}
                  height={100}
                  fill={anomaly.severity === 'critical' || anomaly.severity === 'high' ? '#ff3b30' : '#eab308'}
                  opacity={highlightAnomalies ? 0.3 : 0}
                  className="cursor-pointer transition-opacity"
                  onClick={() => setSelectedAnomaly(anomaly)}
                />
              );
            })}
          </svg>

          <div className="absolute top-1 right-2 flex gap-2 text-[8px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-forensic-red" /> High</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-yellow-500" /> Medium</span>
            <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-forensic-cyan" /> Normal</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Detected Anomalies</span>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {anomalies.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No binary anomalies detected
            </div>
          ) : (
            anomalies.map((anomaly, i) => {
              const config = getSeverityConfig(anomaly.severity);
              const isSelected = selectedAnomaly === anomaly;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedAnomaly(isSelected ? null : anomaly)}
                  className={`p-3 rounded-xl bg-white/5 border cursor-pointer transition-all ${
                    isSelected ? `${config.border}/50 ${config.bg}/10` : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${config.bg}/20 flex items-center justify-center ${config.color}`}>
                        {getTypeIcon(anomaly.type)}
                      </div>
                      <div>
                        <div className="text-xs font-medium capitalize">{anomaly.type.replace('_', ' ')}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          0x{anomaly.offset.toString(16).toUpperCase()} • {anomaly.length} bytes
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${config.bg}/10 ${config.color} ${config.border}/30 text-[9px]`}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 pt-2 border-t border-white/10"
                      >
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {anomaly.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5" />
            Hex Dump (Read-Only)
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))} className="h-6 w-6 p-0">
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-[10px] font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button size="sm" variant="ghost" onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))} className="h-6 w-6 p-0">
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div 
          ref={hexContainerRef}
          className="relative h-48 overflow-auto bg-zinc-950 rounded-xl border border-white/10 p-3 font-mono"
          style={{ fontSize: `${10 * zoomLevel}px` }}
        >
          <div className="text-[9px] text-muted-foreground mb-2 border-b border-white/10 pb-1 sticky top-0 bg-zinc-950 z-10">
            OFFSET    00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  |ASCII-----------|
          </div>
          {hexData.slice(0, 50).map((line, i) => {
            const rowAnomaly = getRowAnomaly(i);
            const isHighlighted = isOffsetHighlighted(i);
            const severityConfig = rowAnomaly ? getSeverityConfig(rowAnomaly.severity) : null;
            
            return (
              <div 
                key={i}
                className={`leading-relaxed transition-colors ${
                  isHighlighted && highlightAnomalies
                    ? `${severityConfig?.bg}/20 ${severityConfig?.color}`
                    : 'text-forensic-cyan/80 hover:bg-white/5'
                }`}
                onMouseEnter={() => setHoveredOffset(i * 16)}
                onMouseLeave={() => setHoveredOffset(null)}
              >
                {line}
              </div>
            );
          })}
        </div>

        {hoveredOffset !== null && (
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>Offset: 0x{hoveredOffset.toString(16).toUpperCase().padStart(8, '0')}</span>
            <span>Decimal: {hoveredOffset}</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/5 bg-orange-500/5">
        <div className="flex items-center justify-center gap-2 text-[10px] text-orange-500/80 font-mono">
          <Shield className="w-3.5 h-3.5" />
          EXPERT MODE: Binary anomalies do not automatically indicate malicious or fake content. For forensic analysis only.
        </div>
      </div>
    </Card>
  );
}
