import { NextRequest, NextResponse } from 'next/server';
import { parseC2PAFromBuffer, createAbsentResult, C2PAResult } from '@/lib/c2pa-parser';

const MAX_FILE_SIZE = 200 * 1024 * 1024;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
];

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided', c2pa: createAbsentResult() },
          { status: 400 }
        );
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          success: true,
          c2pa: {
            ...createAbsentResult(),
            validationErrors: ['Unsupported file format for C2PA parsing'],
          },
          message: 'File format not supported for C2PA verification',
        });
      }
      
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 200MB' },
          { status: 400 }
        );
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const c2paResult = await parseC2PAFromBuffer(buffer, file.name);
      
      return NextResponse.json({
        success: true,
        c2pa: c2paResult,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { fileData, fileName, fileType } = body;
      
      if (!fileData || !fileName) {
        return NextResponse.json(
          { error: 'Missing fileData or fileName', c2pa: createAbsentResult() },
          { status: 400 }
        );
      }
      
      if (fileType && !ALLOWED_TYPES.includes(fileType)) {
        return NextResponse.json({
          success: true,
          c2pa: {
            ...createAbsentResult(),
            validationErrors: ['Unsupported file format for C2PA parsing'],
          },
          message: 'File format not supported for C2PA verification',
        });
      }
      
      const buffer = Buffer.from(fileData, 'base64');
      
      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 200MB' },
          { status: 400 }
        );
      }
      
      const c2paResult = await parseC2PAFromBuffer(buffer, fileName);
      
      return NextResponse.json({
        success: true,
        c2pa: c2paResult,
        fileName,
        fileSize: buffer.length,
      });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Use multipart/form-data or application/json' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('C2PA parsing error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to parse C2PA data',
      c2pa: createAbsentResult(),
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'C2PA Content Authenticity Verification',
    version: '1.0.0',
    supportedFormats: ['JPEG', 'PNG', 'WEBP', 'MP4', 'MOV'],
    maxFileSize: '200MB',
    endpoints: {
      POST: {
        description: 'Parse C2PA manifest from uploaded media',
        contentTypes: ['multipart/form-data', 'application/json'],
        parameters: {
          'multipart/form-data': { file: 'File upload' },
          'application/json': { fileData: 'Base64 encoded file', fileName: 'Original filename' },
        },
      },
    },
    disclaimer: 'C2PA provides provenance and integrity information when available. It does not guarantee authenticity or truthfulness.',
  });
}
