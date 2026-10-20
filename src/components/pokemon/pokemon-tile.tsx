import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import type { DexEntry } from "@/lib/hooks";
import { SPRITE_THUMB } from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";
import { TypeDot, TypeBadge } from "@/components/shared/type-badge";

export function formatName(name: string) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PokemonTile({
  entry,
  className,
  showTypes = true,
}: {
  entry: Pick<DexEntry, "id" | "name" | "types" | "tier">;
  className?: string;
  showTypes?: boolean;
}) {
  return (
    <Link
      to={`/pokemon/${entry.name}`}
      className={cn(
        "group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border/80 bg-card px-3 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgba(120,70,30,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute top-2.5 left-3 text-[10px] font-semibold tracking-wider text-muted-foreground/70 tabular-nums">
        #{String(entry.id).padStart(3, "0")}
      </span>
      {entry.tier && (
        <span className="absolute top-2.5 right-3 rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-muted-foreground uppercase">
          {entry.tier}
        </span>
      )}
      <motion.img
        src={SPRITE_THUMB(entry.id)}
        alt={formatName(entry.name)}
        loading="lazy"
        width={96}
        height={96}
        className="relative z-10 size-20 object-contain drop-shadow-[0_10px_12px_rgba(80,45,20,0.18)] transition-transform duration-300 group-hover:scale-110"
        whileTap={{ scale: 0.94 }}
      />
      <span className="relative z-10 font-display text-sm font-semibold capitalize">
        {formatName(entry.name)}
      </span>
      {showTypes && entry.types.length > 0 && (
        <span className="relative z-10 flex flex-wrap items-center justify-center gap-1">
          {entry.types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" showIcon={false} />
          ))}
        </span>
      )}
    </Link>
  );
}

export function PokemonTypeDots({ types }: { types: string[] }) {
  return (
    <span className="flex items-center gap-1">
      {types.map((type) => (
        <TypeDot key={type} type={type} />
      ))}
    </span>
  );
}
