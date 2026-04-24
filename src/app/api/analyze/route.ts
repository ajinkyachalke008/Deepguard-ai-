import { NextRequest, NextResponse } from 'next/server';
import { createAnalysis, listAnalyses } from '@/lib/forensic-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
      
      const maxSize = 200 * 1024 * 1024;
      if (fileSize > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 200MB' },
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
        c2paResult,
        ganScore,
        spectralScore
      });
    
    return NextResponse.json({
      success: true,
      analysis: result
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
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
