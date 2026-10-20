import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Loader2, MapPin, Search } from "lucide-react";

import { formatName, PokemonTile } from "@/components/pokemon/pokemon-tile";
import { PageHeader } from "@/components/shared/states";
import { TypeBadge } from "@/components/shared/type-badge";
import { pokeapi, idFromUrl, type Generation } from "@/lib/api/pokeapi";
import { useDexIndex } from "@/lib/hooks";
import { GENERATIONS, generationOf, SPRITE_ARTWORK } from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";

export function GenerationsPage() {
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Guía"
        title="Generaciones"
        description="Un recorrido por las nueve generaciones: regiones, juegos y los Pokémon que las vieron nacer."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GENERATIONS.map((gen) => (
          <Link
            key={gen.id}
            to={`/generations/${gen.id}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.4)]"
          >
            <div
              className="absolute -top-10 -right-10 size-36 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
              style={{
                background: `hsl(${(gen.id * 40) % 360} 55% 55%)`,
              }}
            />
            <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
              {gen.region}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{gen.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pokédex nacional #{gen.range[0]} – #{gen.range[1]} ·{" "}
              {gen.range[1] - gen.range[0] + 1} especies
            </p>
            <div className="mt-4 flex items-center gap-3">
              {[gen.range[0], gen.range[0] + 1, gen.range[0] + 2].map((id) => (
                <img
                  key={id}
                  src={SPRITE_ARTWORK(id)}
                  alt=""
                  loading="lazy"
                  className="size-14 object-contain drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
                />
              ))}
              <ArrowUpRight className="ml-auto size-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function GenerationDetailPage() {
  const { id } = useParams();
  const generationId = Number(id);
  const [search, setSearch] = useState("");
  const { data: dex } = useDexIndex();

  const { data, isPending, isError } = useQuery({
    queryKey: ["generation", generationId],
    queryFn: () => pokeapi<Generation>(`/generation/${generationId}`),
    enabled: Number.isFinite(generationId),
    staleTime: Infinity,
  });

  const meta = generationOf(generationId);

  const pokemon = useMemo(() => {
    if (!data || !dex) return [];
    const ids = new Set(data.pokemon_species.map((entry) => idFromUrl(entry.url)));
    const term = search.trim().toLowerCase();
    return dex
      .filter((entry) => ids.has(entry.id))
      .filter((entry) => (term ? entry.name.includes(term) : true));
  }, [data, dex, search]);

  if (isPending) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="font-display text-2xl">Generación no encontrada</p>
        <Link to="/generations" className="text-sm font-semibold text-primary hover:underline">
          Volver a generaciones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <Link
        to="/generations"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Generaciones
      </Link>

      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div
          className="absolute -top-16 -right-16 size-64 rounded-full opacity-20 blur-3xl"
          style={{ background: `hsl(${(generationId * 40) % 360} 60% 55%)` }}
        />
        <p className="text-[10px] font-bold tracking-[0.24em] text-primary uppercase">
          Pokédex nacional #{meta.range[0]} – #{meta.range[1]}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{meta.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {formatName(data.main_region.name)}
          </span>
          <span>·</span>
          <span>{data.pokemon_species.length} especies</span>
          <span>·</span>
          <span>{data.moves.length} movimientos</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <div>
            <h2 className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Tipos introducidos
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {data.types.map((entry) => (
                <TypeBadge key={entry.name} type={entry.name} size="sm" />
              ))}
              {!data.types.length && (
                <span className="text-xs text-muted-foreground">Ninguno (ya existían)</span>
              )}
            </div>
          </div>
          <div>
            <h2 className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Juegos
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {data.version_groups.map((entry) => (
                <span
                  key={entry.name}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium"
                >
                  {formatName(entry.name)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Pokémon de la región</h2>
        <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-xs">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filtrar…"
            className="w-36 bg-transparent outline-none"
          />
        </label>
      </div>

      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5")}>
        {pokemon.map((entry) => (
          <PokemonTile key={entry.id} entry={entry} />
        ))}
      </div>

      {pokemon.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No encontramos Pokémon con ese nombre en esta generación.
        </p>
      )}
    </div>
  );
}
