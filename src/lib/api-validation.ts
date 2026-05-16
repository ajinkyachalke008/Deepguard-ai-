import { z } from 'zod';

export const CreateAnalysisSchema = z.object({
  fileName: z.string().min(1).max(260),
  fileSize: z.number().int().positive().max(200 * 1024 * 1024),
  fileType: z.string().min(1),
  fileUrl: z.string().url().optional().or(z.literal("")),
  entropySample: z.number().min(0).max(1).optional(),
  thumbnailUrl: z.string().optional(),
  c2paResult: z.unknown().optional(),
  ganScore: z.number().min(0).max(100).optional(),
  spectralScore: z.number().min(0).max(100).optional()
});

export const AIAnalyzeSchema = z.object({
  imageUrl: z.string().url().optional(),
  base64Image: z.string().max(30_000_000).optional(),
  fileType: z.string().optional(),
  analysisId: z.string().optional()
}).refine((v) => !!v.imageUrl || !!v.base64Image, { message: 'Missing image data (imageUrl or base64Image)' });

export const C2PAJsonSchema = z.object({
  fileData: z.string().min(1).max(300_000_000),
  fileName: z.string().min(1).max(260),
  fileType: z.string().optional(),
});

