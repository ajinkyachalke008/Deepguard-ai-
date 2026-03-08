## Project Summary
DeepGuard AI is a forensic intelligence platform designed to detect deepfakes and AI-generated media with high certainty. It provides frame-by-frame analysis, multi-signal verification (GAN artifacts, spectral anomalies, etc.), and explainable forensic reports. The system is built for truth and transparency, catering to research labs and forensic investigators.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS 4, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Icons**: Lucide React
- **Analysis**: ExifReader (metadata extraction), Custom heuristic AI logic

## Architecture
- **App Directory**: `src/app/` contains all pages and API routes.
- **Components**: 
  - `src/components/ui/`: Reusable Radix-based UI components.
  - `src/components/features/`: Feature-specific logic (analysis, visualization).
  - `src/components/features/advanced-forensics/`: High-end forensic UI elements.
- **APIs**: Standardized JSON response format for analysis and verification.
- **Lib**: `src/lib/` for shared utilities and hooks.

## User Preferences
- **Theme**: Dark forensic UI (near-black, deep blue, cyan highlights).
- **Tone**: Professional, authoritative, understated, research-lab style.
- **Motion**: Calm, intelligent, progressive reveals. Avoid flashy/game-like animations.
- **Components**: Functional components, Lucide icons, Shadcn-like structure.

## Project Guidelines
- **Forensic Honesty**: Analysis results must be consistent and deterministic (seeded logic).
- **Responsive Design**: Mobile-first, but optimized for high-density data on desktop.
- **Performance**: Use Turbopack for development, optimize client-side animations with Framer Motion.
- **Developer Credit**: Maintain "Built by Ajinkya Arun Chalke" in the navbar as an understated research lab credit.

## Common Patterns
- **Glassmorphism**: Use `.glass` utility for cards and panels.
- **Progression**: Use `AnimatePresence` for state-driven UI reveals.
- **Safety**: Calm uncertainty states (Feature F) over alarmist red flashes.
