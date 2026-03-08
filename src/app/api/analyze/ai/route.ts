import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openrouter';
import { updateAnalysis } from '@/lib/forensic-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, base64Image, fileName, fileType, analysisId } = body;

    if (!imageUrl && !base64Image) {
      return NextResponse.json(
        { error: 'Missing image data (imageUrl or base64Image)' },
        { status: 400 }
      );
    }

    const imageSource = imageUrl || `data:${fileType || 'image/jpeg'};base64,${base64Image}`;

    const prompt = `
      You are a specialized AI forensic analyst. Your task is to analyze the provided image for signs of AI manipulation, deepfakes, or synthetic generation.
      
      Look for:
      1. GAN artifacts (checkerboard patterns, unusual noise).
      2. Anatomical inconsistencies (extra fingers, irregular eye reflections, mismatched earrings).
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
        }
      }
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

      // If analysisId is provided, update the store
      if (analysisId) {
        await updateAnalysis(analysisId, {
          verdict: {
            label: aiResult.verdict.label,
            score: aiResult.verdict.score,
            confidence: aiResult.verdict.confidence,
            severity: aiResult.verdict.score > 65 ? 'high' : aiResult.verdict.score > 35 ? 'mid' : 'low'
          },
          signals: {
            ganArtifacts: aiResult.signals.ganArtifacts,
            spectralAnomaly: aiResult.signals.spectralAnomaly,
            anatomicalInconsistency: aiResult.signals.anatomicalInconsistency,
            metadataIntegrity: 85, // Default
            lightingConsistency: aiResult.signals.lightingConsistency
          },
          audienceExplanations: aiResult.audienceExplanations
        });
      }


    return NextResponse.json({
      success: true,
      analysis: aiResult
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI analysis', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
