'use client';

/**
 * DeepGuard AI — Hex & Entropy Viewer (Real Data Processing)
 * =============================================================
 * This component accepts a raw File object and performs genuine
 * Shannon Entropy analysis with a Web Worker, generates real hex
 * dump rows from the binary data, and auto-detects anomalies
 * (encrypted blocks, polyglot payloads, steganographic patterns).
 *
 * Falls back gracefully to placeholder state when no file is provided.
 *
 * Built by Ajinkya Arun Chalke — DeepGuard AI Research Lab
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Binary, AlertTriangle, Eye, EyeOff, HelpCircle, FileCode, BarChart3,
  ChevronDown, ChevronUp, ZoomIn, ZoomOut, Search, Lock, FileWarning, Shield,
  Loader2, Upload
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  analyzeFileEntropy,
  generateHexRows,
  getTotalHexRows,
  type EntropyResult,
  type EntropyAnomaly,
  type HexRow,
} from '@/lib/entropy-engine';

// ---------------------------------------------------------------------------
// Backward-compatible Anomaly type (supports old + new props)
// ---------------------------------------------------------------------------

interface LegacyAnomaly {
  offset: number;
  length: number;
  type: 'appended' | 'polyglot' | 'encrypted' | 'steganography' | 'eof_data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface HexEntropyViewerProps {
  /** Real file for genuine binary analysis */
  file?: File;
  /** Fallback display name */
  fileName?: string;
  /** Fallback display size */
  fileSize?: number;
  /** Legacy static anomalies (ignored if file is provided) */
  anomalies?: LegacyAnomaly[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HexEntropyViewer({
  file,
  fileName: fallbackFileName = 'sample_image.jpg',
  fileSize: fallbackFileSize = 2457600,
  anomalies: legacyAnomalies,
}: HexEntropyViewerProps) {
  const [mounted, setMounted] = useState(false);

  // Analysis state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [entropyResult, setEntropyResult] = useState<EntropyResult | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // UI state
  const [highlightAnomalies, setHighlightAnomalies] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<LegacyAnomaly | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredOffset, setHoveredOffset] = useState<number | null>(null);
  const [scrollRowStart, setScrollRowStart] = useState(0);

  const hexContainerRef = useRef<HTMLDivElement>(null);

  // Derived values
  const displayFileName = file?.name || fallbackFileName;
  const displayFileSize = file?.size || fallbackFileSize;
  const anomalies: LegacyAnomaly[] = entropyResult?.anomalies || legacyAnomalies || [];
  const entropyData = entropyResult?.entropyData || [];
  const averageEntropy = entropyResult?.averageEntropy || 0;

  // ---------------------------------------------------------------------------
  // Real file processing
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!file || file.size === 0) return;

    let cancelled = false;
    setIsProcessing(true);
    setProcessProgress(0);
    setAnalysisError(null);

    analyzeFileEntropy(file, 1024, (percent) => {
      if (!cancelled) setProcessProgress(percent);
    })
      .then(({ entropyResult: result, buffer }) => {
        if (!cancelled) {
          setEntropyResult(result);
          setFileBuffer(buffer);
          setIsProcessing(false);
          setProcessProgress(100);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAnalysisError(err.message || 'Entropy analysis failed');
          setIsProcessing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  // ---------------------------------------------------------------------------
  // Hex dump rendering (virtualized)
  // ---------------------------------------------------------------------------

  const VISIBLE_ROWS = 50;

  const hexRows: HexRow[] = useMemo(() => {
    if (!fileBuffer) return [];
    return generateHexRows(fileBuffer, scrollRowStart, VISIBLE_ROWS);
  }, [fileBuffer, scrollRowStart]);

  const totalHexRows = useMemo(() => {
    if (!fileBuffer) return 0;
    return getTotalHexRows(fileBuffer.byteLength);
  }, [fileBuffer]);

  const scrollToOffset = useCallback((offset: number) => {
    if (!fileBuffer) return;
    const row = Math.floor(offset / 16);
    setScrollRowStart(row);
    
    // Briefly flash the hex container
    if (hexContainerRef.current) {
      hexContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [fileBuffer]);

  const handleHexScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!fileBuffer) return;
    const el = e.currentTarget;
    const scrollRatio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
    const maxStart = Math.max(0, totalHexRows - VISIBLE_ROWS);
    setScrollRowStart(Math.floor(scrollRatio * maxStart));
  }, [fileBuffer, totalHexRows]);

  // ---------------------------------------------------------------------------
  // Anomaly helpers
  // ---------------------------------------------------------------------------

  const getSeverityConfig = (severity: LegacyAnomaly['severity']) => {
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

  const getTypeIcon = (type: LegacyAnomaly['type']) => {
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

  const isOffsetHighlighted = (offsetNum: number) => {
    if (!highlightAnomalies) return false;
    return anomalies.some(a => offsetNum >= a.offset && offsetNum < a.offset + a.length);
  };

  const getRowAnomaly = (offsetNum: number) => {
    return anomalies.find(a => offsetNum >= a.offset && offsetNum < a.offset + a.length);
  };

  if (!mounted) return null;

  // ---------------------------------------------------------------------------
  // Processing State UI
  // ---------------------------------------------------------------------------

  if (isProcessing) {
    return (
      <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center gap-6 min-h-[300px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Binary className="w-12 h-12 text-primary" />
          </motion.div>
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold">Analyzing Binary Structure...</h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              Computing Shannon Entropy across {formatBytes(displayFileSize)}
            </p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <Progress value={processProgress} className="h-2" />
            <p className="text-[10px] font-mono text-center text-muted-foreground">
              {processProgress}% — Web Worker active
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // Error State UI
  // ---------------------------------------------------------------------------

  if (analysisError) {
    return (
      <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]">
          <AlertTriangle className="w-10 h-10 text-forensic-red" />
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-forensic-red">Analysis Failed</h3>
            <p className="text-[10px] font-mono text-muted-foreground max-w-xs">{analysisError}</p>
          </div>
        </div>
      </Card>
    );
  }

  // ---------------------------------------------------------------------------
  // No file provided — placeholder state
  // ---------------------------------------------------------------------------

  if (!file && !entropyResult) {
    return (
      <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Binary className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Hex & Entropy Viewer</h3>
              <p className="text-[10px] font-mono text-muted-foreground">
                {fallbackFileName} • {formatBytes(fallbackFileSize)} • AWAITING FILE
              </p>
            </div>
          </div>
        </div>
        <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[200px]">
          <Upload className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground text-center">
            Binary analysis requires the original file data.<br />
            Upload a file to see real hex dump & entropy distribution.
          </p>
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

  // ---------------------------------------------------------------------------
  // Main Render: Real Data
  // ---------------------------------------------------------------------------

  return (
    <Card className="glass rounded-[2rem] border-white/5 overflow-hidden">
      {/* Header */}
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
                      Raw binary analysis using real Shannon Entropy computation.
                      <span className="block mt-2 font-bold text-yellow-500">Binary anomalies do not automatically indicate malicious or fake content.</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              {displayFileName} • {formatBytes(displayFileSize)} • {entropyResult ? 'LIVE DATA' : 'EXPERT MODE'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-mono">
            {anomalies.length} ANOMALIES
          </Badge>
          {entropyResult && (
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-[10px] font-mono text-primary">
              {entropyResult.totalBlocks} BLOCKS
            </Badge>
          )}
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

      {/* Entropy Distribution Graph */}
      {entropyData.length > 0 && (
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Entropy Distribution — Shannon H(x) per {entropyResult?.blockSize || 1024}B block
            </span>
            <span className="text-[10px] font-mono">
              Average: <span className={averageEntropy > 0.9 ? 'text-forensic-red' : averageEntropy > 0.75 ? 'text-yellow-500' : 'text-forensic-green'}>
                {(averageEntropy * 100).toFixed(1)}%
              </span>
              {entropyResult && (
                <span className="ml-2 text-muted-foreground">
                  (min: {(entropyResult.minEntropy * 100).toFixed(1)}% / max: {(entropyResult.maxEntropy * 100).toFixed(1)}%)
                </span>
              )}
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

              {/* Filled area */}
              <path
                d={`M 0 100 ${entropyData.map((v, i) => `L ${i} ${100 - v * 100}`).join(' ')} L ${entropyData.length} 100 Z`}
                fill="url(#entropyGradient)"
                opacity={0.3}
              />

              {/* Line trace */}
              <path
                d={`M 0 ${100 - entropyData[0] * 100} ${entropyData.map((v, i) => `L ${i} ${100 - v * 100}`).join(' ')}`}
                fill="none"
                stroke="url(#entropyGradient)"
                strokeWidth={1.5}
              />

              {/* Threshold lines */}
              <line x1="0" y1="2" x2={entropyData.length} y2="2" stroke="#ff3b30" strokeWidth={0.5} strokeDasharray="4,4" opacity={0.5} />
              <line x1="0" y1="25" x2={entropyData.length} y2="25" stroke="#eab308" strokeWidth={0.5} strokeDasharray="4,4" opacity={0.3} />

              {/* Anomaly highlight regions */}
              {anomalies.map((anomaly, i) => {
                const startX = (anomaly.offset / displayFileSize) * entropyData.length;
                const width = Math.max(2, (anomaly.length / displayFileSize) * entropyData.length);
                return (
                  <rect
                    key={i}
                    x={startX}
                    y={0}
                    width={width}
                    height={100}
                    fill={anomaly.severity === 'critical' || anomaly.severity === 'high' ? '#ff3b30' : '#eab308'}
                    opacity={highlightAnomalies ? 0.3 : 0}
                    className="cursor-pointer transition-opacity hover:opacity-50"
                    onClick={() => {
                      setSelectedAnomaly(anomaly);
                      scrollToOffset(anomaly.offset);
                    }}
                  />
                );
              })}
            </svg>

            <div className="absolute top-1 right-2 flex gap-2 text-[8px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-forensic-red" /> High (&gt;98%)</span>
              <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-yellow-500" /> Medium</span>
              <span className="flex items-center gap-1"><div className="w-2 h-0.5 bg-forensic-cyan" /> Normal</span>
            </div>
          </div>
        </div>
      )}

      {/* Byte & Anomaly Analysis */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Global Byte Distribution</span>
        </div>
        
        {entropyResult?.byteFrequencies ? (
          <div className="relative h-16 w-full bg-zinc-950 rounded-xl border border-white/10 flex items-end gap-[1px] p-2 overflow-hidden">
            {entropyResult.byteFrequencies.map((freq, i) => {
              const maxFreq = Math.max(...entropyResult.byteFrequencies);
              const height = (freq / (maxFreq || 1)) * 100;
              return (
                <div 
                  key={i} 
                  className={`flex-1 ${height > 50 ? 'bg-primary/60' : 'bg-primary/20'} rounded-t-sm hover:bg-primary transition-colors`}
                  style={{ height: `${Math.max(1, height)}%` }}
                  title={`0x${i.toString(16).toUpperCase()}: ${freq} occurrences`}
                />
              );
            })}
            <div className="absolute bottom-1 left-2 text-[8px] font-mono text-muted-foreground uppercase opacity-50">Value distribution (0x00 - 0xFF)</div>
          </div>
        ) : (
          <div className="h-16 w-full bg-zinc-950 rounded-xl border border-white/10 border-dashed flex items-center justify-center text-[10px] text-muted-foreground">
            No frequency data available
          </div>
        )}

        {entropyResult?.categories && (
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase">Nulls</div>
              <div className="text-sm font-bold text-white">{((entropyResult.categories.nulls / displayFileSize) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase">Control</div>
              <div className="text-sm font-bold text-white">{((entropyResult.categories.control / displayFileSize) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase">Printable</div>
              <div className="text-sm font-bold text-white">{((entropyResult.categories.printable / displayFileSize) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <div className="text-[8px] font-mono text-muted-foreground uppercase">Extended</div>
              <div className="text-sm font-bold text-white">{((entropyResult.categories.extended / displayFileSize) * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
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

        {/* Extracted Strings Table */}
        {entropyResult?.strings && entropyResult.strings.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Strings Reconnaissance
              </span>
              <Badge variant="outline" className="text-[8px] opacity-70">
                {entropyResult.strings.length} IDENTIFIED
              </Badge>
            </div>
            
            <div className="bg-zinc-950/50 rounded-xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-[80px_1fr] text-[9px] font-mono p-2 border-b border-white/10 bg-white/5 text-muted-foreground uppercase tracking-widest">
                <div>Offset</div>
                <div>ASCII Sequence</div>
              </div>
              <div className="max-h-48 overflow-y-auto font-mono text-[10px]">
                {entropyResult.strings.map((str, i) => (
                  <div 
                    key={i} 
                    className="grid grid-cols-[80px_1fr] p-2 hover:bg-primary/10 cursor-pointer transition-colors border-b border-white/[0.02] last:border-0 group"
                    onClick={() => scrollToOffset(str.offset)}
                  >
                    <div className="text-muted-foreground opacity-50 group-hover:opacity-100">0x{str.offset.toString(16).toUpperCase()}</div>
                    <div className="text-forensic-cyan truncate font-medium">{str.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hex Dump Section */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5" />
            Hex Dump (Read-Only) {fileBuffer && `— ${totalHexRows.toLocaleString()} rows`}
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
          onScroll={handleHexScroll}
          className="relative h-48 overflow-auto bg-zinc-950 rounded-xl border border-white/10 p-3 font-mono"
          style={{ fontSize: `${10 * zoomLevel}px` }}
        >
          <div className="text-[9px] text-muted-foreground mb-2 border-b border-white/10 pb-1 sticky top-0 bg-zinc-950 z-10">
            OFFSET    00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F  |ASCII-----------|
          </div>

          {hexRows.length > 0 ? (
            hexRows.map((row, i) => {
              const rowAnomaly = getRowAnomaly(row.offsetNum);
              const isHighlighted = isOffsetHighlighted(row.offsetNum);
              const severityConfig = rowAnomaly ? getSeverityConfig(rowAnomaly.severity) : null;
              
              const blockIdx = Math.floor(row.offsetNum / (entropyResult?.blockSize || 1024));
              const rowEntropy = entropyData[blockIdx] || 0;
              
              return (
                <div 
                  key={`${row.offset}-${i}`}
                  className={`leading-relaxed transition-colors border-l-2 ${
                    isHighlighted && highlightAnomalies
                      ? `${severityConfig?.bg}/20 ${severityConfig?.color} ${severityConfig?.border}`
                      : 'text-forensic-cyan/80 hover:bg-white/5 border-transparent'
                  }`}
                  style={{
                    backgroundColor: !rowAnomaly && rowEntropy > 0.8 ? `rgba(255, 59, 48, ${Math.min(0.15, (rowEntropy - 0.8) * 0.5)})` : undefined
                  }}
                  onMouseEnter={() => setHoveredOffset(row.offsetNum)}
                  onMouseLeave={() => setHoveredOffset(null)}
                >
                  {row.offset}  {row.hex}  |{row.ascii}|
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No binary data available
            </div>
          )}
        </div>

        {hoveredOffset !== null && (
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>Offset: 0x{hoveredOffset.toString(16).toUpperCase().padStart(8, '0')}</span>
            <span>Decimal: {hoveredOffset}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 bg-orange-500/5">
        <div className="flex items-center justify-center gap-2 text-[10px] text-orange-500/80 font-mono">
          <Shield className="w-3.5 h-3.5" />
          EXPERT MODE: Binary anomalies do not automatically indicate malicious or fake content. For forensic analysis only.
        </div>
      </div>
    </Card>
  );
}
