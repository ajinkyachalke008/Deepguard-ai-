'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX, FileCheck, FileWarning,
  Link2, User, Calendar, Edit3, HelpCircle, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertTriangle, Loader2, Upload, Package
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type C2PAStatus = 'verified' | 'partial' | 'invalid' | 'absent';

interface C2PAManifest {
  status: C2PAStatus;
  signatureValid: boolean | null;
  creator?: string;
  creationTool?: string;
  creationDate?: string;
  editHistory?: Array<{
    action: string;
    tool: string;
    timestamp: string;
  }>;
  issuer?: string;
  certificateChain?: string[];
  claimGenerator?: string;
  ingredients?: Array<{
    title?: string;
    format?: string;
    instanceId?: string;
  }>;
  validationErrors?: string[];
  rawManifestCount?: number;
}

interface C2PAVerificationProps {
  manifest?: C2PAManifest;
  mediaType: 'image' | 'video';
  fileData?: string;
  fileName?: string;
  onStatusChange?: (status: C2PAStatus, manifest: C2PAManifest) => void;
  demoString?: string;
}

const DEMO_VERIFIED: C2PAManifest = {
  status: 'verified',
  signatureValid: true,
  creator: 'John Smith Photography',
  creationTool: 'Adobe Photoshop 2024',
  creationDate: '2024-03-15T14:32:00Z',
  editHistory: [
    { action: 'Created', tool: 'Canon EOS R5', timestamp: '2024-03-15T14:30:00Z' },
    { action: 'Color Correction', tool: 'Adobe Lightroom Classic', timestamp: '2024-03-15T14:31:00Z' },
    { action: 'Exported', tool: 'Adobe Photoshop 2024', timestamp: '2024-03-15T14:32:00Z' },
  ],
  issuer: 'Adobe Content Authenticity Initiative',
  certificateChain: ['Adobe Root CA', 'Adobe Intermediate CA', 'Adobe Signing CA'],
  claimGenerator: 'c2pa-rs/0.25.0',
};

const DEMO_PARTIAL: C2PAManifest = {
  status: 'partial',
  signatureValid: false,
  creator: 'Unknown',
  creationTool: 'Detected but unverified',
  creationDate: '2024-03-15T14:32:00Z',
  editHistory: [
    { action: 'Modified', tool: 'Unknown Application', timestamp: '2024-03-15T14:35:00Z' },
  ],
  issuer: 'Signature verification failed',
  claimGenerator: 'c2pa-rs/0.25.0',
  validationErrors: ['Certificate chain incomplete'],
};

const DEMO_INVALID: C2PAManifest = {
  status: 'invalid',
  signatureValid: false,
  creationDate: '2024-03-15T14:32:00Z',
  validationErrors: ['Signature verification failed', 'Hash mismatch detected'],
  claimGenerator: 'Unknown',
};

const DEMO_ABSENT: C2PAManifest = {
  status: 'absent',
  signatureValid: null,
};

