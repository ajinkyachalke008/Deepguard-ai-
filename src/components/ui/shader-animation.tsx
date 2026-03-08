"use client";

import React, { useEffect, useRef, useState } from 'react';

interface ShaderAnimationProps {
  intensity?: 'low' | 'normal' | 'high';
  variant?: 'default' | 'analyzing' | 'results';
}

export const ShaderAnimation = ({ intensity = 'normal', variant = 'default' }: ShaderAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    const particleCount = intensity === 'low' ? 25 : intensity === 'high' ? 80 : 50;
    const driftSpeed = prefersReducedMotion ? 0 : 0.003;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Particles with inward flow for analyzing state
    const particles: { 
      x: number; 
      y: number; 
      vx: number; 
      vy: number; 
      size: number;
      alpha: number;
      angle: number;
      speed: number;
    }[] = [];
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.max(canvas.width, canvas.height) * 0.5;
      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        angle: angle,
        speed: Math.random() * 0.5 + 0.2,
      });
    }

    // Grid lines for forensic effect
    const gridLines: { x: number; y: number; length: number; horizontal: boolean; alpha: number }[] = [];
    for (let i = 0; i < 20; i++) {
      gridLines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 100 + 50,
        horizontal: Math.random() > 0.5,
        alpha: Math.random() * 0.1 + 0.02,
      });
    }

    const draw = () => {
      time += driftSpeed;
      
      // Clear with slight trail for smooth motion
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Slow drifting gradient background (12-14s cycle)
      const gradientCycle = Math.sin(time * 0.5) * 0.5 + 0.5; // 0 to 1 over ~12s
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.3) * 100, 
        canvas.height / 2 + Math.cos(time * 0.25) * 80, 
        0,
        canvas.width / 2, 
        canvas.height / 2, 
        Math.max(canvas.width, canvas.height) * 0.8
      );
      
      const pulseIntensity = variant === 'analyzing' ? 0.08 : 0.04;
      const pulse = Math.sin(time * 0.8) * pulseIntensity + pulseIntensity;
      
      gradient.addColorStop(0, `rgba(0, 80, 120, ${pulse * (1 + gradientCycle * 0.3)})`);
      gradient.addColorStop(0.4, `rgba(0, 50, 100, ${pulse * 0.5})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Secondary accent gradient
      const accentGradient = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.2) * 50,
        canvas.height * 0.3 + Math.sin(time * 0.3) * 40,
        0,
        canvas.width * 0.7,
        canvas.height * 0.3,
        canvas.width * 0.4
      );
      accentGradient.addColorStop(0, `rgba(0, 150, 150, ${pulse * 0.3})`);
      accentGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = accentGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Faint circuit grid interference
      if (!prefersReducedMotion) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.015)';
        ctx.lineWidth = 1;
        
        gridLines.forEach(line => {
          ctx.globalAlpha = line.alpha * (0.8 + Math.sin(time * 2 + line.x * 0.01) * 0.2);
          ctx.beginPath();
          if (line.horizontal) {
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x + line.length, line.y);
          } else {
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x, line.y + line.length);
          }
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      // Particles with neural connections
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
      ctx.lineWidth = 0.5;
      
      const currentCenterX = canvas.width / 2;
      const currentCenterY = canvas.height / 2;
      
      particles.forEach((p, i) => {
        if (!prefersReducedMotion) {
          if (variant === 'analyzing') {
            // Inward flow for analyzing state
            const dx = currentCenterX - p.x;
            const dy = currentCenterY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 50) {
              p.x += (dx / dist) * p.speed * 0.3;
              p.y += (dy / dist) * p.speed * 0.3;
            } else {
              // Reset particle to edge when it reaches center
              const newAngle = Math.random() * Math.PI * 2;
              const newDist = Math.max(canvas.width, canvas.height) * 0.6;
              p.x = currentCenterX + Math.cos(newAngle) * newDist;
              p.y = currentCenterY + Math.sin(newAngle) * newDist;
            }
          } else {
            // Normal drift
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          }
        }

        // Draw particle with glow
        const particleGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        particleGlow.addColorStop(0, `rgba(0, 255, 255, ${p.alpha * 0.6})`);
        particleGlow.addColorStop(0.5, `rgba(0, 200, 255, ${p.alpha * 0.2})`);
        particleGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = particleGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.globalAlpha = (1 - dist / 120) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      // Soft noise grain overlay
      if (!prefersReducedMotion && intensity !== 'low') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const grainIntensity = 3;
        
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel for performance
          const noise = (Math.random() - 0.5) * grainIntensity;
          data[i] = Math.max(0, Math.min(255, data[i] + noise));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion, intensity, variant]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-[#030608]"
      style={{ filter: 'blur(30px)' }}
    />
  );
};

// Forensic Scan Ring Component
export const ForensicScanRing = ({ size = 96, isActive = true }: { size?: number; isActive?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    canvas.width = size * 2;
    canvas.height = size * 2;

    const draw = () => {
      rotation += 0.008; // Slow 12-14s rotation
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = size * 0.8;

      // Outer glow ring
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.7,
        centerX, centerY, radius * 1.2
      );
      glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      glowGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
      glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rotating sweep
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      const sweepGradient = ctx.createConicGradient(0, 0, 0);
      sweepGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      sweepGradient.addColorStop(0.1, 'rgba(0, 255, 255, 0.1)');
      sweepGradient.addColorStop(0.3, 'rgba(0, 255, 255, 0)');
      sweepGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      
      ctx.restore();

      // Ring segments
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 10]);
      ctx.lineDashOffset = -rotation * 50;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.setLineDash([]);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
};

// Data particle flow component
export const DataParticleFlow = ({ isActive = true, direction = 'inward' }: { isActive?: boolean; direction?: 'inward' | 'outward' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; speed: number; size: number; alpha: number }[] = [];
    
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = direction === 'inward' 
        ? Math.random() * Math.max(canvas.width, canvas.height) * 0.4 + 100
        : Math.random() * 50;
      particles.push({
        x: canvas.width / 2 / window.devicePixelRatio + Math.cos(angle) * dist,
        y: canvas.height / 2 / window.devicePixelRatio + Math.sin(angle) * dist,
        speed: Math.random() * 0.5 + 0.3,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2 / window.devicePixelRatio;
      const centerY = canvas.height / 2 / window.devicePixelRatio;

      particles.forEach(p => {
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (direction === 'inward') {
          if (dist > 20) {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
          } else {
            const angle = Math.random() * Math.PI * 2;
            const newDist = Math.max(canvas.width, canvas.height) * 0.4;
            p.x = centerX + Math.cos(angle) * newDist;
            p.y = centerY + Math.sin(angle) * newDist;
          }
        }

        // Fade based on distance
        const fadeFactor = direction === 'inward' 
          ? Math.min(1, dist / 100)
          : Math.max(0, 1 - dist / 200);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha * fadeFactor})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, direction]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
};
