import {
  isPokemonType,
  TYPE_ICONS,
  TYPE_HEX,
  TYPE_LABELS,
} from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function TypeBadge({
  type,
  size = "md",
  showIcon = true,
  className,
}: TypeBadgeProps) {
  const key = type.toLowerCase();
  const hex = isPokemonType(key) ? TYPE_HEX[key] : "#a89b8c";
  const label = isPokemonType(key) ? TYPE_LABELS[key] : type;
  const icon = isPokemonType(key) ? TYPE_ICONS[key] : "◉";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-xs",
        size === "lg" && "px-3.5 py-1.5 text-sm",
        className,
      )}
      style={{
        color: hex,
        backgroundColor: `color-mix(in srgb, ${hex} 14%, transparent)`,
        borderColor: `color-mix(in srgb, ${hex} 38%, transparent)`,
      }}
    >
      {showIcon && <span aria-hidden="true">{icon}</span>}
      {label}
    </span>
  );
}

export function TypeDot({ type, className }: { type: string; className?: string }) {
  const key = type.toLowerCase();
  const hex = isPokemonType(key) ? TYPE_HEX[key] : "#a89b8c";
  return (
    <span
      title={isPokemonType(key) ? TYPE_LABELS[key] : type}
      className={cn("size-2.5 rounded-full", className)}
      style={{ backgroundColor: hex }}
    />
  );
}
