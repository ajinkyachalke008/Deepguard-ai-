"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  Layers, 
  Eye, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  AlertTriangle, 
  Database, 
  Fingerprint, 
  History, 
  Lock, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HowItWorksPage() {
  const router = useRouter();
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white selection:bg-primary/30">
      <ShaderAnimation />
      <div className="fixed inset-0 noise-overlay z-[1] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass border-b-0 m-4 rounded-full max-w-7xl left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="text-black w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-xl">DeepGuard AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/how-it-works" className="text-foreground transition-colors">How It Works</Link>
          <Link href="/intelligence" className="hover:text-foreground transition-colors">Intelligence</Link>
          <Link href="/report?analysis_id=demo" className="hover:text-foreground transition-colors">Demo Report</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/analyze">
            <Button size="sm" className="rounded-full px-6">
              Analyze Media
            </Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 space-y-32 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <section id="hero_intro" className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass p-8 md:p-16 rounded-[2.5rem] border-white/10 relative overflow-hidden max-w-4xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <Badge variant="outline" className="border-primary/30 text-primary py-1 px-4 rounded-full bg-primary/5 uppercase tracking-widest text-[10px]">
                  Transparency & Explainability
                </Badge>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                How DeepGuard AI Verifies <br />
                <span className="text-primary">Media Authenticity</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A transparent, forensic-grade system that analyzes images and videos using multiple independent signals — not guesses.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4 pt-4">
                <Link href="/analyze">
                  <Button size="lg" className="rounded-full px-8 py-6 text-lg h-auto shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                    Analyze Media
                  </Button>
                </Link>
                <Link href="/report?analysis_id=demo">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg h-auto glass hover:bg-white/5">
                    View Sample Report
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Vertical Stepper Timeline */}
        <section id="step_flow" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">From Upload to Insight</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our analysis pipeline is designed for rigorous verification and privacy.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Connector Line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:-translate-x-1/2" />
            
            <div className="space-y-20">
              <StepItem 
                number={1} 
                title="Upload Media" 
                explanation="Users securely upload an image or video for analysis. Media is processed in-memory and is not stored permanently by default."
                example="A user uploads a viral image from social media to verify authenticity."
                icon={<Upload className="w-6 h-6" />}
                align="left"
              />
              <StepItem 
                number={2} 
                title="Multi-Layer Analysis" 
                explanation="DeepGuard AI performs multiple independent checks instead of relying on a single AI score."
                icon={<Layers className="w-6 h-6" />}
                align="right"
              />
              <StepItem 
                number={3} 
                title="Explainable Results" 
                explanation="The system explains why a result was reached, highlighting influential regions and signals."
                icon={<Eye className="w-6 h-6" />}
                align="left"
              />
              <StepItem 
                number={4} 
                title="Clear Report" 
                explanation="Users receive a structured, readable forensic report with evidence and limitations."
                icon={<FileText className="w-6 h-6" />}
                align="right"
              />
            </div>
          </div>
        </section>

        {/* Multi-Signal Grid */}
        <section id="ai_analysis" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How the Analysis Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We leverage diverse forensic techniques to build a complete picture of authenticity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnalysisCard 
              title="Image Analysis" 
              icon={<ImageIcon className="w-6 h-6 text-primary" />}
              points={[
                "Pixel & texture patterns",
                "Frequency-domain artifacts",
                "Metadata consistency",
                "Lighting and anatomy realism"
              ]}
            />
            <AnalysisCard 
              title="Video Analysis" 
              icon={<Video className="w-6 h-6 text-teal-400" />}
              points={[
                "Frame-by-frame inspection",
                "Facial landmark tracking",
                "Eye blink and lip-sync checks",
                "Temporal motion consistency"
              ]}
            />
            <AnalysisCard 
              title="False-Positive Protection" 
              icon={<Shield className="w-6 h-6 text-amber-400" />}
              points={[
                "Multiple signals required",
                "Confidence reduced on poor-quality media",
                "Uncertain state when evidence conflicts"
              ]}
              badge="Uncertain ≠ Fake"
            />
          </div>
        </section>

        {/* Explainability Section */}
        <section id="explainability" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">We Show Our Work</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Understanding why the AI reached a conclusion is as important as the conclusion itself.
            </p>
          </div>

          <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Explainability Heatmaps</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Explainability heatmaps highlight regions that influenced the AI’s analysis. These indicate model focus, not definitive proof.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-muted-foreground">Original View</span>
                  <span className="font-medium text-primary">Heatmap Overlay</span>
                </div>
                <Slider 
                  value={[heatmapOpacity]} 
                  onValueChange={(v) => setHeatmapOpacity(v[0])} 
                  max={1} 
                  step={0.01} 
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 glass rounded-xl border-white/5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm">High influence on "AI-Generated" verdict</span>
                </div>
                <div className="flex items-center gap-3 p-4 glass rounded-xl border-white/5 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="text-sm">Low influence / Neutral region</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden glass border-primary/20 group">
              <img 
                src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
                alt="Original" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <motion.div 
                className="absolute inset-0 w-full h-full mix-blend-overlay opacity-80"
                style={{ 
                  background: 'radial-gradient(circle at 40% 40%, rgba(255,0,0,0.8) 0%, transparent 40%), radial-gradient(circle at 60% 70%, rgba(255,0,0,0.5) 0%, transparent 30%)',
                  opacity: heatmapOpacity 
                }}
              />
              <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-black/40">
                Forensic Preview
              </div>
              <div className="scanline" />
            </div>
          </div>
        </section>

        {/* Temporal Analysis */}
        <section id="temporal_analysis" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-teal-400">Detecting Manipulation Over Time</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Some manipulations only appear when frames are compared across time, revealing subtle inconsistencies.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-[2rem] border-white/10 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <History className="text-teal-400" />
                Inter-Frame Consistency
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Deepfakes often suffer from "jitter" or "ghosting" artifacts that are invisible in static frames but obvious when analyzed as a temporal sequence. Our models track facial landmarks across thousands of frames to detect these microscopic deviations.
              </p>
              <div className="aspect-video glass rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[2px] bg-teal-400/30 absolute top-1/2 -translate-y-1/2 animate-scan" />
                  <div className="text-xs uppercase tracking-[0.3em] text-teal-400 font-bold opacity-50">Temporal Scan Active</div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-teal-400"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] border-white/10 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Fingerprint className="text-teal-400" />
                Biometric Liveness
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We analyze biological signals like eye-blinking patterns and blood flow (rPPG) which are difficult for current AI models to replicate accurately over time.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl border-white/5 text-center">
                  <div className="text-teal-400 text-lg font-mono mb-1">0.82s</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Mean Blink Rate</div>
                </div>
                <div className="glass p-4 rounded-xl border-white/5 text-center">
                  <div className="text-teal-400 text-lg font-mono mb-1">94%</div>
                  <div className="text-[10px] uppercase text-muted-foreground">Gaze Stability</div>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <motion.div 
                    key={i}
                    className="flex-1 h-12 glass border-white/5 rounded-md"
                    animate={{ scaleY: [1, 1.5, 1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Provenance Section */}
        <section id="provenance" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Content Authenticity & Provenance</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We integrate with C2PA standards to verify the "chain of custody" for digital media.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ProvenanceCard 
              status="Verified provenance found" 
              description="Cryptographic signatures confirm the source and edit history."
              color="green"
            />
            <ProvenanceCard 
              status="Partial provenance data" 
              description="Incomplete manifest found, signaling possible re-encoding or stripping."
              color="amber"
            />
            <ProvenanceCard 
              status="No provenance data available" 
              description="Typical for most social media content; requires AI signal verification."
              color="gray"
            />
          </div>
          
          <div className="max-w-2xl mx-auto glass p-6 rounded-2xl border-white/5 flex items-start gap-4">
            <AlertTriangle className="text-amber-500 w-6 h-6 shrink-0 mt-1" />
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-white">Important Note:</span> Absence of provenance data does not indicate manipulation. Most legitimate media today does not yet include C2PA manifests.
            </p>
          </div>
        </section>

        {/* Hidden Data Accordion */}
        <section id="hidden_data" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Hidden Information Inside Files</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Forensics goes beyond what the eye can see.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                { title: "EXIF & GPS Metadata", content: "Hidden data about camera settings, time, and location can reveal staging or timing inconsistencies." },
                { title: "Editing Software History", content: "Many tools leave 'breadcrumbs' in the file structure indicating they were processed by AI generators or Photoshop." },
                { title: "Sensor Noise Fingerprints", content: "Every camera sensor has unique noise patterns (PRNU). AI-generated images lack these natural hardware signatures." },
                { title: "Invisible Watermarks", content: "Modern AI models often embed 'stealth' watermarks that can be recovered through forensic decoding." },
                { title: "Steganography Signals", content: "Data hidden within pixel values that can signal malicious tampering or data exfiltration." }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="glass px-6 rounded-2xl border-white/10 hover:border-primary/20 transition-all overflow-hidden">
                  <AccordionTrigger className="text-lg hover:no-underline py-6">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Understanding Results */}
        <section id="results" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Understanding the Results</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Forensic systems must clearly indicate uncertainty when evidence is inconclusive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ResultStateCard 
              label="Likely Real" 
              color="#22c55e" 
              description="No significant artifacts found across multiple layers of analysis."
            />
            <ResultStateCard 
              label="Uncertain" 
              color="#f59e0b" 
              description="Conflicting signals found. Manual review by a forensic expert is recommended."
            />
            <ResultStateCard 
              label="Likely AI-Generated" 
              color="#ef4444" 
              description="Strong evidence of synthetic patterns or temporal inconsistencies detected."
            />
          </div>
        </section>

        {/* Ethics & Privacy */}
        <section id="ethics_privacy" className="space-y-16 py-20 border-y border-white/5">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Privacy, Ethics & Limitations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Responsible AI means building with constraints.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <EthicItem icon={<Lock className="w-6 h-6" />} label="No Face Rec" />
            <EthicItem icon={<Eye className="w-6 h-6" />} label="No ID Inference" />
            <EthicItem icon={<Database className="w-6 h-6" />} label="No Storage" />
            <EthicItem icon={<Shield className="w-6 h-6" />} label="Probabilistic" />
            <EthicItem icon={<AlertTriangle className="w-6 h-6" />} label="No Absolutes" />
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm italic">
              "Forensics is the science of evidence, not the declaration of truth. We provide the data; the context belongs to the investigator."
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section id="final_cta" className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Transparency Is the <br />Future of Trust</h2>
            <Link href="/analyze">
              <Button size="lg" className="rounded-full px-12 py-8 text-xl h-auto group bg-white text-black hover:bg-white/90">
                Analyze Media Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </section>

      </main>

      <footer className="w-full py-12 px-6 border-t border-white/5 glass mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-5 h-5" />
            <span className="font-bold tracking-tight">DeepGuard AI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 DeepGuard AI. Forensic-grade authenticity verification.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="mailto:support@deepguard.ai" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepItem({ number, title, explanation, example, icon, align }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative ${align === 'right' ? 'md:flex-row-reverse text-center md:text-right' : 'text-center md:text-left'}`}
    >
      <div className="w-16 h-16 shrink-0 rounded-full glass border-primary/30 flex items-center justify-center text-primary z-10 bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
        {icon}
      </div>
      <div className={`space-y-4 pt-1 flex-1 flex flex-col ${align === 'right' ? 'md:items-end' : 'md:items-start'} items-center`}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-primary font-mono font-bold text-sm tracking-widest uppercase">Step 0{number}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
          {explanation}
        </p>
        {example && (
          <div className="p-4 glass rounded-xl border-white/5 inline-block text-sm text-muted-foreground italic mt-2">
            Example: {example}
          </div>
        )}
      </div>
      <div className="hidden md:block flex-1" />
    </motion.div>
  );
}

function AnalysisCard({ title, icon, points, badge }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass p-8 rounded-[2.5rem] border-white/10 hover:border-primary/20 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      <ul className="space-y-4">
        {points.map((point: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-sm">{point}</span>
          </li>
        ))}
      </ul>
      {badge && (
        <div className="mt-8">
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold animate-pulse">
            {badge}
          </Badge>
        </div>
      )}
    </motion.div>
  );
}

function ProvenanceCard({ status, description, color }: any) {
  const colors: any = {
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    gray: "text-muted-foreground bg-white/5 border-white/10"
  };
  
  return (
    <div className="glass p-6 rounded-2xl border-white/10 flex flex-col gap-4">
      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block w-fit ${colors[color]}`}>
        {status}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ResultStateCard({ label, color, description }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="glass p-8 rounded-[2.5rem] border-white/10 space-y-6 text-center"
    >
      <div 
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border-2"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
      >
        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: color }} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold" style={{ color }}>{label}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

function EthicItem({ icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-3 text-center group">
      <div className="w-12 h-12 rounded-full glass border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-all">
        {icon}
      </div>
      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground group-hover:text-white transition-colors">{label}</span>
    </div>
  );
}
