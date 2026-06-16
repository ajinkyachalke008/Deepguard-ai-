'use client';

import React, { useRef, useState, MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  glowColor?: string; // hex or rgba
  spotlightSize?: number;
}

export function SpotlightCard({
  children,
  className,
  glowColor = 'rgba(0, 255, 255, 0.25)', // Reverted to original cyan intensity
  spotlightSize = 450,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-[2.5rem] shadow-[inset_0_0_40px_rgba(234,179,8,0.03)] group gradient-border-component gradient-border-auto',
        className
      )}
      style={{
        '--gradient-primary': '#713f12',
        '--gradient-secondary': '#ca8a04',
        '--gradient-accent': '#fde047',
        '--bg-color': '#020202',
        '--border-width': '1.5px',
        '--border-radius': '40px',
        '--animation-duration': '6s',
        border: '1.5px solid transparent',
        borderRadius: '40px',
        backgroundImage: `
          linear-gradient(#020202, #020202),
          conic-gradient(
            from var(--gradient-angle, 0deg),
            #713f12 0%,
            #ca8a04 37%,
            #fde047 30%,
            #ca8a04 33%,
            #713f12 40%,
            #713f12 50%,
            #ca8a04 77%,
            #fde047 80%,
            #ca8a04 83%,
            #713f12 90%
          )
        `,
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        ...(props.style || {})
      } as React.CSSProperties}
      {...props}
    >
      {/* Dynamic Hover Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      
      {/* Persistent Background Cyber Matrix - Golden */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(234,179,8,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
}
