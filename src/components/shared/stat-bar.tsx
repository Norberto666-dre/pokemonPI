import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  tone?: "warm" | "cool";
  className?: string;
  compact?: boolean;
}

function barColor(value: number) {
  if (value < 40) return "#c98a6a";
  if (value < 65) return "#d99a45";
  if (value < 90) return "#d96a35";
  if (value < 120) return "#6fae5e";
  return "#4f9d69";
}

export function StatBar({
  label,
  value,
  max = 150,
  className,
  compact,
}: StatBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={cn(
            "font-medium text-muted-foreground",
            compact ? "text-[11px]" : "text-xs",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "font-display font-semibold tabular-nums",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor(value) }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
