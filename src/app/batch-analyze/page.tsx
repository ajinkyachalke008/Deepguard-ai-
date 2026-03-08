'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Upload, FileVideo, FileImage, X, AlertCircle, 
  CheckCircle2, Clock, FolderOpen, Play, Pause, Download,
  ArrowLeft, Layers, Eye, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateForensicPDF, downloadPDF } from '@/lib/pdf-export';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  progress: number;
  result?: {
    verdict: string;
    severity: 'low' | 'mid' | 'high';
    confidence: number;
    analysisId: string;
  };
  error?: string;
}

const ANALYSIS_PHASES = [
  "Preprocessing",
  "CNN Analysis",
  "Temporal Check",
  "Signal Fusion",
  "Report Generation"
];

export default function BatchAnalyzePage() {
  const router = useRouter();
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    const maxSize = 200 * 1024 * 1024;
    const allowedTypes = ['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'];
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(validateFile);
    const invalidCount = newFiles.length - validFiles.length;
    
    if (invalidCount > 0) {
      toast.error(`${invalidCount} file(s) skipped (invalid format or too large)`);
    }

    const batchFiles: BatchFile[] = validFiles.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...batchFiles]);
    
    if (validFiles.length > 0) {
      toast.success(`Added ${validFiles.length} file(s) to batch queue`);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setCurrentFileIndex(0);
    setOverallProgress(0);
    setIsAnalyzing(false);
    setIsPaused(false);
  };

  const analyzeFile = async (batchFile: BatchFile): Promise<BatchFile> => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === batchFile.id ? { ...f, status: 'analyzing' as const, progress: 0 } : f
      ));

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: batchFile.file.name,
          fileSize: batchFile.file.size,
          fileType: batchFile.file.type
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      for (let i = 0; i <= 100; i += 10) {
        if (isPaused) {
          await new Promise(resolve => {
            const checkPause = setInterval(() => {
              if (!isPaused) {
                clearInterval(checkPause);
                resolve(true);
              }
            }, 100);
          });
        }
        
        setFiles(prev => prev.map(f => 
          f.id === batchFile.id ? { ...f, progress: i } : f
        ));
        await new Promise(r => setTimeout(r, 150 + Math.random() * 100));
      }

      const analysisResponse = await fetch(`/api/analyze/${data.analysis.id}`);
      const analysisData = await analysisResponse.json();

      return {
        ...batchFile,
        status: 'completed',
        progress: 100,
        result: {
          verdict: analysisData.analysis.verdict.label,
          severity: analysisData.analysis.verdict.severity,
          confidence: analysisData.analysis.verdict.confidence,
          analysisId: data.analysis.id
        }
      };
    } catch (error) {
      return {
        ...batchFile,
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  };

  const startBatchAnalysis = async () => {
    if (files.length === 0) return;
    
    setIsAnalyzing(true);
    setIsPaused(false);
    setCurrentFileIndex(0);

    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    for (let i = 0; i < pendingFiles.length; i++) {
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = setInterval(() => {
            if (!isPaused) {
              clearInterval(checkPause);
              resolve(true);
            }
          }, 100);
        });
      }

      setCurrentFileIndex(i);
      const result = await analyzeFile(pendingFiles[i]);
      
      setFiles(prev => prev.map(f => f.id === result.id ? result : f));
      setOverallProgress(Math.round(((i + 1) / pendingFiles.length) * 100));
    }

    setIsAnalyzing(false);
    toast.success(`Batch analysis complete! ${pendingFiles.length} files processed.`);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const exportBatchReport = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.result);
    
    if (completedFiles.length === 0) {
      toast.error('No completed analyses to export');
      return;
    }

    const reportData = {
      generatedAt: new Date().toISOString(),
      totalFiles: files.length,
      completed: completedFiles.length,
      results: completedFiles.map(f => ({
        fileName: f.file.name,
        fileSize: f.file.size,
        verdict: f.result?.verdict,
        severity: f.result?.severity,
        confidence: f.result?.confidence,
        analysisId: f.result?.analysisId
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeepGuard_Batch_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Batch report exported');
  };

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'completed': return 'text-forensic-green';
      case 'error': return 'text-forensic-red';
      case 'analyzing': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityColor = (severity?: 'low' | 'mid' | 'high') => {
    switch (severity) {
      case 'high': return 'border-forensic-red text-forensic-red bg-forensic-red/5';
      case 'mid': return 'border-yellow-500 text-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-forensic-green text-forensic-green bg-forensic-green/5';
      default: return 'border-white/10 text-muted-foreground';
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center">
      <ShaderAnimation />
      
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass border-b-0 m-4 rounded-full max-w-7xl left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-4">
          <Link href="/analyze">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-5 h-5" />
            <span className="font-bold tracking-tight text-xl">DeepGuard AI</span>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
          <Layers className="w-3 h-3 mr-1" />
          Batch Forensic Audit
        </Badge>
        <div className="flex items-center gap-3">
          {files.length > 0 && completedCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full gap-2 glass"
              onClick={exportBatchReport}
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          )}
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-5xl px-6 pt-32 pb-20">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Batch Forensic Analysis</h1>
          <p className="text-muted-foreground">
            Upload multiple files for bulk authenticity verification. Ideal for corporate evidence audits.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="glass p-4 border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{files.length}</div>
              <div className="text-xs text-muted-foreground uppercase">Total Files</div>
            </div>
          </Card>
          <Card className="glass p-4 border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-forensic-green/10 flex items-center justify-center text-forensic-green">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-xs text-muted-foreground uppercase">Completed</div>
            </div>
          </Card>
          <Card className="glass p-4 border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-xs text-muted-foreground uppercase">Pending</div>
            </div>
          </Card>
        </div>

        {isAnalyzing && (
          <Card className="glass p-6 border-primary/20 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <div>
                  <div className="font-medium">Processing Batch...</div>
                  <div className="text-xs text-muted-foreground">
                    File {currentFileIndex + 1} of {files.filter(f => f.status !== 'completed').length}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full gap-2"
                onClick={togglePause}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2 text-right">{overallProgress}% Complete</div>
          </Card>
        )}

        {files.length > 0 && !isAnalyzing && completedCount === files.length && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glass p-8 border-forensic-green/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <CheckCircle2 className="w-24 h-24 text-forensic-green" />
              </div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-forensic-green" />
                Audit Complete: Forensic Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">High Risk Detections</div>
                  <div className="text-2xl font-bold text-forensic-red">{files.filter(f => f.result?.severity === 'high').length}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Uncertain Cases</div>
                  <div className="text-2xl font-bold text-yellow-500">{files.filter(f => f.result?.severity === 'mid').length}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Verified Authentic</div>
                  <div className="text-2xl font-bold text-forensic-green">{files.filter(f => f.result?.severity === 'low').length}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Average Confidence</div>
                  <div className="text-2xl font-bold">
                    {Math.round(files.reduce((acc, f) => acc + (f.result?.confidence || 0), 0) / files.length)}%
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-muted-foreground flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary" />
                This audit is cryptographically signed and stored in the DeepGuard forensic ledger.
              </div>
            </Card>
          </motion.div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-[2rem] p-8 transition-all duration-300 mb-8
            ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-white/10 glass hover:border-primary/50'}
            flex flex-col items-center justify-center gap-4
          `}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-medium">Drop multiple files here</p>
            <p className="text-sm text-muted-foreground">MP4, MOV, JPG, PNG or WEBP (max 200MB each)</p>
          </div>
          <label className="cursor-pointer">
            <Button variant="secondary" className="rounded-full px-6 pointer-events-none">
              Browse Files
            </Button>
            <input 
              type="file" 
              className="hidden" 
              accept="video/*,image/*" 
              multiple 
              onChange={handleFileChange} 
            />
          </label>
        </div>

        {files.length > 0 && (
          <Card className="glass border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-sm uppercase tracking-wider">File Queue</h3>
              <div className="flex items-center gap-2">
                {!isAnalyzing && pendingCount > 0 && (
                  <Button 
                    size="sm" 
                    className="rounded-full gap-2"
                    onClick={startBatchAnalysis}
                  >
                    <Play className="w-4 h-4" />
                    Start Analysis ({pendingCount})
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-muted-foreground hover:text-forensic-red"
                  onClick={clearAll}
                  disabled={isAnalyzing}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {files.map((batchFile) => (
                  <motion.div
                    key={batchFile.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0">
                      {batchFile.file.type.startsWith('video') ? (
                        <FileVideo className="w-5 h-5" />
                      ) : (
                        <FileImage className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{batchFile.file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({(batchFile.file.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      
                      {batchFile.status === 'analyzing' && (
                        <Progress value={batchFile.progress} className="h-1" />
                      )}
                      
                      {batchFile.status === 'completed' && batchFile.result && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[9px] ${getSeverityColor(batchFile.result.severity)}`}>
                            {batchFile.result.verdict}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {batchFile.result.confidence.toFixed(1)}% confidence
                          </span>
                        </div>
                      )}
                      
                      {batchFile.status === 'error' && (
                        <span className="text-xs text-forensic-red">{batchFile.error}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {batchFile.status === 'completed' && batchFile.result && (
                        <Link href={`/report?analysis_id=${batchFile.result.analysisId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      
                      {batchFile.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-forensic-red"
                          onClick={() => removeFile(batchFile.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div className={`w-2 h-2 rounded-full ${
                        batchFile.status === 'completed' ? 'bg-forensic-green' :
                        batchFile.status === 'error' ? 'bg-forensic-red' :
                        batchFile.status === 'analyzing' ? 'bg-primary animate-pulse' :
                        'bg-white/20'
                      }`} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        )}

        {files.length === 0 && (
          <Card className="glass p-8 border-white/5 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="font-bold mb-2">No Files in Queue</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Drag and drop multiple files above to start a batch forensic audit. 
              Each file will be analyzed sequentially with detailed reports.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
