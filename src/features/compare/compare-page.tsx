import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Plus, Search, Trash2, X } from "lucide-react";

import { formatName } from "@/components/pokemon/pokemon-tile";
import { PageHeader } from "@/components/shared/states";
import { TypeBadge } from "@/components/shared/type-badge";
import { useCompareStore } from "@/stores/compare";
import { useDexIndex, useShowdownPokedex, useTypeRelations, defensiveProfile } from "@/lib/hooks";
import { showdownId, statTotal } from "@/lib/api/showdown";
import { SPRITE_ARTWORK, STAT_LABELS, STAT_ORDER } from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";

export function ComparePage() {
  const { compare, toggle, remove, clear } = useCompareStore();
  const [search, setSearch] = useState("");
  const { data: dex } = useDexIndex();
  const { data: sd } = useShowdownPokedex();
  const { data: relations } = useTypeRelations();

  const entries = useMemo(
    () => compare.map((name) => dex?.find((entry) => entry.name === name)).filter(Boolean),
    [compare, dex],
  );

  const suggestions = useMemo(() => {
    if (!dex || !search.trim()) return [];
    const term = search.trim().toLowerCase();
    return dex
      .filter((entry) => entry.name.includes(term) && !compare.includes(entry.name))
      .slice(0, 8);
  }, [dex, search, compare]);

  const bestByStat = useMemo(() => {
    const best: Record<string, number> = {};
    for (const stat of STAT_ORDER) {
      let max = -1;
      let winner = -1;
      entries.forEach((entry, index) => {
        const value = entry?.stats?.[stat] ?? 0;
        if (value > max) {
          max = value;
          winner = index;
        }
      });
      best[stat] = winner;
    }
    return best;
  }, [entries]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Herramientas"
        title="Comparador"
        description="Enfrenta hasta tres Pokémon lado a lado: estadísticas, tipos, habilidades y debilidades."
      >
        {compare.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Limpiar
          </button>
        )}
      </PageHeader>

      {compare.length < 3 && (
        <div className="relative">
          <label className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Añadir Pokémon al comparador…"
              className="w-full bg-transparent outline-none"
            />
            <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
              {compare.length}/3
            </span>
          </label>
          {suggestions.length > 0 && (
            <div className="absolute inset-x-0 top-14 z-20 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-xl">
              {suggestions.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    toggle(entry.name);
                    setSearch("");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-secondary"
                >
                  <img
                    src={SPRITE_ARTWORK(entry.id)}
                    alt=""
                    className="size-8 object-contain"
                    loading="lazy"
                  />
                  <span className="flex-1 truncate font-medium">{formatName(entry.name)}</span>
                  <span className="flex gap-1">
                    {entry.types.map((type) => (
                      <TypeBadge key={type} type={type} size="sm" showIcon={false} />
                    ))}
                  </span>
                  <Plus className="size-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
          <p className="font-display text-xl font-semibold">Aún no hay rivales</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Busca arriba o usa el botón de comparar en la ficha de cualquier Pokémon.
          </p>
        </div>
      ) : (
        <>
          <section
            className={cn(
              "grid gap-4",
              entries.length === 1
                ? "sm:grid-cols-1"
                : entries.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3",
            )}
          >
            {entries.map((entry) => {
              if (!entry) return null;
              const sdEntry = sd?.[showdownId(entry.name)];
              const total = entry.stats ? statTotal(entry.stats) : 0;
              return (
                <div
                  key={entry.name}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-4"
                >
                  <button
                    type="button"
                    onClick={() => remove(entry.name)}
                    className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Quitar del comparador"
                  >
                    <X className="size-3.5" />
                  </button>
                  <img
                    src={SPRITE_ARTWORK(entry.id)}
                    alt={formatName(entry.name)}
                    className="mx-auto size-36 object-contain drop-shadow-[0_14px_20px_rgba(120,70,30,0.2)]"
                  />
                  <Link
                    to={`/pokemon/${entry.name}`}
                    className="mt-1 block text-center font-display text-xl font-semibold hover:text-primary"
                  >
                    {formatName(entry.name)}
                  </Link>
                  <div className="mt-2 flex justify-center gap-1.5">
                    {entry.types.map((type) => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-secondary/60 p-2">
                      <dt className="text-[10px] text-muted-foreground uppercase">Total</dt>
                      <dd className="font-display text-lg font-semibold">{total}</dd>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2">
                      <dt className="text-[10px] text-muted-foreground uppercase">Tier</dt>
                      <dd className="font-display text-lg font-semibold">{entry.tier ?? "—"}</dd>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2">
                      <dt className="text-[10px] text-muted-foreground uppercase">Altura</dt>
                      <dd className="font-semibold">{sdEntry?.heightm ?? "—"} m</dd>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-2">
                      <dt className="text-[10px] text-muted-foreground uppercase">Peso</dt>
                      <dd className="font-semibold">{sdEntry?.weightkg ?? "—"} kg</dd>
                    </div>
                  </dl>
                  {sdEntry?.abilities && (
                    <p className="mt-3 text-center text-[11px] text-muted-foreground">
                      {Object.values(sdEntry.abilities).map(formatName).join(" · ")}
                    </p>
                  )}
                </div>
              );
            })}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-xl font-semibold">Estadísticas base</h2>
            <div className="mt-4 space-y-3">
              {STAT_ORDER.map((stat) => (
                <div key={stat} className="grid items-center gap-2 sm:grid-cols-[110px_1fr]">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {STAT_LABELS[stat]}
                  </span>
                  <div className="space-y-1.5">
                    {entries.map((entry, index) => {
                      if (!entry) return null;
                      const value = entry.stats?.[stat] ?? 0;
                      return (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                bestByStat[stat] === index ? "bg-primary" : "bg-primary/35",
                              )}
                              style={{ width: `${Math.min(100, (value / 255) * 100)}%` }}
                            />
                          </div>
                          <span className="w-16 shrink-0 truncate text-[10px] font-medium text-muted-foreground">
                            {formatName(entry.name)}
                          </span>
                          <span className="w-8 text-right text-xs font-bold tabular-nums">
                            {value}
                          </span>
                          {bestByStat[stat] === index && (
                            <Crown className="size-3.5 text-amber-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => {
              if (!entry || !relations) return null;
              const profile = defensiveProfile(relations, entry.types);
              return (
                <div key={entry.name} className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="font-display text-base font-semibold">
                    {formatName(entry.name)}
                  </h3>
                  <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Perfil defensivo
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {profile.weak.map((weak) => (
                      <span key={weak.type} className="relative">
                        <TypeBadge type={weak.type} size="sm" />
                        <span className="absolute -top-1 -right-1 rounded-full bg-destructive px-1 text-[8px] font-bold text-white">
                          {weak.multiplier}×
                        </span>
                      </span>
                    ))}
                    {profile.weak.length === 0 && (
                      <span className="text-xs text-muted-foreground">Sin debilidades</span>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Resistencias · {profile.resist.length} · Inmunidades · {profile.immune.length}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {profile.immune.map((type) => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                    {profile.resist.map((resist) => (
                      <TypeBadge key={resist.type} type={resist.type} size="sm" />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
