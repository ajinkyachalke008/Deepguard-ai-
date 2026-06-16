import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';
import { updateAnalysis } from '@/lib/forensic-analysis';
import { z } from 'zod';
import { requireAnalystKey, rateLimit } from '@/lib/api-security';
import { AIAnalyzeSchema } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  try {
    const authFail = requireAnalystKey(request);
    if (authFail) return authFail;
    const limited = rateLimit(request, 'api:analyze:ai', 12, 60_000);
    if (limited) return limited;
    const body = AIAnalyzeSchema.parse(await request.json());
    const { imageUrl, base64Image, fileType, analysisId } = body;

    const imageSource = imageUrl || `data:${fileType || 'image/jpeg'};base64,${base64Image}`;

    const prompt = `
      You are a specialized AI forensic analyst. Your task is to analyze the provided image for signs of AI manipulation, deepfakes, or synthetic generation.
      
      Look for:
      1. GAN artifacts (checkerboard patterns, unusual noise).
      2. Anatomical inconsistencies (extra fingers, irregular eye reflections, mismatched earrings, texture breaks).
      3. Spectral anomalies (unnatural frequency distributions).
      4. Lighting and shadow inconsistencies.
      
      Respond in JSON format with the following structure:
      {
        "verdict": {
          "label": "Likely AI-generated" | "Likely Real" | "Uncertain",
          "score": number (0-100, where 100 is most likely AI),
          "confidence": number (0-100),
          "explanation": "Brief explanation of the verdict"
        },
        "signals": {
          "ganArtifacts": number (0-100),
          "spectralAnomaly": number (0-100),
          "anatomicalInconsistency": number (0-100),
          "lightingConsistency": number (0-100)
        },
        "findings": [
          { "location": "string", "issue": "string", "confidence": number }
        ],
        "audienceExplanations": {
          "General": "string",
          "Journalist": "string",
          "Legal": "string"
        },
        "heatmapRegions": [
          {
            "id": "string (e.g. h1, h2)",
            "x": number (percentage integer 0-100 representing top-left X position of bounding box on image where anomaly is seen),
            "y": number (percentage integer 0-100 representing top-left Y position of bounding box on image),
            "width": number (percentage integer 1-100 of bounding box width),
            "height": number (percentage integer 1-100 of bounding box height),
            "intensity": number (decimal 0.0 to 1.0 indicating severity/confidence of anomaly),
            "label": "string (e.g. 'Mismatched Eye Reflections')",
            "explanation": "string (specific observation description)"
          }
        ],
        "narrativeTimeline": [
          {
            "id": "string (unique)",
            "milestone": "string (e.g. 'Signal Acquisition', 'Biometric Scan', 'Frequency Scan')",
            "description": "string (custom observation, what was verified on this specific image)",
            "timestamp": "string (e.g. 'T+0.2s', 'T+0.5s')",
            "iconType": "shield" | "search" | "alert" | "check"
          }
        ],
        "confidenceEvolution": [
          {
            "stage": "string",
            "delta": number (relative change in confidence, e.g. 10 or -8),
            "cumulative": number (running confidence score, 0-100),
            "explanation": "string (rationale for confidence change)"
          }
        ],
        "confidenceGaps": [
          {
            "id": "string",
            "condition": "string (e.g. 'EXIF Metadata', 'Texture Uniformity')",
            "impact": "string (e.g. '+10%', '-15%')",
            "recommendation": "string (actionable investigator advice)",
            "status": "missing" | "degraded" | "present"
          }
        ]
      }

      CRITICAL SPECIFICATION FOR coordinates in heatmapRegions:
      - x, y, width, height must be integer percentages relative to the image (0-100).
      - If the image is "Likely Real" (score < 35), you can return an empty heatmapRegions array, or a single region covering a normal area labeled "Normal variation" with low intensity (0.1 to 0.2).
      - If the image is AI-generated/Manipulated, map the actual coordinates where you spot visual flaws (e.g. eyes area is around y: 25-40, mouth is around y: 55-70, ears are on extreme left/right x, etc.).
    `;

    const response = await chatCompletion([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageSource } }
        ]
      }
    ], 'openai/gpt-4o-mini', { temperature: 0.1 });

    // Clean the response in case the AI included markdown blocks
    const cleanedResponse = response.replace(/```json\n?|```/g, '').trim();
    const aiResult = JSON.parse(cleanedResponse);

      // If analysisId is provided, store AI interpretation separately from measured signals
      if (analysisId) {
        await updateAnalysis(analysisId, {
          aiInterpretation: {
            model: 'openai/gpt-4o-mini',
            generatedAt: new Date().toISOString(),
            verdict: aiResult.verdict,
            signals: aiResult.signals,
            findings: aiResult.findings || [],
            audienceExplanations: aiResult.audienceExplanations || {},
            heatmapRegions: aiResult.heatmapRegions || [],
            narrativeTimeline: aiResult.narrativeTimeline || [],
            confidenceEvolution: aiResult.confidenceEvolution || [],
            confidenceGaps: aiResult.confidenceGaps || []
          }
        });
      }


    return NextResponse.json({
      success: true,
      analysis: aiResult
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to process AI analysis' },
      { status: 500 }
    );
  }
}
