'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShaderAnimation } from '@/components/ui/shader-animation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, FileText, Layers } from 'lucide-react';
import { DeveloperCredit } from '@/components/features/DeveloperCredit';
import { motion, useReducedMotion } from 'framer-motion';
import { ScrambleText } from '@/components/ui/scramble-text';
import { cn } from '@/lib/utils';

// DeepGuard Motion Language tokens
const MOTION = {
  easeOutSoft: [0.16, 1, 0.3, 1] as const,
  easeData: [0.22, 1, 0.36, 1] as const,
  durationReveal: 0.62,
  durationFast: 0.4,
  durationSlow: 0.9,
};

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Reduced motion fallback
  const getTransition = (duration: number, delay: number = 0) => ({
    duration: prefersReducedMotion ? 0.2 : duration,
    delay: prefersReducedMotion ? 0 : delay,
    ease: prefersReducedMotion ? 'easeOut' : MOTION.easeOutSoft,
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center selection:bg-cyan-500/30">
      <ShaderAnimation />
      
      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition(MOTION.durationReveal, 0.1)}
        className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass border-b-0 m-4 rounded-full max-w-7xl"
      >
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
          >
            <Shield className="text-black w-5 h-5" />
          </motion.div>
          <span className="font-bold tracking-tight text-xl">DeepGuard AI</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors duration-300">Features</Link>
          <Link href="/intelligence" className="hover:text-foreground transition-colors duration-300">Live Intelligence</Link>
          <Link href="/transparency" className="hover:text-foreground transition-colors duration-300">Transparency</Link>
          <Link href="/review-queue" className="hover:text-foreground transition-colors duration-300">Review Queue</Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <DeveloperCredit />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/batch-analyze" className="hidden sm:block">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="sm" className="rounded-full px-4 gap-2 glass border-white/10 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] transition-all duration-300">
                <Layers className="w-4 h-4" />
                Batch Audit
              </Button>
            </motion.div>
          </Link>
          <Link href="/analyze">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" className="rounded-full px-6 shadow-[0_0_15px_rgba(0,255,255,0.15)] hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all duration-300">
                Analyze Media
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.nav>

      <main className="relative z-10 w-full max-w-7xl px-6 pt-32 pb-20 flex flex-col items-center">
        {/* Hero Section */}
        <div className="w-full mt-12 mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition(MOTION.durationSlow, 0.1)}
            className="glass p-8 md:p-16 rounded-[2.5rem] relative overflow-hidden group border-white/5 shadow-2xl bg-[#050A0F]/40 backdrop-blur-3xl"
          >
            {/* Subtle glow halo behind card */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-50" />
            </div>
            
            <motion.div 
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
              <div className="flex-1 text-center lg:text-left">
                {/* Badge with reveal */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={getTransition(MOTION.durationFast, 0.2)}
                >
                  <Badge variant="outline" className="mb-6 border-primary/30 text-primary py-1 px-4 rounded-full bg-primary/5 font-mono tracking-wider">
                    AI FORENSIC ANALYSIS ENGINE
                  </Badge>
                </motion.div>

                {/* Line-by-line headline reveal with Chromatic Fringing */}
                <div className="overflow-hidden mb-6 relative">
                  <motion.h1 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={getTransition(MOTION.durationReveal, 0.3)}
                    className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] relative"
                  >
                    <span className="absolute -inset-1 blur-sm text-primary/20 select-none pointer-events-none">Detect Deepfakes</span>
                    <ScrambleText text="Detect Deepfakes" duration={1800} />
                  </motion.h1>
                  <motion.h1 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={getTransition(MOTION.durationReveal, 0.42)}
                    className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-500 mt-2"
                  >
                    <ScrambleText text="With Certainty" duration={2200} delay={600} />
                  </motion.h1>
                </div>

                {/* Subtext fade */}
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={getTransition(MOTION.durationFast, 0.6)}
                  className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Frame-by-frame AI forensic analysis for videos and images. 
                  Built for truth, not assumptions. Multi-signal verification for forensic-grade certainty.
                </motion.p>

                {/* CTA Buttons with hover effects */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={getTransition(MOTION.durationFast, 0.75)}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Link href="/analyze">
                    <motion.div
                      whileHover={{ y: -3, boxShadow: '0 0 30px rgba(0,255,255,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button size="lg" className="rounded-full px-8 py-6 text-lg h-auto shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all duration-300 group">
                        Analyze Media
                        <motion.span 
                          animate={prefersReducedMotion ? {} : { x: [0, 4, 0] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="ml-2"
                        >
                          →
                        </motion.span>
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/report?analysis_id=demo">
                    <motion.div
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg h-auto glass hover:bg-white/5 border-white/10 hover:border-primary/30 transition-all duration-300">
                        View Sample Report
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>

              {/* Analysis Preview Card with forensic scan visual */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={getTransition(MOTION.durationReveal, 0.5)}
                className="flex-1 w-full max-w-md relative"
              >
                {/* Glow halo behind preview card */}
                <div className="absolute inset-0 -m-8 pointer-events-none">
                  <motion.div 
                    className="absolute inset-0 bg-primary/10 rounded-full blur-[60px]"
                    animate={prefersReducedMotion ? {} : { 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                <div className="aspect-square glass rounded-3xl p-6 relative group overflow-hidden border-primary/20 bg-[#050A0F]/60 shadow-2xl">
                  <motion.div 
                    className="absolute inset-0 bg-primary/5"
                    whileHover={{ backgroundColor: 'rgba(0, 255, 255, 0.1)' }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="scanline" />
                  
                  <div className="h-full w-full border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-6 text-center relative z-10 bg-black/40">
                    {/* Holographic Tactical HUD */}
                    <div className="relative">
                      {/* Rotating Outer Ring */}
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-8 border-[0.5px] border-dashed border-primary/40 rounded-full"
                      />
                      {/* Scanning Reticle */}
                      <motion.div 
                        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-32 h-32 rounded-full border-2 border-primary/20 flex items-center justify-center bg-primary/5 shadow-[0_0_40px_rgba(0,255,255,0.1)]"
                      >
                        <Search className="w-10 h-10 text-primary" />
                        
                        {/* Tactical Corners */}
                        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-primary/60" />
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-primary/60" />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-1">
                      <motion.div 
                        className="text-xl font-black font-mono tracking-tighter text-primary"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ISOLATING_SIGNALS
                      </motion.div>
                      <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.3em]">Neural Resonance Scan Active</div>
                    </div>
                    
                    {/* Tactical Telemetry Bars */}
                    <div className="w-full px-10 space-y-3">
                      {[
                        { label: 'GAN_ARTIFACTS', value: '82%', color: 'bg-primary' },
                        { label: 'SPECTRAL_INDEX', value: '14%', color: 'bg-blue-400' },
                        { label: 'DIFFUSION_GAP', value: '91%', color: 'bg-indigo-400' }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[7px] font-mono text-muted-foreground">
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: item.value }}
                              transition={{ duration: 2, delay: i * 0.2 }}
                              className={cn("h-full rounded-full", item.color)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating authenticity badge */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: prefersReducedMotion ? 0 : [0, 8, 0] }}
                  transition={{ 
                    opacity: { duration: 0.5, delay: 1 },
                    y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
                  }}
                  className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl border-emerald-500/30 shadow-2xl backdrop-blur-2xl bg-[#050A0F]/80"
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm font-semibold tracking-wide text-emerald-400">Authenticity Verified</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid with scroll-triggered entrance */}
        <div id="features" className="w-full grid md:grid-cols-3 gap-8 py-20">
          {[
            {
              icon: <Search className="w-6 h-6" />,
              title: "Multi-Signal Analysis",
              description: "We combine CNN, LSTM, and Eye-Blink modeling to ensure a single anomaly doesn't trigger a false positive.",
              signal: 1
            },
            {
              icon: <FileText className="w-6 h-6" />,
              title: "Explainable Reports",
              description: "Detailed PDF reports with heatmap overlays showing exactly where the AI detected manipulation artifacts.",
              signal: 2
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: "False-Positive Protection",
              description: "Built-in social media recompression awareness to prevent standard video compression from being flagged as fake.",
              signal: 3
            }
          ].map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              signal={feature.signal}
              delay={0.1 + index * 0.1}
              isHovered={hoveredCard === index}
              onHover={() => setHoveredCard(index)}
              onLeave={() => setHoveredCard(null)}
              isOtherHovered={hoveredCard !== null && hoveredCard !== index}
            />
          ))}
        </div>
      </main>

      <footer className="w-full py-12 px-6 border-t border-white/5 glass mt-auto bg-[#050A0F]/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Shield className="text-primary w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg">DeepGuard AI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Forensic Intelligence</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-medium opacity-60">
            © 2026 DeepGuard AI. Forensic-grade authenticity verification.
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors duration-300">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors duration-300">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors duration-300">Network</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  signal: number;
  delay?: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  isOtherHovered: boolean;
}

function FeatureCard({ icon, title, description, signal, delay = 0, isHovered, onHover, onLeave, isOtherHovered }: FeatureCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: prefersReducedMotion ? 0.2 : MOTION.durationReveal, 
        delay: prefersReducedMotion ? 0 : delay, 
        ease: MOTION.easeOutSoft 
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`glass p-8 rounded-[2rem] transition-all duration-500 group relative overflow-hidden bg-[#050A0F]/40 cursor-pointer
        ${isHovered ? 'border-primary/50 shadow-[0_20px_60px_rgba(0,255,255,0.1)]' : 'border-white/5'}
        ${isOtherHovered ? 'opacity-60 blur-[1px]' : 'opacity-100'}
      `}
      style={{
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
    >
      {/* Hover gradient overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Icon container with glow */}
      <motion.div 
        className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary border border-primary/10 relative z-10"
        animate={isHovered ? { 
          scale: 1.1, 
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          boxShadow: '0 0 30px rgba(0,255,255,0.3)'
        } : {
          scale: 1,
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          boxShadow: '0 0 15px rgba(0,255,255,0.1)'
        }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-bold mb-4 tracking-tight relative z-10"
        animate={{ color: isHovered ? 'rgb(0, 255, 255)' : 'rgb(255, 255, 255)' }}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.h3>
      
      <p className="text-muted-foreground leading-relaxed text-base relative z-10">
        {description}
      </p>
      
      <motion.div 
        className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] relative z-10"
        animate={{ color: isHovered ? 'rgba(0, 255, 255, 0.7)' : 'rgba(0, 255, 255, 0.4)' }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="w-1 h-1 rounded-full bg-current"
          animate={isHovered ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        Forensic Signal {signal}
      </motion.div>
    </motion.div>
  );
}
