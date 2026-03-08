import React, { Suspense } from 'react';
import { ReportContent } from './report-content';

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-sm">
          Loading Forensic Report...
        </p>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
