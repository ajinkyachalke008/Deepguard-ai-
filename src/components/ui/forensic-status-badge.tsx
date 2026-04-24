"use client"

import React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, AlertTriangle, Search, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrambleText } from "./scramble-text"

interface ForensicStatusBadgeProps {
  status: "scanning" | "verified" | "uncertain" | "anomaly"
  className?: string
}

export function ForensicStatusBadge({ status, className }: ForensicStatusBadgeProps) {
  const config = {
    scanning: {
      color: "text-forensic-cyan",
      bg: "bg-forensic-cyan/10",
      border: "border-forensic-cyan/30",
      icon: <Activity className="w-3 h-3" />,
      label: "DATA_STREAM_ACTIVE",
      accent: "bg-forensic-cyan",
    },
    verified: {
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/30",
      icon: <ShieldCheck className="w-3 h-3" />,
      label: "SIGNATURE_VERIFIED",
      accent: "bg-emerald-400",
    },
    uncertain: {
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/30",
      icon: <Search className="w-3 h-3" />,
      label: "SIGNAL_DEGRADED",
      accent: "bg-yellow-400",
    },
    anomaly: {
      color: "text-forensic-red",
      bg: "bg-forensic-red/10",
      border: "border-forensic-red/30",
      icon: <AlertTriangle className="w-3 h-3" />,
      label: "ANOMALY_CONFIRMED",
      accent: "bg-forensic-red",
    },
  }[status]

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 px-4 py-1.5 rounded-sm border font-mono text-[9px] uppercase tracking-[0.2em] transition-all duration-500 group overflow-hidden glass",
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      {/* Tactical Corner Brackets */}
      <div className={cn("absolute top-0 left-0 w-1 h-1 border-t border-l border-current opacity-60")} />
      <div className={cn("absolute top-0 right-0 w-1 h-1 border-t border-r border-current opacity-60")} />
      <div className={cn("absolute bottom-0 left-0 w-1 h-1 border-b border-l border-current opacity-60")} />
      <div className={cn("absolute bottom-0 right-0 w-1 h-1 border-b border-r border-current opacity-60")} />

      {/* Internal Grid Substrate */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '4px 4px' }} />

      {/* Moving Scanline */}
      <motion.div
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-20"
      />

      {/* Status Icon with pulsating glow */}
      <div className="relative">
        <motion.div 
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn("absolute inset-0 blur-sm rounded-full", config.accent)} 
        />
        <span className="relative z-10">{config.icon}</span>
      </div>

      <span className="relative z-10 font-bold whitespace-nowrap">
        <ScrambleText 
          text={config.label} 
          duration={1000} 
          scrambleSpeed={25}
        />
      </span>

      {/* Dynamic Data Blip */}
      <motion.div 
        animate={{ x: [0, 4, 0], opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className={cn("w-1 h-1 rounded-full", config.accent)}
      />
    </div>
  )
}
