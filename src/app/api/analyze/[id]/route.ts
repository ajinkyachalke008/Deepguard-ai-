import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis, updateAnalysis } from '@/lib/forensic-analysis';
import { z } from 'zod';
import { requireAnalystKey, rateLimit } from '@/lib/api-security';

const PatchSchema = z.object({
  audienceExplanations: z.record(z.string(), z.string()).optional(),
  aiInterpretation: z.object({
    model: z.string(),
    generatedAt: z.string(),
    verdict: z.object({
      label: z.string(),
      score: z.number().min(0).max(100),
      confidence: z.number().min(0).max(100),
      explanation: z.string().optional(),
    }),
    signals: z.object({
      ganArtifacts: z.number().min(0).max(100),
      spectralAnomaly: z.number().min(0).max(100),
      anatomicalInconsistency: z.number().min(0).max(100),
      lightingConsistency: z.number().min(0).max(100),
    }),
    findings: z.array(z.object({
      location: z.string(),
      issue: z.string(),
      confidence: z.number().min(0).max(100),
    })).optional(),
    audienceExplanations: z.record(z.string(), z.string()).optional(),
    heatmapRegions: z.array(z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      intensity: z.number(),
      label: z.string(),
      explanation: z.string(),
    })).optional(),
    narrativeTimeline: z.array(z.object({
      id: z.string(),
      milestone: z.string(),
      description: z.string(),
      timestamp: z.string(),
      iconType: z.enum(['shield', 'search', 'alert', 'check']),
    })).optional(),
    confidenceEvolution: z.array(z.object({
      stage: z.string(),
      delta: z.number(),
      cumulative: z.number(),
      explanation: z.string(),
    })).optional(),
    confidenceGaps: z.array(z.object({
      id: z.string(),
      condition: z.string(),
      impact: z.string(),
      recommendation: z.string(),
      status: z.enum(['missing', 'degraded', 'present']),
    })).optional()
  }).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  completedAt: z.string().optional()
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }
    
    const analysis = await getAnalysis(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analysis
    });
    
  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authFail = requireAnalystKey(request);
    if (authFail) return authFail;
    const limited = rateLimit(request, 'api:analyze:patch', 30, 60_000);
    if (limited) return limited;
    const { id } = await params;
    const body = PatchSchema.parse(await request.json());
    
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }
    
    // body should be a Partial<AnalysisResult> with fields to update
    const updated = await updateAnalysis(id, body as any);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analysis: updated
    });
    
  } catch (error) {
    console.error('Update analysis error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update analysis' },
      { status: 500 }
    );
  }
}
