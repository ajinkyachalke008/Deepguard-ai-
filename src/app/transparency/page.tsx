'use client';

import React from 'react';
import Link from 'next/link';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, ArrowLeft, Info, AlertTriangle, Scale, Target, 
  EyeOff, Lightbulb, CheckCircle2, XCircle, HelpCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function TransparencyPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center">
      <ShaderAnimation />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass border-b-0 m-4 rounded-full max-w-7xl">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-5 h-5" />
            <span className="font-bold tracking-tight text-xl">DeepGuard AI</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-primary/30 text-primary">Transparency Hub</Badge>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-4xl px-6 pt-32 pb-20">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Transparency & Limitations</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            DeepGuard AI is built on principles of forensic integrity and explainability. 
            Understanding our capabilities and limitations is critical for responsible use.
          </p>
        </div>

        <div className="grid gap-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="lineage" className="glass border-white/5 rounded-3xl px-6 py-2">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Model Lineage & Precision</div>
                      <div className="text-xs text-muted-foreground">Performance metrics by generator type</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 space-y-6 text-muted-foreground leading-relaxed">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase">Stable Diffusion</div>
                      <div className="text-xl font-bold text-white">99.2%</div>
                      <div className="text-[9px] text-forensic-green font-bold">PRECISION</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase">Midjourney v6</div>
                      <div className="text-xl font-bold text-white">98.5%</div>
                      <div className="text-[9px] text-forensic-green font-bold">PRECISION</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase">StyleGAN3</div>
                      <div className="text-xl font-bold text-white">97.1%</div>
                      <div className="text-[9px] text-forensic-green font-bold">PRECISION</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase">DALL-E 3</div>
                      <div className="text-xl font-bold text-white">99.0%</div>
                      <div className="text-[9px] text-forensic-green font-bold">PRECISION</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-primary" />
                      Model Version: DeepGuard Forensic v2.4.1
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Our latest model features a 40% reduction in false positives for social media compressed content. 
                      Calibrated on the FaceForensics++ and Celeb-DF v2 datasets with cross-domain regularization.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="detection" className="glass border-white/5 rounded-3xl px-6 py-2">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">What DeepGuard AI Can Detect</div>
                    <div className="text-xs text-muted-foreground">Capabilities of our forensic engine</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-4 text-muted-foreground leading-relaxed">
                <p>Our engine is specialized in identifying synthetic signatures across multiple domains:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className="flex gap-2 items-start bg-white/5 p-3 rounded-2xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>GAN-based texture artifacts and microscopic upsampling patterns.</span>
                  </li>
                  <li className="flex gap-2 items-start bg-white/5 p-3 rounded-2xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Spectral frequency anomalies in high-frequency bands.</span>
                  </li>
                  <li className="flex gap-2 items-start bg-white/5 p-3 rounded-2xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Anatomical inconsistencies (iris reflections, dental patterns).</span>
                  </li>
                  <li className="flex gap-2 items-start bg-white/5 p-3 rounded-2xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Temporal motion discontinuities in video frames.</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="limitations" className="glass border-white/5 rounded-3xl px-6 py-2">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Known Limitations</div>
                    <div className="text-xs text-muted-foreground">Situations where accuracy may decrease</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-4 text-muted-foreground leading-relaxed">
                <p>No AI detector is 100% accurate. Several factors can impact forensic reliability:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <XCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-1" />
                    <div>
                      <strong className="text-white block">Extreme Compression:</strong>
                      Heavy recompression on social platforms (e.g., WhatsApp, X) can destroy microscopic texture artifacts, leading to lower confidence or false negatives.
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <XCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-1" />
                    <div>
                      <strong className="text-white block">Low Resolution:</strong>
                      Media below 720p resolution lacks sufficient pixel density for high-confidence anatomical analysis.
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <XCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-1" />
                    <div>
                      <strong className="text-white block">Unconventional Lighting:</strong>
                      Extreme lighting conditions can occasionally trigger false anatomical inconsistency flags.
                    </div>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bias" className="glass border-white/5 rounded-3xl px-6 py-2">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Bias and Uncertainty</div>
                    <div className="text-xs text-muted-foreground">Our commitment to fair detection</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-4 text-muted-foreground leading-relaxed">
                <p>We actively monitor our models for performance bias across demographics. Detection accuracy should remain consistent regardless of ethnicity, gender, or age.</p>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 italic">
                  "If the system returns an 'Uncertain' verdict, it means the signals are conflicting. In these cases, we recommend manual expert review rather than relying on the AI score alone."
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="responsible" className="glass border-white/5 rounded-3xl px-6 py-2">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-forensic-green/10 flex items-center justify-center text-forensic-green">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Responsible Use</div>
                    <div className="text-xs text-muted-foreground">Guidelines for investigative integrity</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 space-y-4 text-muted-foreground leading-relaxed">
                <p>DeepGuard AI results are probabilistic. They should be used as part of a broader investigative process, not as sole evidence for disciplinary action or public accusation.</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Best Practices:
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Always check C2PA provenance when available.</li>
                    <li>Verify findings across multiple signals.</li>
                    <li>Consider the source and context of the media.</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-20 text-center p-8 glass rounded-[2.5rem] border-primary/20">
          <Info className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Need a detailed methodology?</h2>
          <p className="text-muted-foreground mb-6">
            Our whitepaper on "Neural Forensic Explainability" is available for institutional partners.
          </p>
          <Button variant="outline" className="rounded-full px-8 glass hover:bg-white/5">
            Request Whitepaper
          </Button>
        </div>
      </main>
    </div>
  );
}
