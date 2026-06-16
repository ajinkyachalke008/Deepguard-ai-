'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShinyTextProps {
  text: string;
  className?: string;
  baseColor?: string;
  shineColor?: string;
  speed?: number;
  gradientAngle?: number;
}

export function ShinyText({
  text,
  className,
  baseColor = '#64CEFB',
  shineColor = '#ffffff',
  speed = 3,
  gradientAngle = 100,
}: ShinyTextProps) {
  return (
    <motion.span
      className={cn(
        "inline-block text-transparent bg-clip-text",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(${gradientAngle}deg, ${baseColor} 40%, ${shineColor} 50%, ${baseColor} 60%)`,
        backgroundSize: '300% 100%',
      }}
      animate={{
        backgroundPosition: ['100% 0%', '-100% 0%'],
      }}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        duration: speed,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  );
}
