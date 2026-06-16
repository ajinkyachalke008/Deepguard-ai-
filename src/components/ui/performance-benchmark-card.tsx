'use client';

import * as React from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { Activity, Share2, Copy, BarChartHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";

// Type definitions for the component props
interface Competitor {
  name: string;
  value: number;
  icon: React.ReactNode;
}

interface PerformanceLevel {
  label: string;
  value: number;
  color: string;
}

export interface PerformanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  headerIcon: React.ReactNode;
  mainValue: number;
  percentageChange: number;
  benchmarkAverage: number;
  competitors: Competitor[];
  performanceLevels: PerformanceLevel[];
}

// Animated number component
const AnimatedNumber = ({ value }: { value: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

// Main PerformanceCard component
export const PerformanceBenchmarkCard = React.forwardRef<
  HTMLDivElement,
  PerformanceCardProps
>(
  (
    {
      className,
      title,
      headerIcon,
      mainValue,
      percentageChange,
      benchmarkAverage,
      competitors,
      performanceLevels,
      ...props
    },
    ref
  ) => {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { once: true, margin: "-100px" });
    const maxValue = Math.max(
      mainValue,
      benchmarkAverage,
      ...competitors.map((c) => c.value)
    );
    const totalLevelValue = performanceLevels[performanceLevels.length - 1].value;

    return (
      <SpotlightCard
        ref={cardRef}
        className={cn("w-full h-full p-6", className)}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-primary/10 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-2 text-sm font-black font-mono text-primary uppercase tracking-[0.2em]">
            {headerIcon}
            <span>{title}</span>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            LIVE TELEMETRY
          </Badge>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Main Metric Section */}
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-5xl font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <AnimatedNumber value={mainValue} />
                <span className="text-lg text-muted-foreground ml-1">TPS</span>
              </p>
              <p
                className={cn(
                  "text-xs font-mono mt-1",
                  percentageChange > 0
                    ? "text-forensic-green"
                    : "text-forensic-red"
                )}
              >
                {percentageChange > 0 ? "▲" : "▼"} {Math.abs(percentageChange)}% vs standard CNN
              </p>
            </div>
            <div className="flex-1 max-w-[200px]">
              <div className="relative h-2 rounded-full bg-black/40 border border-white/5 overflow-visible">
                <motion.div
                  className="absolute h-full rounded-full bg-primary shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                  initial={{ width: 0 }}
                  animate={{ width: isInView ? `${(mainValue / maxValue) * 100}%` : 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                {/* Benchmark Line */}
                <motion.div
                  className="absolute -translate-y-1/2 top-1/2 z-20"
                  style={{
                    left: `${(benchmarkAverage / maxValue) * 100}%`,
                    width: '2px',
                    height: '24px',
                    backgroundColor: '#eab308', // Yellow benchmark
                    boxShadow: '0 0 10px rgba(234,179,8,0.5)',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: isInView ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                />
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-mono text-muted-foreground">
                <span>Ind. Average</span>
                <span className="text-yellow-500">{benchmarkAverage.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Competitors Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-2">Analysis Engines</h3>
            {competitors.map((competitor, i) => (
              <div key={competitor.name} className="flex items-center gap-3">
                <div className="text-primary/70">{competitor.icon}</div>
                <span className="flex-1 text-sm font-medium text-gray-300">{competitor.name}</span>
                <span className="text-sm font-mono text-white">
                  {competitor.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Performance Levels Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <BarChartHorizontal className="w-4 h-4" />
              <span>Throughput Tiers</span>
            </h3>
            <div className="relative flex w-full h-3 rounded-full overflow-hidden border border-white/10">
              {performanceLevels.map((level, i) => {
                  const prevValue = i > 0 ? performanceLevels[i-1].value : 0;
                  const width = ((level.value - prevValue) / totalLevelValue) * 100;
                  return (
                    <div
                      key={level.label}
                      className={cn("h-full", level.color)}
                      style={{ width: `${width}%`}}
                    />
                  );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              {performanceLevels.map((level) => (
                <span key={level.label}>{level.label}</span>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs">
              <Share2 className="w-3 h-3 mr-2" />
              Export Metrics
            </Button>
            <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs">
              <Copy className="w-3 h-3 mr-2" />
              Copy Data
            </Button>
          </div>
        </div>
      </SpotlightCard>
    );
  }
);

PerformanceBenchmarkCard.displayName = "PerformanceBenchmarkCard";

// Fallback Badge if not imported from global UI
function Badge({ children, className, variant }: any) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  )
}
