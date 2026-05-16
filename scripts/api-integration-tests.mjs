import assert from 'node:assert/strict';
import { CreateAnalysisSchema, AIAnalyzeSchema, C2PAJsonSchema } from '../src/lib/api-validation.ts';

function testSchemaRejects() {
  assert.throws(() => CreateAnalysisSchema.parse({ fileName: '', fileSize: -1, fileType: '' }));
  assert.throws(() => AIAnalyzeSchema.parse({}));
  assert.throws(() => C2PAJsonSchema.parse({ fileData: '', fileName: '' }));
}

function testSchemaAccepts() {
  const analyze = CreateAnalysisSchema.parse({
    fileName: 'test.jpg',
    fileSize: 1024,
    fileType: 'image/jpeg',
    ganScore: 55,
    spectralScore: 42,
  });
  assert.equal(analyze.fileName, 'test.jpg');

  const ai = AIAnalyzeSchema.parse({
    base64Image: 'abcd',
    fileType: 'image/jpeg',
  });
  assert.equal(ai.fileType, 'image/jpeg');

  const c2pa = C2PAJsonSchema.parse({
    fileData: 'abcd',
    fileName: 'x.jpg',
    fileType: 'image/jpeg',
  });
  assert.equal(c2pa.fileName, 'x.jpg');
}

testSchemaRejects();
testSchemaAccepts();
console.log('API schema integration checks passed.');
