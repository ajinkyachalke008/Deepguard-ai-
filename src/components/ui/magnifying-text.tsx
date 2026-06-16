"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface MagnifyingTextProps {
  text: string;
  className?: string;
}

export function MagnifyingText({ text, className }: MagnifyingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [scrambledText, setScrambledText] = useState(text);

  const glassX = useMotionValue(0);
  const glassY = useMotionValue(0);
  const glassRotate = useMotionValue(0);

  // Cyber scrambling effect for the "inner view"
  useEffect(() => {
    // True hardcore cyber: Matrix katakana, block elements, hex codes, and binary
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ█▓▒░<>{}[];!@#$*&^%_+-=";
    const interval = setInterval(() => {
      setScrambledText(
        text
          .split("")
          .map((char) => {
            if (char === " ") return " ";
            // 35% chance to scramble a character every tick (much more aggressive glitching)
            if (Math.random() < 0.35) {
              return chars[Math.floor(Math.random() * chars.length)];
            }
            return char;
          })
          .join("")
      );
    }, 45); // Faster update rate for an aggressive, chaotic cyber feel

    return () => clearInterval(interval);
  }, [text]);

  const SCALE = 1.5; // Controls the overall size of the magnifying glass
  const lensRadius = 48 * SCALE;
  const lensDiameter = lensRadius * 2;

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
      if (textRef.current) {
        setTextHeight(textRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Sweep animation
  useEffect(() => {
    if (containerWidth === 0) return;

    // Keep the sweep bounded to the text itself, but let it drift slightly further right
    const sweepStart = -20;
    const sweepEnd = containerWidth - lensDiameter + 70;

    const controlsX = animate(glassX, [sweepStart, sweepEnd, sweepStart], {
      duration: 12, // Move much slower
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 0.5,
    });

    // Organic hand wobble (bobbing up and down slightly)
    const controlsY = animate(glassY, [0, -12, 4, -8, 0], {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 0.5,
    });

    // Organic hand tilt (tilting the handle left and right)
    const controlsRotate = animate(glassRotate, [0, 6, -4, 3, 0], {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 0.5,
    });

    return () => {
      controlsX.stop();
      controlsY.stop();
      controlsRotate.stop();
    };
  }, [containerWidth, glassX]);


  // Dynamic reflection rotation based on glass movement
  // As the glass moves left-to-right, the light reflection on the glass rotates
  const reflectionRotate = useTransform(glassX, [-500, 1500], [-45, 45]);

  // Center the lens vertically on the text
  const lensTop = (textHeight - lensDiameter) / 2;

  // Inverse X and Y so bright text inside the lens stays perfectly aligned with base text
  // Even if the glass bobs up and down (glassY), the text stays mathematically locked in place
  const brightTextX = useTransform(glassX, (x) => -x);
  const brightTextY = useTransform(glassY, (y) => -y);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none ${className ?? ""}`}
    >
      {/* Base text — 100% brightness */}
      <h1
        ref={textRef}
        className="text-6xl md:text-8xl font-bold tracking-tight text-white whitespace-nowrap py-2"
        style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8), 0px -1px 1px rgba(255,255,255,0.1)" }}
      >
        {text}
      </h1>

      {/* Moving lens window — clips the magnified text to a circle */}
      {containerWidth > 0 && (
        <motion.div
          className="absolute left-0 pointer-events-none"
          style={{
            x: glassX,
            y: glassY,
            top: lensTop,
            width: lensDiameter,
            height: lensDiameter,
          }}
        >
          {/* Circular clip — scale(1.15) from center creates the magnification bulge */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5),inset_0_0_8px_rgba(100,206,251,0.3)]"
            style={{ transform: "scale(1.15)", transformOrigin: "center center" }}
          >
            {/* Text at the same font size as base, perfectly aligned via brightTextX */}
            <motion.div
              className="absolute whitespace-nowrap"
              style={{
                x: brightTextX,
                y: brightTextY,
                top: -lensTop,
                left: 0,
              }}
            >
              {/* Chromatic aberration layers */}
              <h1
                className="absolute text-6xl md:text-8xl font-bold tracking-tight text-red-500/50 mix-blend-screen whitespace-nowrap py-2"
                style={{ transform: "translate(-3px, 2px)" }}
              >{scrambledText}</h1>
              <h1
                className="absolute text-6xl md:text-8xl font-bold tracking-tight text-cyan-400/50 mix-blend-screen whitespace-nowrap py-2"
                style={{ transform: "translate(3px, -2px)" }}
              >{scrambledText}</h1>
              <h1
                className="relative text-6xl md:text-8xl font-bold tracking-tight text-white whitespace-nowrap py-2"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(100,206,251,0.9)) drop-shadow(0 0 30px rgba(100,206,251,0.4))",
                }}
              >
                {scrambledText}
              </h1>
            </motion.div>

            {/* Radial lens distortion — dark vignette at edges */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)",
                mixBlendMode: "overlay"
              }}
            />

            {/* High-tech Forensic Inner View Overlay */}
            {/* 1. Radar Grid */}
            <div 
              className="absolute inset-0 rounded-full border border-cyan-400/20 scale-[0.92]" 
              style={{ backgroundImage: 'linear-gradient(rgba(100, 206, 251, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 206, 251, 0.1) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            />
            {/* 2. Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-full h-[1px] bg-cyan-400/50" />
              <div className="absolute h-full w-[1px] bg-cyan-400/50" />
              {/* Center target ring */}
              <div className="absolute w-8 h-8 rounded-full border border-cyan-400/60" />
            </div>
            {/* 3. Animated Forensic Scanline */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-[2px] bg-cyan-300 shadow-[0_0_8px_2px_rgba(100,206,251,0.6)]"
              animate={{ y: [0, 144, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

      {/* Magnifying Glass visual overlay */}
      {containerWidth > 0 && (
        <motion.div
          className="absolute left-0 pointer-events-none"
          style={{
            x: glassX,
            y: glassY,
            rotateZ: glassRotate,
            originX: `${54 * SCALE}px`,
            originY: `${54 * SCALE}px`,
            top: lensTop - (6 * SCALE),
            width: 108 * SCALE,
            height: 170 * SCALE,
            marginLeft: -6 * SCALE,
          }}
        >
          {/* SVG with proper 1:1 aspect ratio to match the clip path */}
          <svg
            viewBox="0 0 108 170"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))" }}
          >
            <defs>
              {/* Metallic chrome rim */}
              <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#888888" />
                <stop offset="25%" stopColor="#e8e8e8" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="75%" stopColor="#a0a0a0" />
                <stop offset="100%" stopColor="#444444" />
              </linearGradient>

              <linearGradient id="chromeInner" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#444444" />
                <stop offset="50%" stopColor="#dddddd" />
                <stop offset="100%" stopColor="#666666" />
              </linearGradient>

              {/* Dark wood base */}
              <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2a160b" />
                <stop offset="20%" stopColor="#4a2a16" />
                <stop offset="50%" stopColor="#683d22" />
                <stop offset="80%" stopColor="#4a2a16" />
                <stop offset="100%" stopColor="#2a160b" />
              </linearGradient>

              {/* Brass rivet gradient */}
              <radialGradient id="brassRivet" cx="0.4" cy="0.4" r="0.6">
                <stop offset="0%" stopColor="#fff2a8" />
                <stop offset="50%" stopColor="#d4a854" />
                <stop offset="100%" stopColor="#7a5c20" />
              </radialGradient>

              {/* Wood lacquer shine */}
              <linearGradient id="woodShine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="25%" stopColor="rgba(200,160,100,0.15)" />
                <stop offset="45%" stopColor="rgba(240,200,140,0.35)" />
                <stop offset="55%" stopColor="rgba(240,200,140,0.35)" />
                <stop offset="75%" stopColor="rgba(200,160,100,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* Wood grain pattern */}
              <pattern id="grain" x="0" y="0" width="4" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(30,15,5,0.2)" strokeWidth="0.4" />
                <line x1="2" y1="0" x2="2" y2="6" stroke="rgba(90,60,30,0.1)" strokeWidth="0.3" />
              </pattern>

              {/* Glass fill with subtle cyan */}
              <radialGradient id="glass" cx="0.4" cy="0.3" r="0.6">
                <stop offset="0%" stopColor="rgba(200,240,255,0.15)" />
                <stop offset="50%" stopColor="rgba(100,206,251,0.05)" />
                <stop offset="100%" stopColor="rgba(0,50,100,0.15)" />
              </radialGradient>
            </defs>

            {/* === LENS BEZEL (Ultra Detailed) === */}
            {/* Outer metallic ring (thick base) */}
            <circle cx="54" cy="54" r="50" stroke="url(#chrome)" strokeWidth="7" fill="none" />
            
            {/* Concentric stepped rings (camera lens style) */}
            <circle cx="54" cy="54" r="48" stroke="rgba(0,0,0,0.6)" strokeWidth="0.5" fill="none" />
            <circle cx="54" cy="54" r="47.2" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" fill="none" />
            
            {/* Inner bevel ring (catches reverse light) */}
            <circle cx="54" cy="54" r="46.5" stroke="url(#chromeInner)" strokeWidth="2" fill="none" />
            <circle cx="54" cy="54" r="45.5" stroke="rgba(0,0,0,0.8)" strokeWidth="0.5" fill="none" />

            {/* === GLASS LENS === */}
            {/* Glass body */}
            <circle cx="54" cy="54" r="45" fill="url(#glass)" />

            {/* Inner shadow and Caustics (chromatic edge refraction) */}
            <circle cx="54" cy="54" r="45" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="2.5" />
            <circle cx="54" cy="54" r="44.2" fill="none" stroke="rgba(100,206,251,0.2)" strokeWidth="1" />
            <circle cx="54" cy="54" r="43.5" fill="none" stroke="rgba(255,50,50,0.1)" strokeWidth="0.5" />

            {/* Main reflection — sweeping dynamic arc */}
            <motion.g style={{ rotate: reflectionRotate, transformOrigin: "54px 54px" }}>
              <ellipse cx="38" cy="34" rx="22" ry="12" fill="url(#refl)" transform="rotate(-25 38 34)" />
              <path d="M 18 36 A 40 40 0 0 1 68 12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 22 34 A 38 38 0 0 1 64 14" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Secondary bottom bounce-light reflection */}
              <ellipse cx="70" cy="74" rx="10" ry="5" fill="url(#refl)" transform="rotate(-25 70 74)" style={{ opacity: 0.3 }} />
              
              {/* Ultra-detailed dust specks & micro-scratches on glass surface */}
              <g opacity="0.15" fill="#ffffff">
                <circle cx="30" cy="40" r="0.5" />
                <circle cx="45" cy="25" r="0.8" opacity="0.6" />
                <circle cx="65" cy="60" r="0.4" />
                <circle cx="40" cy="70" r="1" opacity="0.4" />
                <circle cx="55" cy="50" r="0.3" />
                <path d="M 35 60 L 38 62" stroke="#ffffff" strokeWidth="0.3" />
                <path d="M 60 30 L 61 28" stroke="#ffffff" strokeWidth="0.2" />
              </g>
            </motion.g>

            {/* === FERRULE (metal band connecting lens to handle) === */}
            {/* Main ferrule body with knurled grips */}
            <rect x="44" y="103" width="20" height="12" rx="2" fill="url(#chrome)" stroke="rgba(40,40,40,0.8)" strokeWidth="1" />
            <line x1="44" y1="105" x2="64" y2="105" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
            <line x1="44" y1="107" x2="64" y2="107" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
            <line x1="44" y1="109" x2="64" y2="109" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
            <line x1="44" y1="111" x2="64" y2="111" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
            <line x1="44" y1="113" x2="64" y2="113" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
            
            {/* High-contrast Ferrule highlights and shadows */}
            <line x1="46" y1="104" x2="46" y2="114" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" />
            <line x1="50" y1="104" x2="50" y2="114" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" />
            <line x1="62" y1="104" x2="62" y2="114" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />

            {/* === WOODEN HANDLE === */}
            <path
              d="M 46 115 L 46 160 C 46 165, 48 168, 54 168 C 60 168, 62 165, 62 160 L 62 115 Z"
              fill="url(#wood)"
              stroke="rgba(20,10,5,0.8)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            
            {/* Deep wood grain lines */}
            <path d="M 49 116 C 49 130, 48 145, 49 162" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
            <path d="M 52 116 C 53 130, 51 150, 52 164" stroke="rgba(0,0,0,0.4)" strokeWidth="1" fill="none" />
            <path d="M 56 116 C 55 130, 57 145, 56 164" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" fill="none" />
            <path d="M 59 116 C 60 135, 59 150, 59 162" stroke="rgba(0,0,0,0.2)" strokeWidth="0.6" fill="none" />

            {/* Polished lacquer shine */}
            <line x1="51" y1="116" x2="51" y2="164" stroke="rgba(255,200,150,0.2)" strokeWidth="3" strokeLinecap="round" />
            <line x1="53.5" y1="116" x2="53.5" y2="166" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Edge shadows for intense 3D roundness */}
            <line x1="47" y1="115" x2="47" y2="161" stroke="rgba(0,0,0,0.6)" strokeWidth="2" />
            <line x1="61" y1="115" x2="61" y2="161" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />

            {/* Brass rivets holding the handle to the tang with specular glints */}
            <circle cx="54" cy="125" r="2.5" fill="url(#brassRivet)" stroke="rgba(0,0,0,0.8)" strokeWidth="0.5" />
            <circle cx="53.5" cy="124.5" r="0.8" fill="#ffffff" opacity="0.6" />
            <circle cx="54" cy="145" r="2.5" fill="url(#brassRivet)" stroke="rgba(0,0,0,0.8)" strokeWidth="0.5" />
            <circle cx="53.5" cy="144.5" r="0.8" fill="#ffffff" opacity="0.6" />

            {/* Solid Brass Pommel (Handle end cap) */}
            <path
              d="M 45 160 C 45 167, 48 170, 54 170 C 60 170, 63 167, 63 160 Z"
              fill="url(#brassRivet)"
              stroke="rgba(0,0,0,0.8)"
              strokeWidth="1"
            />
            {/* Pommel reflections */}
            <path d="M 48 162 C 48 165, 49 167, 51 168" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 59 162 C 59 165, 58 167, 56 168" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
