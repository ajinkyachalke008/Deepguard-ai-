import { NextRequest, NextResponse } from 'next/server';
import { createAnalysis, listAnalyses } from '@/lib/forensic-analysis';
import { z } from 'zod';
import { rateLimit } from '@/lib/api-security';
import { CreateAnalysisSchema } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, 'api:analyze:post', 20, 60_000);
    if (limited) return limited;
    const body = CreateAnalysisSchema.parse(await request.json());
    
      const { 
        fileName, 
        fileSize, 
        fileType, 
        fileUrl, 
        entropySample, 
        thumbnailUrl, 
        c2paResult,
        ganScore,
        spectralScore 
      } = body;
      
      if (!fileName || !fileSize || !fileType) {
        return NextResponse.json(
          { error: 'Missing required fields: fileName, fileSize, fileType' },
          { status: 400 }
        );
      }
      
        const allowedTypes = [
          'video/mp4', 
          'video/quicktime', 
          'video/x-matroska', 
          'video/webm',
          'image/jpeg', 
          'image/png', 
          'image/webp',
          'image/heic',
          'image/heif'
        ];
      if (!allowedTypes.includes(fileType)) {
        return NextResponse.json(
          { error: 'Unsupported file format. Allowed: MP4, MOV, JPG, PNG, WEBP' },
          { status: 400 }
        );
      }
      
      const result = await createAnalysis({
        fileName,
        fileSize,
        fileType,
        fileUrl,
        entropySample,
        thumbnailUrl,
        c2paResult: c2paResult as any,
        ganScore,
        spectralScore
      });
    
    return NextResponse.json({
      success: true,
      analysis: result
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to process analysis request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const analyses = await listAnalyses();
    return NextResponse.json({
      success: true,
      analyses,
      count: analyses.length
    });
  } catch (error) {
    console.error('List analyses error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analyses' },
      { status: 500 }
    );
  }
}
