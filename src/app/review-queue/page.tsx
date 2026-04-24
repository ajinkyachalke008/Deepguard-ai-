'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Shield, ArrowLeft, Search, Eye, ThumbsUp, ThumbsDown, 
  AlertCircle, Clock, CheckCircle2, RefreshCw, Database
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { listAnalyses } from '@/lib/forensic-analysis';

interface ReviewItem {
  id: string;
  analysis_id: string;
  fileName: string;
  score: number;
  timestamp: string;
  consensus: string;
  conflictType: string;
  priority: 'High' | 'Medium' | 'Low';
  mediaType: string;
}

interface ReviewStats {
  pending: number;
  completed: number;
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReviewStats>({ pending: 0, completed: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchReviewQueue = async () => {
    try {
      const { data: queueItems, error: queueError } = await supabase
        .from('review_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (queueError) throw queueError;

      const { data: completedCount } = await supabase
        .from('review_queue')
        .select('id', { count: 'exact' })
        .eq('status', 'reviewed');

      const { data: analyses, error: analysesError } = await supabase
        .from('analyses')
        .select('*')
        .gte('verdict_score', 40)
        .lte('verdict_score', 60)
        .order('created_at', { ascending: false })
        .limit(20);

      if (analysesError) throw analysesError;

      let reviewItems: ReviewItem[] = [];

      if (queueItems && queueItems.length > 0) {
        const analysisIds = queueItems.map(q => q.analysis_id);
        const { data: linkedAnalyses } = await supabase
          .from('analyses')
          .select('*')
          .in('id', analysisIds);

        reviewItems = queueItems.map(q => {
          const analysis = linkedAnalyses?.find(a => a.id === q.analysis_id);
          return {
            id: q.id,
            analysis_id: q.analysis_id,
            fileName: analysis?.file_name || 'Unknown File',
            score: analysis?.verdict_score || 50,
            timestamp: q.created_at,
            consensus: '1/3 Agree',
            conflictType: getConflictType(analysis?.data?.signals),
            priority: getPriority(analysis?.verdict_score || 50),
            mediaType: analysis?.media_type || 'image'
          };
        });
      }

      if (analyses && analyses.length > 0) {
        const existingIds = new Set(reviewItems.map(r => r.analysis_id));
        
        const uncertainAnalyses = analyses
          .filter(a => !existingIds.has(a.id))
          .map(a => ({
            id: `review_${a.id}`,
            analysis_id: a.id,
            fileName: a.file_name,
            score: a.verdict_score,
            timestamp: a.created_at,
            consensus: getConsensus(a.data?.signals),
            conflictType: getConflictType(a.data?.signals),
            priority: getPriority(a.verdict_score),
            mediaType: a.media_type
          }));

        reviewItems = [...reviewItems, ...uncertainAnalyses];
      }

      setItems(reviewItems.slice(0, 10));
      setStats({
        pending: reviewItems.length,
        completed: completedCount?.length || 0
      });
      setRefreshing(false);
    } catch (err) {
      console.warn('Review queue DB fetch failed, switching to local buffer:', err);
      setIsOfflineMode(true);
      
      // FALLBACK: Load from local persistent cache
      try {
        const localAnalyses = await listAnalyses();
        const uncertainAnalyses = localAnalyses
          .filter(a => a.verdict.severity === 'mid')
          .map(a => ({
            id: `local_${a.id}`,
            analysis_id: a.id,
            fileName: a.fileName,
            score: a.verdict.score,
            timestamp: a.createdAt,
            consensus: 'Local Data',
            conflictType: 'Uncertain Signal',
            priority: 'Medium' as const,
            mediaType: a.mediaType
          }));
        
        setItems(uncertainAnalyses);
        setStats({
          pending: uncertainAnalyses.length,
          completed: 0 // Local stats are reset for simplicity
        });
      } catch (localErr) {
        console.error('Failed to load local review items:', localErr);
        toast.error('Failed to load review queue');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getConflictType = (signals: any): string => {
    if (!signals) return 'Multi-Signal';
    const conflicts = [];
    if (signals.ganArtifacts > 40 && signals.ganArtifacts < 70) conflicts.push('Texture');
    if (signals.spectralAnomaly > 40 && signals.spectralAnomaly < 70) conflicts.push('Spectral');
    if (signals.anatomicalInconsistency > 40) conflicts.push('Anatomy');
    if (signals.lightingConsistency < 60) conflicts.push('Lighting');
    return conflicts.length > 0 ? conflicts.slice(0, 2).join('/') : 'Multi-Signal';
  };

  const getConsensus = (signals: any): string => {
    if (!signals) return '0/3 Agree';
    let agree = 0;
    if (signals.ganArtifacts > 50) agree++;
    if (signals.spectralAnomaly > 50) agree++;
    if (signals.anatomicalInconsistency > 50) agree++;
    return `${agree}/3 Agree`;
  };

  const getPriority = (score: number): 'High' | 'Medium' | 'Low' => {
    if (score >= 48 && score <= 52) return 'High';
    if (score >= 45 && score <= 55) return 'Medium';
    return 'Low';
  };

  useEffect(() => {
    fetchReviewQueue();

    const channel = supabase
      .channel('review-queue-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'review_queue' },
        () => {
          fetchReviewQueue();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'analyses' },
        (payload) => {
          const newAnalysis = payload.new as any;
          if (newAnalysis.verdict_score >= 40 && newAnalysis.verdict_score <= 60) {
            fetchReviewQueue();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleReview = async (item: ReviewItem, decision: 'real' | 'ai') => {
    try {
      const { data: existing } = await supabase
        .from('review_queue')
        .select('id')
        .eq('analysis_id', item.analysis_id)
        .single();

      if (existing) {
        await supabase
          .from('review_queue')
          .update({
            status: 'reviewed',
            reviewer_decision: decision,
            reviewed_at: new Date().toISOString()
          })
          .eq('analysis_id', item.analysis_id);
      } else {
        await supabase
          .from('review_queue')
          .insert({
            analysis_id: item.analysis_id,
            status: 'reviewed',
            reviewer_decision: decision,
            reviewed_at: new Date().toISOString()
          });
      }

      setItems(prev => prev.filter(i => i.id !== item.id));
      setStats(prev => ({
        pending: prev.pending - 1,
        completed: prev.completed + 1
      }));
      
      toast.success(
        `Analysis marked as ${decision === 'real' ? 'Likely Real' : 'Likely AI'}. Feedback stored for model calibration.`
      );
    } catch (err) {
      console.error('Error saving review:', err);
      toast.error('Failed to save review decision');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviewQueue();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center">
      <ShaderAnimation />
      
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass border-b-0 m-4 rounded-full max-w-7xl">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-5 h-5" />
            <span className="font-bold tracking-tight text-xl">DeepGuard AI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            {isOfflineMode ? (
              <>
                <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
                LOCAL BUFFER MODE
              </>
            ) : (
              <>
                <Database className="w-3 h-3 text-primary" />
                LIVE DATABASE
              </>
            )}
          </div>
          <Badge variant="outline" className={isOfflineMode ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/5" : "border-primary/30 text-primary bg-primary/5"}>
            {isOfflineMode ? 'Human Review (Local)' : 'Human Review Queue'}
          </Badge>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-5xl px-6 pt-32 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Uncertain Case Review</h1>
            <p className="text-muted-foreground">
              Human-in-the-loop calibration for cases with conflicting forensic signals (40–60% confidence).
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full gap-2 glass"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Card className="glass px-4 py-2 border-white/5 flex items-center gap-3">
              <div className="text-xs font-mono text-muted-foreground uppercase">Pending</div>
              <div className="text-xl font-bold text-yellow-500">{stats.pending}</div>
            </Card>
            <Card className="glass px-4 py-2 border-white/5 flex items-center gap-3">
              <div className="text-xs font-mono text-muted-foreground uppercase">Completed</div>
              <div className="text-xl font-bold text-forensic-green">{stats.completed}</div>
            </Card>
          </div>
        </div>

        <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-xs font-mono text-muted-foreground uppercase">Media Artifact</th>
                    <th className="px-6 py-4 text-xs font-mono text-muted-foreground uppercase">AI Score</th>
                    <th className="px-6 py-4 text-xs font-mono text-muted-foreground uppercase">Consensus</th>
                    <th className="px-6 py-4 text-xs font-mono text-muted-foreground uppercase">Conflict Type</th>
                    <th className="px-6 py-4 text-xs font-mono text-muted-foreground uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                          Connecting to secure database...
                        </div>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <CheckCircle2 className="w-10 h-10 text-forensic-green" />
                          Queue empty. All uncertain cases have been calibrated.
                          <p className="text-xs max-w-md">
                            New uncertain cases (40-60% confidence) will automatically appear here when detected.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform relative">
                              <Search className="w-5 h-5" />
                              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-black ${item.priority === 'High' ? 'bg-forensic-red' : item.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                            </div>
                            <div>
                              <div className="font-bold text-sm truncate max-w-[200px]">{item.fileName}</div>
                              <div className="text-[10px] font-mono text-muted-foreground uppercase">
                                {item.mediaType} • {item.analysis_id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-500" 
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-yellow-500">{item.score.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="text-xs font-bold text-white/80">{item.consensus}</div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-3 h-1 rounded-full ${i <= parseInt(item.consensus) ? 'bg-primary' : 'bg-white/10'}`} />
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[9px] uppercase border-white/10 bg-white/5 font-mono">
                            {item.conflictType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/report?analysis_id=${item.analysis_id}`}>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full h-8 px-3 border-forensic-green/30 text-forensic-green hover:bg-forensic-green/10 text-[10px] font-bold uppercase"
                            onClick={() => handleReview(item, 'real')}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1.5" />
                            Real
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full h-8 px-3 border-forensic-red/30 text-forensic-red hover:bg-forensic-red/10 text-[10px] font-bold uppercase"
                            onClick={() => handleReview(item, 'ai')}
                          >
                            <ThumbsDown className="w-3 h-3 mr-1.5" />
                            AI
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 p-6 glass rounded-[2rem] border-white/5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">Reviewer Instructions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Examine the explainability heatmaps for anatomical inconsistencies and spectral anomalies. 
              If the AI score is high but C2PA provenance is verified, double-check the edit history for standard post-processing (e.g., color grading) which might trigger false flags.
              Your feedback is stored in the database and used to calibrate the forensic engine.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