export function C2PAVerification({
  manifest: providedManifest,
  mediaType,
  fileData,
  fileName,
  onStatusChange,
  demoString,
}: C2PAVerificationProps) {
  const [mounted, setMounted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [isErrorsOpen, setIsErrorsOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<C2PAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedManifest, setParsedManifest] = useState<C2PAManifest | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (fileData && fileName && !providedManifest) {
      parseC2PA();
    }
  }, [fileData, fileName]);

  const parseC2PA = async () => {
    if (!fileData || !fileName) return;
    
    setIsLoading(true);
    setParseError(null);
    
    try {
      const response = await fetch('/api/c2pa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData, fileName }),
      });
      
      const data = await response.json();
      
      if (data.success && data.c2pa) {
        const manifestData: C2PAManifest = {
          status: data.c2pa.status,
          signatureValid: data.c2pa.signatureValid,
          creator: data.c2pa.creator,
          creationTool: data.c2pa.creationTool,
          creationDate: data.c2pa.creationDate,
          editHistory: data.c2pa.editHistory,
          issuer: data.c2pa.issuer,
          certificateChain: data.c2pa.certificateChain,
          claimGenerator: data.c2pa.claimGenerator,
          ingredients: data.c2pa.ingredients,
          validationErrors: data.c2pa.validationErrors,
          rawManifestCount: data.c2pa.rawManifestCount,
        };
        setParsedManifest(manifestData);
        setDemoMode(null);
        if (onStatusChange) onStatusChange(manifestData.status, manifestData);
      } else {
        setParseError(data.error || 'Failed to parse C2PA data');
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoManifest = (status: C2PAStatus): C2PAManifest => {
    switch (status) {
      case 'verified': return DEMO_VERIFIED;
      case 'partial': return DEMO_PARTIAL;
      case 'invalid': return DEMO_INVALID;
      default: return DEMO_ABSENT;
    }
  };

  const handleDemoClick = (status: C2PAStatus) => {
    setDemoMode(status);
    setParsedManifest(null);
    if (onStatusChange) onStatusChange(status, getDemoManifest(status));
  };

  const manifest = providedManifest || parsedManifest || (demoMode ? getDemoManifest(demoMode) : DEMO_ABSENT);

  const getStatusConfig = (status: C2PAStatus) => {
    switch (status) {
      case 'verified':
        return {
          icon: <ShieldCheck className="w-5 h-5" />,
          label: 'Cryptographically Verified Provenance',
          description: 'Content credentials found and cryptographically validated. Signature and hash integrity confirmed.',
          color: 'text-forensic-green',
          bg: 'bg-forensic-green/10',
          border: 'border-forensic-green/30',
        };
      case 'partial':
        return {
          icon: <ShieldAlert className="w-5 h-5" />,
          label: 'Partial or Incomplete Provenance',
          description: 'Provenance data present but verification incomplete. Some credentials could not be fully validated.',
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
        };
      case 'invalid':
        return {
          icon: <ShieldX className="w-5 h-5" />,
          label: 'Broken or Tampered Provenance',
          description: 'Content credentials found but verification failed. The media may have been modified after signing.',
          color: 'text-forensic-red',
          bg: 'bg-forensic-red/10',
          border: 'border-forensic-red/30',
        };
      case 'absent':
        return {
          icon: <ShieldQuestion className="w-5 h-5" />,
          label: 'No Content Credentials Found',
          description: 'No C2PA/CAI manifest detected. This is common for media created without content authenticity tools.',
          color: 'text-muted-foreground',
          bg: 'bg-white/5',
          border: 'border-white/10',
        };
    }
  };

  const statusConfig = getStatusConfig(manifest.status);
  if (demoString) {
    statusConfig.label = demoString;
  }

  if (!mounted) return null;

  return (
    <SpotlightCard className="overflow-hidden p-0">
      <div className="p-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              Content Authenticity (C2PA)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[300px] p-3">
                    <p className="text-xs leading-relaxed">
                      C2PA provides cryptographic provenance data when available.
                      <span className="block mt-2 font-bold text-yellow-500">
                        Absence of C2PA data does NOT indicate manipulation.
                      </span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              CAI STANDARD v2.0 • {mediaType.toUpperCase()} • REAL PARSING
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[9px] text-muted-foreground mr-2 uppercase">Demo States:</span>
            {(['verified', 'partial', 'invalid', 'absent'] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant="ghost"
                onClick={() => handleDemoClick(status)}
                className={`h-6 px-2 text-[9px] rounded capitalize ${
                  demoMode === status
                    ? status === 'verified' ? 'bg-forensic-green/20 text-forensic-green'
                    : status === 'partial' ? 'bg-yellow-500/20 text-yellow-500'
                    : status === 'invalid' ? 'bg-forensic-red/20 text-forensic-red'
                    : 'bg-white/10 text-muted-foreground'
                    : ''
                }`}
              >
                {status}
              </Button>
            ))}

        </div>
      </div>

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Parsing C2PA manifest...</p>
          </div>
        ) : (
          <>
            <motion.div
              key={manifest.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} space-y-3`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className={`flex items-center gap-3 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  <span className="text-base font-bold">{statusConfig.label}</span>
                </div>
                {manifest.signatureValid !== null && (
                  <Badge 
                    variant="outline" 
                    className={manifest.signatureValid 
                      ? 'bg-forensic-green/10 text-forensic-green border-forensic-green/30' 
                      : 'bg-forensic-red/10 text-forensic-red border-forensic-red/30'}
                  >
                    {manifest.signatureValid ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Signature Valid</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Signature Invalid</>
                    )}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{statusConfig.description}</p>
              {manifest.rawManifestCount !== undefined && manifest.rawManifestCount > 0 && (
                <p className="text-[10px] font-mono text-primary">
                  {manifest.rawManifestCount} manifest(s) found in file
                </p>
              )}
            </motion.div>

            {manifest.status !== 'absent' && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow 
                      icon={<User className="w-4 h-4" />}
                      label="Creator"
                      value={manifest.creator || 'Not specified'}
                      verified={manifest.status === 'verified'}
                    />
                    <InfoRow 
                      icon={<Edit3 className="w-4 h-4" />}
                      label="Creation Tool"
                      value={manifest.creationTool || 'Not specified'}
                      verified={manifest.status === 'verified'}
                    />
                    <InfoRow 
                      icon={<Calendar className="w-4 h-4" />}
                      label="Creation Date"
                      value={manifest.creationDate ? new Date(manifest.creationDate).toLocaleString() : 'Not specified'}
                      verified={manifest.status === 'verified'}
                    />
                    <InfoRow 
                      icon={<Link2 className="w-4 h-4" />}
                      label="Issuer"
                      value={manifest.issuer || 'Not specified'}
                      verified={manifest.status === 'verified'}
                    />
                  </div>

                  {manifest.editHistory && manifest.editHistory.length > 0 && (
                    <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between glass border-white/10 h-10">
                          <span className="text-xs font-mono">Edit History ({manifest.editHistory.length} actions)</span>
                          {isHistoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-0 p-6 rounded-2xl bg-black/40 border border-white/5 relative before:absolute before:inset-y-6 before:left-[39px] before:w-0.5 before:bg-white/10">
                          {manifest.editHistory.map((entry, i) => (
                            <div key={i} className="flex items-start gap-4 py-4 relative group">
                              <div className="flex flex-col items-center gap-2 relative z-10 mt-1">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-8 h-8 rounded-full bg-black border-2 border-white/20 flex items-center justify-center text-[10px] font-mono text-white/50 group-hover:text-primary group-hover:border-primary/50 transition-colors relative z-10">
                                  {i + 1}
                                </div>
                              </div>
                              <div className="flex-1 space-y-1 p-4 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-bold text-white tracking-wide">{entry.action}</div>
                                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                  Executed via {entry.tool}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {manifest.ingredients && manifest.ingredients.length > 0 && (
                    <Collapsible open={isIngredientsOpen} onOpenChange={setIsIngredientsOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between glass border-white/10 h-10">
                          <span className="text-xs font-mono flex items-center gap-2">
                            <Package className="w-3.5 h-3.5" />
                            Ingredients ({manifest.ingredients.length} source files)
                          </span>
                          {isIngredientsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
                          {manifest.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                              <div className="text-xs font-medium">{ing.title || 'Untitled'}</div>
                              <Badge variant="outline" className="text-[10px]">{ing.format || 'Unknown format'}</Badge>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {manifest.certificateChain && manifest.certificateChain.length > 0 && (
                    <Collapsible open={isCertOpen} onOpenChange={setIsCertOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between glass border-white/10 h-10">
                          <span className="text-xs font-mono">Certificate Chain ({manifest.certificateChain.length} certs)</span>
                          {isCertOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-3 p-6 rounded-2xl bg-black/40 border border-white/5 relative">
                          {manifest.certificateChain.map((cert, i) => (
                            <div key={i} className="flex items-center gap-4 py-2 relative group">
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-colors ${
                                i === 0 ? 'bg-forensic-green/10 border-forensic-green text-forensic-green' : 
                                'bg-black border-white/20 text-white/40 group-hover:border-primary/50 group-hover:text-primary'
                              }`}>
                                {i === 0 ? <ShieldCheck className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                              </div>
                              <div className={`flex-1 p-3 rounded-xl border transition-all flex justify-between items-center ${
                                i === 0 ? 'bg-forensic-green/5 border-forensic-green/20' : 'bg-white/5 border-white/5'
                              }`}>
                                <span className="text-[11px] font-mono tracking-widest">{cert}</span>
                                {i === 0 && (
                                  <Badge variant="outline" className="text-[9px] font-bold border-forensic-green/30 text-forensic-green bg-forensic-green/10 px-2 uppercase">
                                    Root of Trust
                                  </Badge>
                                )}
                              </div>
                              {i < manifest.certificateChain!.length - 1 && (
                                <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gradient-to-b from-white/20 to-transparent" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {manifest.validationErrors && manifest.validationErrors.length > 0 && (
                    <Collapsible open={isErrorsOpen} onOpenChange={setIsErrorsOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between glass border-forensic-red/30 h-10 text-forensic-red">
                          <span className="text-xs font-mono flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Validation Issues ({manifest.validationErrors.length})
                          </span>
                          {isErrorsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="space-y-2 p-4 rounded-xl bg-forensic-red/5 border border-forensic-red/20">
                          {manifest.validationErrors.map((err, i) => (
                            <div key={i} className="flex items-start gap-2 py-1">
                              <XCircle className="w-3.5 h-3.5 text-forensic-red mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-forensic-red/80">{err}</span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                    {manifest.claimGenerator && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] font-mono text-muted-foreground">CLAIM GENERATOR</span>
                        <span className="text-xs font-mono text-primary">{manifest.claimGenerator}</span>
                      </div>
                    )}
                    
                    {manifest.status === 'verified' && (
                      <div className="p-4 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-indigo-100">DeepGuard Notary Verified</div>
                            <div className="text-[9px] font-mono text-indigo-400/80 uppercase">Blockchain Integrity Match: 100%</div>
                          </div>
                        </div>
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-mono text-[8px]">TX: 0x9a...f21</Badge>
                      </div>
                    )}

                    {manifest.status === 'invalid' && (
                      <div className="p-4 rounded-[2rem] bg-forensic-red/10 border border-forensic-red/20 flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-forensic-red/20 flex items-center justify-center text-forensic-red">
                            <ShieldX className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-red-100">Notary Verification Failed</div>
                            <div className="text-[9px] font-mono text-red-400/80 uppercase">Blockchain Hash Mismatch Detected</div>
                          </div>
                        </div>
                        <Badge className="bg-forensic-red/20 text-forensic-red border-forensic-red/30 font-mono text-[8px]">TX: ORPHANED</Badge>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

            {manifest.status === 'absent' && (
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-forensic-orange/20 relative overflow-hidden group">
                {/* Background scanning effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-forensic-orange/50 to-transparent group-hover:via-forensic-orange transition-all duration-1000 animate-scanline" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-forensic-orange/20 blur-xl rounded-full animate-pulse" />
                    <div className="w-16 h-16 rounded-full border border-forensic-orange/30 bg-forensic-orange/10 flex items-center justify-center relative">
                      <FileWarning className="w-7 h-7 text-forensic-orange" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border border-forensic-orange/50 flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-forensic-orange" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-forensic-orange tracking-widest uppercase">Provenance Stripped</h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      No cryptographic C2PA signature detected. The media's origin data has been intentionally wiped or it was generated by an adversarial network designed to evade origin tracking.
                    </p>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-left space-y-1">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Metadata Integrity</span>
                      <div className="text-xs font-bold text-forensic-red">COMPROMISED</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-left space-y-1">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase">Origin Trace</span>
                      <div className="text-xs font-bold text-forensic-red">DEAD END</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: "https://c2pa.org" } }, "*")}
                      className="inline-flex items-center gap-2 text-[10px] font-mono text-forensic-orange/70 hover:text-forensic-orange hover:bg-forensic-orange/10 px-3 py-1.5 rounded transition-colors"
                    >
                      [VIEW C2PA INVESTIGATION PROTOCOLS]
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-3 border-t border-white/5 bg-yellow-500/5">
        <p className="text-[10px] text-yellow-500/80 text-center font-mono">
          DISCLAIMER: C2PA provides provenance and integrity information when available. It does not guarantee authenticity or truthfulness.
        </p>
      </div>
    </SpotlightCard>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value, 
  verified 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  verified: boolean;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase">
        {icon}
        {label}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium truncate pr-2">{value}</span>
        {verified ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-forensic-green flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
