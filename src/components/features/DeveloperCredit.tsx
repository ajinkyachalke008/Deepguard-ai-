'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DeveloperCredit() {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ 
              opacity: [0.75, 0.85, 0.75],
              y: 0
            }}
            transition={{
              opacity: {
                delay: 0.7,
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              },
              y: {
                delay: 0.7,
                duration: 0.4,
                ease: "easeOut"
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default select-none group relative transition-all duration-200"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-300" />
            <span className="text-[11px] font-medium tracking-wide text-neutral-400/80 group-hover:text-neutral-200 transition-colors duration-200 uppercase">
              Built by Ajinkya Arun Chalke
            </span>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyan-500/30 group-hover:w-3/4 transition-all duration-300" />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-[#050A0F]/90 border-white/10 backdrop-blur-xl text-xs px-3 py-2 shadow-2xl">
          <p className="text-cyan-100/70 font-medium">Independent developer & system architect</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
