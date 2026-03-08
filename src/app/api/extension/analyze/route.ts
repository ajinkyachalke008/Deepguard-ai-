import { NextRequest, NextResponse } from 'next/server';
import { createAnalysis } from '@/lib/forensic-analysis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaUrl = searchParams.get('url');

  if (!mediaUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

    try {
      // Simulate fetching media from URL and analyzing it
      const fileName = mediaUrl.split('/').pop() || 'external_media';
      const analysis = await createAnalysis({
        fileName,
        fileSize: 10 * 1024 * 1024, // Simulated size
        fileType: fileName.endsWith('.mp4') || fileName.endsWith('.mov') ? 'video/mp4' : 'image/jpeg',
      });


    // Redirect to the report page
    return NextResponse.redirect(new URL(`/report?analysis_id=${analysis.id}`, req.url));
  } catch (error) {
    console.error('Extension analysis failed:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
