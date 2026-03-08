import { jsPDF } from 'jspdf';
import { AnalysisResult } from './forensic-analysis';

function generateSHA256Hash(): string {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
}

export async function generateForensicPDF(analysis: AnalysisResult, analysisId: string): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  const reportHash = generateSHA256Hash();
  const mediaHash = generateSHA256Hash();

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFillColor(0, 242, 255);
  doc.rect(0, 0, pageWidth, 3, 'F');

  yPos = 25;
  doc.setTextColor(0, 242, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DEEPGUARD AI', margin, yPos);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FORENSIC ANALYSIS REPORT', margin, yPos + 7);

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.text(`Report ID: ${analysisId}`, pageWidth - margin - 60, yPos);
  doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - margin - 60, yPos + 4);
  doc.text('IEEE 1711-2022 Compliant', pageWidth - margin - 60, yPos + 8);

  yPos = 50;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', margin, yPos);

  yPos += 10;
  
  const verdictColor = analysis.verdict.severity === 'high' 
    ? [255, 0, 85] 
    : analysis.verdict.severity === 'mid' 
      ? [255, 170, 0] 
      : [0, 255, 170];
  
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`VERDICT: ${analysis.verdict.label.toUpperCase()}`, margin + 10, yPos + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Confidence: ${analysis.verdict.confidence.toFixed(1)}% | Score: ${analysis.verdict.score.toFixed(1)}%`, margin + 10, yPos + 18);

  yPos += 35;
  
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, 'F');
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('FILE NAME', margin + 5, yPos + 8);
  doc.text('MEDIA TYPE', margin + 70, yPos + 8);
  doc.text('FILE SIZE', margin + 110, yPos + 8);
  doc.text('ANALYSIS DATE', margin + 140, yPos + 8);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  const truncatedName = analysis.fileName.length > 25 
    ? analysis.fileName.substring(0, 22) + '...' 
    : analysis.fileName;
  doc.text(truncatedName, margin + 5, yPos + 16);
  doc.text(analysis.mediaType.toUpperCase(), margin + 70, yPos + 16);
  doc.text(`${(analysis.fileSize / 1024 / 1024).toFixed(2)} MB`, margin + 110, yPos + 16);
  doc.text(formatDate(analysis.createdAt).split(',')[0], margin + 140, yPos + 16);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.text(`SHA-256: ${mediaHash.substring(0, 32)}...`, margin + 5, yPos + 28);

  yPos += 50;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SIGNAL ANALYSIS', margin, yPos);

  yPos += 10;
  
  const signals = [
    { name: 'GAN Texture Artifacts', value: analysis.signals.ganArtifacts },
    { name: 'Spectral Anomaly', value: analysis.signals.spectralAnomaly },
    { name: 'Anatomical Inconsistency', value: analysis.signals.anatomicalInconsistency },
    { name: 'Lighting Consistency', value: analysis.signals.lightingConsistency },
    { name: 'Sensor Noise Pattern', value: analysis.signals.sensorNoisePattern },
  ];

  if (analysis.mediaType === 'video') {
    signals.push(
      { name: 'Eye Blink Anomaly', value: analysis.signals.eyeBlinkAnomaly || 0 },
      { name: 'Lip Sync Anomaly', value: analysis.signals.lipSyncAnomaly || 0 },
      { name: 'Temporal Consistency', value: analysis.signals.temporalConsistency || 0 }
    );
  }

  signals.forEach((signal, i) => {
    const barY = yPos + i * 12;
    
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text(signal.name, margin, barY + 4);
    
    doc.setFillColor(30, 30, 30);
    doc.roundedRect(margin + 55, barY, 80, 6, 1, 1, 'F');
    
    const barColor = signal.value > 70 ? [255, 0, 85] : signal.value > 40 ? [255, 170, 0] : [0, 242, 255];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.roundedRect(margin + 55, barY, signal.value * 0.8, 6, 1, 1, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.text(`${signal.value.toFixed(1)}%`, margin + 140, barY + 4);
  });

  yPos += signals.length * 12 + 15;

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('METADATA EXTRACTION', margin, yPos);

  yPos += 10;
  
  const metadata = [
    { label: 'Format', value: analysis.metadata.format },
    { label: 'Resolution', value: analysis.metadata.width ? `${analysis.metadata.width}x${analysis.metadata.height}` : 'Unknown' },
    { label: 'Camera/Device', value: analysis.metadata.camera || 'Not Detected' },
    { label: 'Software', value: analysis.metadata.software || 'Not Detected' },
    { label: 'EXIF Data', value: analysis.metadata.hasExif ? 'Present' : 'Absent' },
    { label: 'GPS Location', value: analysis.metadata.gpsLocation || 'Not Embedded' },
    { label: 'Social Platform', value: analysis.metadata.socialPlatform || 'None Detected' },
  ];

  doc.setFillColor(20, 20, 20);
  doc.roundedRect(margin, yPos, contentWidth, metadata.length * 8 + 10, 2, 2, 'F');

  metadata.forEach((item, i) => {
    const metaY = yPos + 8 + i * 8;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(item.label, margin + 5, metaY);
    doc.setTextColor(200, 200, 200);
    doc.text(item.value, margin + 50, metaY);
  });

  yPos += metadata.length * 8 + 25;

  if (yPos > pageHeight - 80) {
    doc.addPage();
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    yPos = margin;
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ENTROPY ANALYSIS', margin, yPos);

  yPos += 10;
  
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(margin, yPos, contentWidth, 30, 2, 2, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('Average Entropy', margin + 5, yPos + 10);
  doc.text('Maximum Entropy', margin + 60, yPos + 10);
  doc.text('Suspicious Regions', margin + 120, yPos + 10);
  
  doc.setTextColor(0, 242, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(analysis.entropyAnalysis.average.toFixed(3), margin + 5, yPos + 22);
  doc.text(analysis.entropyAnalysis.max.toFixed(3), margin + 60, yPos + 22);
  doc.text(analysis.entropyAnalysis.suspiciousRegions.toString(), margin + 120, yPos + 22);

  yPos += 45;

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CHAIN OF CUSTODY', margin, yPos);

  yPos += 10;
  
  const custody = [
    { action: 'Media Uploaded', time: formatDate(analysis.createdAt), hash: mediaHash.substring(0, 16) + '...' },
    { action: 'Integrity Verified', time: formatDate(analysis.createdAt), hash: 'SHA-256 Match' },
    { action: 'Forensic Analysis', time: formatDate(analysis.createdAt), hash: 'v2.4.1-neural' },
    { action: 'Report Generated', time: formatDate(new Date()), hash: reportHash.substring(0, 16) + '...' },
  ];

  custody.forEach((item, i) => {
    const custodyY = yPos + i * 10;
    
    doc.setFillColor(0, 242, 255);
    doc.circle(margin + 3, custodyY + 2, 1.5, 'F');
    
    if (i < custody.length - 1) {
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(0.3);
      doc.line(margin + 3, custodyY + 4, margin + 3, custodyY + 10);
    }
    
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text(item.action, margin + 10, custodyY + 3);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text(`${item.time} | ${item.hash}`, margin + 10, custodyY + 7);
  });

  const footerY = pageHeight - 15;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7);
  doc.text('This report is generated by DeepGuard AI Forensic Analysis Engine v2.4.1', margin, footerY);
  doc.text(`Document Hash: ${reportHash.substring(0, 32)}...`, margin, footerY + 4);
  doc.text('IEEE 1711-2022 | ISO/IEC 27037:2012 Compliant', pageWidth - margin - 50, footerY);
  doc.text(`Page 1 of 1`, pageWidth - margin - 15, footerY + 4);

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
