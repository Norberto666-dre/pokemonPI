import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";

import { TypeBadge } from "@/components/shared/type-badge";
import { defensiveProfile, type TypeRelationsMap } from "@/lib/hooks";
import { TYPE_LABELS, TYPE_ICONS } from "@/lib/pokemon-types";

export function TypeEffectiveness({
  types,
  relations,
}: {
  types: string[];
  relations: TypeRelationsMap;
}) {
  const { weak, resist, immune } = defensiveProfile(relations, types);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-destructive uppercase">
          <ShieldAlert className="size-3.5" /> Débil a
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {weak.length === 0 && (
            <span className="text-xs text-muted-foreground">Sin debilidades</span>
          )}
          {weak.map(({ type, multiplier }) => (
            <span key={type} className="relative">
              <TypeBadge type={type} size="sm" />
              {multiplier !== 2 && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive px-1 text-[8px] font-bold text-destructive-foreground">
                  {multiplier}×
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-success uppercase">
          <ShieldCheck className="size-3.5" /> Resiste
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {resist.length === 0 && (
            <span className="text-xs text-muted-foreground">Sin resistencias</span>
          )}
          {resist.map(({ type, multiplier }) => (
            <span key={type} className="relative">
              <TypeBadge type={type} size="sm" />
              {multiplier !== 0.5 && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-success px-1 text-[8px] font-bold text-white">
                  {multiplier}×
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          <ShieldOff className="size-3.5" /> Inmune a
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {immune.length === 0 && (
            <span className="text-xs text-muted-foreground">Sin inmunidades</span>
          )}
          {immune.map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TypeLabelOnly({ type }: { type: string }) {
  const label = TYPE_LABELS[type as keyof typeof TYPE_LABELS] ?? type;
  const icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] ?? "◉";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
