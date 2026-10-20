import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Sparkles } from "lucide-react";

import { formatName } from "@/components/pokemon/pokemon-tile";
import { TypeBadge } from "@/components/shared/type-badge";
import { PageHeader } from "@/components/shared/states";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pokeapi, type Ability, type ResourceList } from "@/lib/api/pokeapi";

function AbilityDialog({ ability, onClose }: { ability: string | null; onClose: () => void }) {
  const { data, isPending } = useQuery({
    queryKey: ["ability-detail", ability],
    queryFn: () => pokeapi<Ability>(`/ability/${ability}`),
    enabled: Boolean(ability),
    staleTime: Infinity,
  });

  const effect =
    data?.effect_entries.find((entry) => entry.language.name === "es")?.effect ??
    data?.effect_entries.find((entry) => entry.language.name === "en")?.effect ??
    null;
  const shortEffect =
    data?.effect_entries.find((entry) => entry.language.name === "es")?.short_effect ??
    data?.effect_entries.find((entry) => entry.language.name === "en")?.short_effect ??
    null;
  const flavor =
    data?.flavor_text_entries.find((entry) => entry.language.name === "es")?.flavor_text ??
    null;

  return (
    <Dialog open={Boolean(ability)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {ability ? formatName(ability) : ""}
          </DialogTitle>
          <DialogDescription>
            {data ? `Generación ${data.generation.name.replace("generation-", "").toUpperCase()}` : "Detalle de la habilidad"}
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {shortEffect && (
              <p className="rounded-xl bg-accent/60 p-3 text-sm font-medium text-accent-foreground">
                {shortEffect}
              </p>
            )}
            {flavor && (
              <p className="text-xs text-muted-foreground italic">{flavor.replace(/\f/g, " ")}</p>
            )}
            {effect && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {effect.replace(/\f/g, " ")}
              </p>
            )}
            <div>
              <h3 className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Pokémon con esta habilidad ({data.pokemon.length})
              </h3>
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {data.pokemon.slice(0, 40).map((entry) => (
                  <Link
                    key={entry.pokemon.name}
                    to={`/pokemon/${entry.pokemon.name}`}
                    onClick={onClose}
                    className="rounded-full border border-border px-2 py-0.5 text-[11px] transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {formatName(entry.pokemon.name)}
                    {entry.is_hidden && (
                      <span className="ml-1 text-[9px] text-primary">oculta</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pudimos cargar la habilidad.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AbilitiesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { data, isPending } = useQuery({
    queryKey: ["abilities"],
    queryFn: () => pokeapi<ResourceList>("/ability?limit=400"),
    staleTime: Infinity,
  });

  const list = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return (data?.results ?? []).filter((entry) => (term ? entry.name.includes(term) : true));
  }, [data, deferredSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guía"
        title="Habilidades"
        description="Efectos pasivos que pueden cambiar el rumbo de un combate. Toca una habilidad para leer su efecto y ver qué Pokémon la poseen."
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-52 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm sm:max-w-xs">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar habilidad…"
            className="w-full bg-transparent outline-none"
          />
        </label>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          {list.length} habilidades
        </span>
      </div>

      {isPending ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((entry) => (
            <button
              key={entry.name}
              type="button"
              onClick={() => setSelected(entry.name)}
              className="group rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-14px_rgba(0,0,0,0.35)]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-primary" />
                <span className="truncate text-xs font-semibold group-hover:text-primary">
                  {formatName(entry.name)}
                </span>
              </span>
              <span className="mt-1 block text-[10px] text-muted-foreground">
                Ver efecto completo
              </span>
            </button>
          ))}
        </div>
      )}

      {!isPending && list.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No encontramos habilidades con ese nombre.
        </p>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <TypeBadge type="normal" size="sm" />
          <h2 className="font-display text-lg font-semibold">¿Sabías que…?</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Las habilidades ocultas solo aparecen en Pokémon obtenidos mediante métodos
          especiales. En el detalle de cada Pokémon verás cuáles son normales y cuáles
          ocultas.
        </p>
      </section>

      <AbilityDialog ability={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
