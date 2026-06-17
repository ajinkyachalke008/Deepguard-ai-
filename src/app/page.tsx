'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Search, FileText, Menu, X, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { ShinyText } from '@/components/ui/shiny-text';
import { LampContainer } from '@/components/ui/lamp';
import { MagnifyingText } from '@/components/ui/magnifying-text';


// DeepGuard Motion Language tokens
const MOTION = {
  easeOutSoft: [0.16, 1, 0.3, 1] as const,
  durationReveal: 0.62,
};

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-black selection:bg-[#64CEFB]/30 font-sans text-white">
      {/* Background Video for ENTIRE PAGE */}
      <div className="fixed inset-0 z-0">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* FULL-SCREEN HERO SECTION (DesignPro Style) */}
      <div className="relative z-10 flex flex-col min-h-screen w-full overflow-hidden max-w-7xl mx-auto">
        <div className="relative z-10 flex flex-col flex-1 px-5 sm:px-8 md:px-12 pt-6 pb-12">
          
          {/* 1. Pill Navigation */}
          <header className="flex justify-center w-full mb-12">
            <div className="flex items-center justify-between w-full max-w-5xl rounded-full border border-gray-700 bg-black/20 backdrop-blur-md px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="DeepGuard Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-semibold text-lg tracking-wide">DeepGuard</span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-8">
                {[
                  { name: 'Features', path: '#features' },
                  { name: 'Live Intelligence', path: '/intelligence' },
                  { name: 'Transparency', path: '/transparency' },
                  { name: 'Review Queue', path: '/review-queue' },
                  { name: 'Batch Audit', path: '/batch-analyze' }
                ].map((link) => (
                  <Link key={link.name} href={link.path} className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="hidden lg:flex">
                <Link href="/analyze" className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group">
                  Start Deep Scan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Mobile Hamburger */}
              <button 
                onClick={() => setMenuOpen(true)}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              >
                <span className="w-5 h-0.5 bg-white"></span>
                <span className="w-5 h-0.5 bg-white"></span>
                <span className="w-5 h-0.5 bg-white"></span>
              </button>
            </div>
          </header>

          {/* Center Hero */}
          <div className="flex-1 flex flex-col items-center justify-start -mt-16 text-center relative z-0">
            <div className="w-full flex items-center justify-center">
              <LampContainer className="min-h-[50vh]">
                <div className="z-50 relative origin-center pb-32">
                  <MagnifyingText text="Detect Deepfakes" />
                </div>
              </LampContainer>
            </div>

            {/* CTA Button */}
            <motion.div 
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link href="/analyze">
                <button className="group flex items-center gap-3 bg-black hover:bg-gray-900 rounded-full px-6 md:px-8 py-3 md:py-4 transition-colors">
                  <span className="text-white font-medium text-sm md:text-base">Start Deep Scan</span>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl p-5 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="DeepGuard Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-16 flex flex-col gap-8 items-center">
                {[
                  { name: 'Features', path: '#features' },
                  { name: 'Live Intelligence', path: '/intelligence' },
                  { name: 'Transparency', path: '/transparency' },
                  { name: 'Review Queue', path: '/review-queue' },
                  { name: 'Batch Audit', path: '/batch-analyze' }
                ].map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.path} 
                    onClick={() => setMenuOpen(false)}
                    className="text-3xl font-medium text-white tracking-wide"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="mt-auto pb-8 flex justify-center">
                <Link href="/analyze" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-lg font-medium text-[#64CEFB]">
                  Start Deep Scan <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* REMAINDER OF THE PAGE (Feature Grid & Footer) */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center">
        {/* Feature Grid with scroll-triggered entrance */}
        <div id="features" className="w-full grid md:grid-cols-3 gap-8 py-20">
          {[
            {
              icon: <Search className="w-6 h-6 text-[#64CEFB]" />,
              title: "Multi-Signal Analysis",
              description: "We combine CNN, LSTM, and Eye-Blink modeling to ensure a single anomaly doesn't trigger a false positive.",
              signal: 1
            },
            {
              icon: <FileText className="w-6 h-6 text-[#64CEFB]" />,
              title: "Explainable Reports",
              description: "Detailed PDF reports with heatmap overlays showing exactly where the AI detected manipulation artifacts.",
              signal: 2
            },
            {
              icon: <Shield className="w-6 h-6 text-[#64CEFB]" />,
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

      <footer className="relative z-10 w-full py-12 px-6 border-t border-white/5 mt-auto bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="DeepGuard Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg text-white">DeepGuard AI</span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-medium">Forensic Intelligence</span>
            </div>
          </div>
          <div className="text-sm text-white/50 font-medium">
            © 2026 DeepGuard AI. Forensic-grade authenticity verification.
          </div>
          <div className="flex gap-8 text-sm text-white/50">
            <Link href="#" className="hover:text-[#64CEFB] transition-colors duration-300">Privacy</Link>
            <Link href="#" className="hover:text-[#64CEFB] transition-colors duration-300">Terms</Link>
            <Link href="#" className="hover:text-[#64CEFB] transition-colors duration-300">Network</Link>
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
      className="w-full relative cursor-pointer"
      style={{
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
    >
      <SpotlightCard className={`h-full p-8 transition-all duration-500
        ${isHovered ? 'border-[#64CEFB]/50 shadow-[0_20px_60px_rgba(100,206,251,0.1)]' : 'border-white/5'}
        ${isOtherHovered ? 'opacity-60 blur-[1px]' : 'opacity-100'}
      `}>
        {/* Hover gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#64CEFB]/10 to-transparent z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Icon container with glow */}
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-[#64CEFB]/10 flex items-center justify-center mb-8 text-[#64CEFB] border border-[#64CEFB]/10 relative z-10"
          animate={isHovered ? { 
            scale: 1.1, 
            backgroundColor: 'rgba(100, 206, 251, 0.2)',
            boxShadow: '0 0 30px rgba(100,206,251,0.3)'
          } : {
            scale: 1,
            backgroundColor: 'rgba(100, 206, 251, 0.1)',
            boxShadow: '0 0 15px rgba(100,206,251,0.1)'
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-bold mb-4 tracking-tight relative z-10 text-white"
          animate={{ color: isHovered ? 'rgb(100, 206, 251)' : 'rgb(255, 255, 255)' }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
        
        <p className="text-white/60 leading-relaxed text-base relative z-10">
          {description}
        </p>
        
        <motion.div 
          className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] relative z-10"
          animate={{ color: isHovered ? 'rgba(100, 206, 251, 0.9)' : 'rgba(100, 206, 251, 0.5)' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="w-1 h-1 rounded-full bg-current"
            animate={isHovered ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          Forensic Signal {signal}
        </motion.div>
      </SpotlightCard>
    </motion.div>
  );
}
