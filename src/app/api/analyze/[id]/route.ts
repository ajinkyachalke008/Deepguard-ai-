import { NextRequest, NextResponse } from 'next/server';
import { getAnalysis, updateAnalysis } from '@/lib/forensic-analysis';

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
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }
    
    // body should be a Partial<AnalysisResult> with fields to update
    const updated = await updateAnalysis(id, body);
    
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
    return NextResponse.json(
      { error: 'Failed to update analysis' },
      { status: 500 }
    );
  }
}
