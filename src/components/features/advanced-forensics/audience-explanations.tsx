'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquareText, 
  ChevronDown, 
  UserCircle, 
  Wrench, 
  Scale 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudienceExplanationsProps {
  explanations: Record<string, string>;
}

export function AudienceExplanations({ explanations }: AudienceExplanationsProps) {
  const [selectedAudience, setSelectedAudience] = useState('General');

  const audiences = [
    { id: 'General', label: 'General Public', icon: <UserCircle className="w-3.5 h-3.5" /> },
    { id: 'Journalist', label: 'Investigative Journalist', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'Legal', label: 'Legal Counsel', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'Research', label: 'Forensic Researcher', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <Card className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Audience Context
        </h3>
        <Badge variant="outline" className="text-[10px] uppercase font-mono border-white/10">
          Smart Explanation Engine
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">Explain to:</span>
        <Select value={selectedAudience} onValueChange={setSelectedAudience}>
          <SelectTrigger className="h-8 glass border-white/10 rounded-xl text-[11px] focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass border-white/10 rounded-xl overflow-hidden">
            {audiences.map((aud) => (
              <SelectItem key={aud.id} value={aud.id} className="text-[11px] focus:bg-primary/10 focus:text-primary">
                <div className="flex items-center gap-2">
                  {aud.icon}
                  {aud.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative min-h-[80px] p-4 rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
        <div className="absolute top-2 right-2 opacity-10">
          <MessageSquareText className="w-12 h-12" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedAudience}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-muted-foreground leading-relaxed relative z-10"
          >
            {explanations[selectedAudience]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-muted-foreground/50 italic leading-tight">
        Explanations are contextually re-worded for clarity without altering the underlying forensic data.
      </p>
    </Card>
  );
}
