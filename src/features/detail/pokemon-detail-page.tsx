import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  GitCompareArrows,
  Heart,
  Loader2,
  MapPin,
  Share2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { AbilityRow } from "@/components/pokemon/ability-chip";
import { EvolutionChainView } from "@/components/pokemon/evolution-chain";
import { formatName } from "@/components/pokemon/pokemon-tile";
import { TypeEffectiveness } from "@/components/pokemon/type-effectiveness";
import { StatBar } from "@/components/shared/stat-bar";
import { TypeBadge } from "@/components/shared/type-badge";
import { TcgCardDialog, TcgCardTile } from "@/components/tcg/card-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  pokeapi,
  genusOf,
  latestFlavor,
  localizedNameOf,
  type AreaEncounter,
  type Pokemon,
  type PokemonSpecies,
} from "@/lib/api/pokeapi";
import { showdownId, type ShowdownPokemon } from "@/lib/api/showdown";
import { tcgSearchCards, type TcgCardSummary } from "@/lib/api/tcgdex";
import { useDexIndex, useShowdownPokedex, useShowdownMoves, useTypeRelations } from "@/lib/hooks";
import { generationOf, SPRITE_ARTWORK, STAT_LABELS, STAT_ORDER } from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/stores/compare";
import { useFavoritesStore, useHistoryStore } from "@/stores/library";

function QuickFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <dt className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}

const MOVE_CATEGORY_LABEL: Record<string, string> = {
  Physical: "Físico",
  Special: "Especial",
  Status: "Estado",
};

export function PokemonDetailPage() {
  const { name = "" } = useParams();
  const [shiny, setShiny] = useState(false);
  const [cryPlaying, setCryPlaying] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TcgCardSummary | null>(null);
  const [moveFilter, setMoveFilter] = useState<"level" | "machine" | "all">("level");
  const [moveSearch, setMoveSearch] = useState("");

  const { data: dex } = useDexIndex();
  const { data: showdown } = useShowdownPokedex();
  const { data: moveData } = useShowdownMoves();
  const { data: relations } = useTypeRelations();
  const favorites = useFavoritesStore();
  const compare = useCompareStore();
  const pushHistory = useHistoryStore((state) => state.pushHistory);

  const pokemonQuery = useQuery({
    queryKey: ["pokemon", name],
    queryFn: () => pokeapi<Pokemon>(`/pokemon/${name}`),
  });
  const pokemon = pokemonQuery.data;

  useEffect(() => {
    if (pokemon) pushHistory(pokemon.name);
  }, [pokemon, pushHistory]);

  const speciesQuery = useQuery({
    queryKey: ["species", pokemon?.species.name],
    queryFn: () => pokeapi<PokemonSpecies>(`/pokemon-species/${pokemon!.species.name}`),
    enabled: Boolean(pokemon),
  });
  const species = speciesQuery.data;

  const encountersQuery = useQuery({
    queryKey: ["encounters", pokemon?.id],
    queryFn: () => pokeapi<AreaEncounter[]>(`/pokemon/${pokemon!.id}/encounters`),
    enabled: Boolean(pokemon),
  });

  const tcgQuery = useQuery({
    queryKey: ["tcg-search", species?.name],
    queryFn: () => tcgSearchCards(species!.name),
    enabled: Boolean(species),
    staleTime: Infinity,
  });

  const sdEntry: ShowdownPokemon | null = useMemo(() => {
    if (!showdown || !species) return null;
    return showdown[showdownId(species.name)] ?? showdown[showdownId(pokemon?.name ?? "")] ?? null;
  }, [showdown, species, pokemon]);

  const levelUpMoves = useMemo(() => {
    if (!pokemon) return [];
    const map = new Map<string, { name: string; level: number; methods: Set<string> }>();
    for (const entry of pokemon.moves) {
      for (const detail of entry.version_group_details) {
        const method = detail.move_learn_method.name;
        if (method !== "level-up" && method !== "machine") continue;
        const existing = map.get(entry.move.name);
        if (existing) {
          existing.methods.add(method);
          existing.level = Math.min(existing.level, detail.level_learned_at);
        } else {
          map.set(entry.move.name, {
            name: entry.move.name,
            level: detail.level_learned_at,
            methods: new Set([method]),
          });
        }
      }
    }
    return [...map.values()]
      .map((move) => {
        const sd = moveData?.[showdownId(move.name)];
        return {
          ...move,
          type: sd?.type?.toLowerCase() ?? null,
          power: sd?.basePower ?? null,
          accuracy: sd?.accuracy ?? null,
          pp: sd?.pp ?? null,
          category: sd?.category ?? null,
          priority: sd?.priority ?? 0,
        };
      })
      .filter((move) =>
        moveFilter === "all"
          ? true
          : moveFilter === "level"
            ? move.methods.has("level-up")
            : move.methods.has("machine"),
      )
      .filter((move) => move.name.includes(moveSearch.toLowerCase()))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [pokemon, moveData, moveFilter, moveSearch]);

  if (pokemonQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <Skeleton className="h-[420px] rounded-3xl" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (pokemonQuery.isError || !pokemon) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary">
          <Sparkles className="size-6" />
        </span>
        <h1 className="font-display text-2xl font-semibold">No encontramos ese Pokémon</h1>
        <p className="text-sm text-muted-foreground">
          Revisa el nombre o el número e inténtalo de nuevo. Por ejemplo:
          pikachu, charizard o 25.
        </p>
        <Button asChild>
          <Link to="/">Volver a la Pokédex</Link>
        </Button>
      </div>
    );
  }

  const mainType = pokemon.types[0]?.type.name ?? "normal";
  const displayName = species ? localizedNameOf(species.names) ?? formatName(species.name) : formatName(pokemon.name);
  const genus = species ? genusOf(species) : null;
  const flavor = species ? latestFlavor(species.flavor_text_entries) : null;
  const gen = generationOf(pokemon.id);
  const isFavorite = favorites.isFavorite(pokemon.name);
  const inCompare = compare.compare.includes(pokemon.name);
  const artwork =
    (shiny
      ? pokemon.sprites.other?.["official-artwork"]?.front_shiny
      : pokemon.sprites.other?.["official-artwork"]?.front_default) ??
    pokemon.sprites.front_default ??
    "";
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  const nextEntry = dex?.find((entry) => entry.id === pokemon.id + 1);
  const prevEntry = dex?.find((entry) => entry.id === pokemon.id - 1);
  const femaleRatio =
    species && species.gender_rate >= 0 ? (species.gender_rate / 8) * 100 : null;

  function share() {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title: `${displayName} · PokéGuía`, url }).catch(() => undefined);
    } else {
      void navigator.clipboard.writeText(url).then(
        () => toast.success("Enlace copiado"),
        () => toast.error("No pudimos copiar el enlace"),
      );
    }
  }

  function toggleCompare() {
    if (!inCompare && compare.compare.length >= 3) {
      toast.error("El comparador admite hasta 3 Pokémon");
      return;
    }
    compare.toggle(pokemon!.name);
    toast.success(inCompare ? "Quitado del comparador" : "Añadido al comparador");
  }

  function playCry() {
    const src = pokemon?.cries?.latest ?? pokemon?.cries?.legacy;
    if (!src) {
      toast.error("Este Pokémon no tiene grito disponible");
      return;
    }
    const audio = new Audio(src);
    setCryPlaying(true);
    audio.onended = () => setCryPlaying(false);
    void audio.play().catch(() => {
      setCryPlaying(false);
      toast.error("No se pudo reproducir el grito");
    });
  }

  const encounters = encountersQuery.data ?? [];
  const groupedEncounters = new Map<string, Set<string>>();
  for (const encounter of encounters) {
    const location = formatName(encounter.location_area.name);
    const versions = groupedEncounters.get(location) ?? new Set<string>();
    for (const versionDetail of encounter.version_details ?? []) {
      versions.add(formatName(versionDetail.version.name));
    }
    groupedEncounters.set(location, versions);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" /> Pokédex
        </Link>
        <div className="flex items-center gap-1.5">
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={() => {
              favorites.toggleFavorite(pokemon.name);
              toast.success(isFavorite ? "Quitado de favoritos" : "Añadido a favoritos");
            }}
            className="rounded-full"
          >
            <Heart className={cn("size-3.5", isFavorite && "fill-current")} />
            {isFavorite ? "Favorito" : "Favorito"}
          </Button>
          <Button
            variant={inCompare ? "default" : "outline"}
            size="sm"
            onClick={toggleCompare}
            className="rounded-full"
          >
            <GitCompareArrows className="size-3.5" />
            Comparar
          </Button>
          <Button variant="outline" size="sm" onClick={share} className="rounded-full">
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Compartir</span>
          </Button>
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-6"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-25 blur-3xl"
            style={{
              background: `radial-gradient(circle at 50% 30%, var(--type-${mainType}), transparent 70%)`,
            }}
          />
          <div className="relative flex items-start justify-between">
            <span className="font-display text-sm font-semibold text-muted-foreground tabular-nums">
              #{String(pokemon.id).padStart(4, "0")}
            </span>
            <button
              type="button"
              onClick={() => setShiny((value) => !value)}
              aria-pressed={shiny}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                shiny
                  ? "border-warning/60 bg-warning/15 text-warning"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Sparkles className="size-3" /> Shiny
            </button>
          </div>
          <motion.img
            key={artwork}
            src={artwork}
            alt={displayName}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="mx-auto my-4 size-56 object-contain drop-shadow-[0_26px_30px_rgba(120,70,30,0.28)] sm:size-64"
          />
          <div className="relative flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={playCry}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary"
            >
              {cryPlaying ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
              Escuchar grito
            </button>
          </div>
          <div className="relative mt-4 flex items-center justify-center gap-2">
            {[pokemon.sprites.front_default, pokemon.sprites.front_shiny, pokemon.sprites.back_default, pokemon.sprites.back_shiny]
              .filter(Boolean)
              .map((sprite, index) => (
                <img
                  key={`${sprite}-${index}`}
                  src={sprite ?? ""}
                  alt=""
                  loading="lazy"
                  className="size-12 rounded-lg border border-border bg-secondary/40 object-contain [image-rendering:pixelated]"
                />
              ))}
          </div>
        </motion.div>

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {species?.is_legendary && (
                <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-warning uppercase">
                  Legendario
                </span>
              )}
              {species?.is_mythical && (
                <span className="rounded-full bg-type-psychic/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-type-psychic uppercase">
                  Mítico
                </span>
              )}
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {gen.region} · Gen {gen.id}
              </span>
              {sdEntry?.tier && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Tier {sdEntry.tier}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {displayName}
              </h1>
              <span className="pb-1 text-sm text-muted-foreground capitalize">
                {formatName(pokemon.name)}
              </span>
            </div>
            {genus && <p className="mt-1 text-sm text-muted-foreground">{genus}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pokemon.types.map(({ type }) => (
                <TypeBadge key={type.name} type={type.name} size="lg" />
              ))}
            </div>
          </div>

          {flavor && (
            <blockquote className="rounded-2xl border border-border bg-accent/40 p-4 text-sm leading-relaxed text-accent-foreground">
              {flavor}
            </blockquote>
          )}

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <QuickFact label="Altura" value={`${(pokemon.height / 10).toFixed(1)} m`} />
            <QuickFact label="Peso" value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
            <QuickFact label="Exp. base" value={pokemon.base_experience ?? "—"} />
            <QuickFact label="Captura" value={species?.capture_rate ?? "—"} />
            <QuickFact
              label="Felicidad"
              value={species?.base_happiness ?? sdEntry?.baseFriendship ?? "—"}
            />
            <QuickFact
              label="Crecimiento"
              value={formatName(species?.growth_rate.name ?? sdEntry?.growthRate ?? "—")}
            />
            <QuickFact label="Hábitat" value={species?.habitat ? formatName(species.habitat.name) : "—"} />
            <QuickFact
              label="Grupos huevo"
              value={sdEntry?.eggGroups?.map(formatName).join(", ") || "—"}
            />
            <QuickFact
              label="Género"
              value={
                femaleRatio === null
                  ? "Sin género"
                  : `${(100 - femaleRatio).toFixed(0)}% ♂ / ${femaleRatio.toFixed(0)}% ♀`
              }
            />
          </dl>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Estadísticas base</h2>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold">
                Total {totalStats}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-6">
              {STAT_ORDER.map((statName) => {
                const stat = pokemon.stats.find((entry) => entry.stat.name === statName);
                if (!stat) return null;
                return (
                  <StatBar
                    key={statName}
                    label={STAT_LABELS[statName]}
                    value={stat.base_stat}
                    compact
                  />
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-display text-base font-semibold">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map(({ ability, is_hidden }) => (
                <AbilityRow key={ability.name} ability={ability.name} hidden={is_hidden} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {relations && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">
            Efectividad defensiva
          </h2>
          <TypeEffectiveness
            types={pokemon.types.map((entry) => entry.type.name)}
            relations={relations}
          />
        </section>
      )}

      {species && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Línea evolutiva</h2>
            <Link
              to={`/generations/${gen.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver {gen.region} <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <EvolutionChainView species={species} />
          </div>
        </section>
      )}

      <section>
        <Tabs defaultValue="moves" className="gap-4">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-secondary/70 p-1">
            <TabsTrigger value="moves" className="rounded-lg px-3 py-1.5 text-xs">
              Movimientos
            </TabsTrigger>
            <TabsTrigger value="cards" className="rounded-lg px-3 py-1.5 text-xs">
              Cartas TCG
            </TabsTrigger>
            <TabsTrigger value="encounters" className="rounded-lg px-3 py-1.5 text-xs">
              Encuentros
            </TabsTrigger>
            <TabsTrigger value="competitive" className="rounded-lg px-3 py-1.5 text-xs">
              Competitivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moves" className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["level", "Por nivel"],
                  ["machine", "MT / MO"],
                  ["all", "Todos"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMoveFilter(value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    moveFilter === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
              <input
                value={moveSearch}
                onChange={(event) => setMoveSearch(event.target.value)}
                placeholder="Filtrar movimientos…"
                className="ml-auto h-8 w-44 rounded-full border border-border bg-card px-3 text-xs outline-none focus:border-primary/50"
              />
              <span className="text-[11px] text-muted-foreground">{levelUpMoves.length} movimientos</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] tracking-wider text-muted-foreground uppercase">
                    <th className="px-3 py-2.5 font-semibold">Nvl</th>
                    <th className="px-3 py-2.5 font-semibold">Movimiento</th>
                    <th className="px-3 py-2.5 font-semibold">Tipo</th>
                    <th className="px-3 py-2.5 font-semibold">Categoría</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Poder</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Prec.</th>
                    <th className="px-3 py-2.5 text-right font-semibold">PP</th>
                  </tr>
                </thead>
                <tbody>
                  {levelUpMoves.slice(0, 80).map((move) => (
                    <tr
                      key={move.name}
                      className="border-b border-border/60 last:border-0 hover:bg-secondary/40"
                    >
                      <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                        {move.level > 0 ? move.level : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium capitalize">
                        {formatName(move.name)}
                        {move.methods.has("machine") && (
                          <span className="ml-1.5 rounded bg-secondary px-1 text-[9px] text-muted-foreground">
                            MT
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {move.type ? <TypeBadge type={move.type} size="sm" showIcon={false} /> : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {move.category ? MOVE_CATEGORY_LABEL[move.category] ?? move.category : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums">
                        {move.power && move.power > 0 ? move.power : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-xs tabular-nums">
                        {move.accuracy === true ? "—" : `${move.accuracy ?? "—"}%`}
                      </td>
                      <td className="px-3 py-2 text-right text-xs tabular-nums">
                        {move.pp ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {levelUpMoves.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay movimientos para este filtro.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cards">
            {tcgQuery.isPending ? (
              <div className="flex justify-center py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : tcgQuery.data && tcgQuery.data.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {tcgQuery.data.slice(0, 15).map((card) => (
                  <TcgCardTile key={card.id} card={card} onSelect={setSelectedCard} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No encontramos cartas TCG para este Pokémon.
              </p>
            )}
          </TabsContent>

          <TabsContent value="encounters">
            {encountersQuery.isPending ? (
              <div className="flex justify-center py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : groupedEncounters.size > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[...groupedEncounters.entries()].slice(0, 45).map(([location, versions]) => (
                  <div
                    key={location}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <p className="flex items-center gap-1.5 text-xs font-semibold">
                      <MapPin className="size-3.5 text-primary" /> {location}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {[...versions].slice(0, 4).join(" · ")}
                      {versions.size > 4 ? "…" : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Sin encuentros salvajes registrados para este Pokémon.
              </p>
            )}
          </TabsContent>

          <TabsContent value="competitive">
            {sdEntry ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Datos competitivos
                  </h3>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Tier</dt>
                      <dd className="font-semibold">{sdEntry.tier ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">BST</dt>
                      <dd className="font-semibold">
                        {Object.values(sdEntry.baseStats).reduce((a, b) => a + b, 0)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Grupos huevo</dt>
                      <dd className="font-semibold">
                        {sdEntry.eggGroups?.join(", ") ?? "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Habilidades</dt>
                      <dd className="text-right font-semibold">
                        {Object.values(sdEntry.abilities).join(", ")}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Formas y variantes
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[...(sdEntry.formeOrder ?? [sdEntry.name]), ...(sdEntry.otherFormes ?? [])]
                      .filter((value, index, array) => array.indexOf(value) === index)
                      .slice(0, 12)
                      .map((forme) => (
                        <Link
                          key={forme}
                          to={`/pokemon/${forme.toLowerCase()}`}
                          className="rounded-full border border-border px-2.5 py-1 text-[11px] capitalize transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          {formatName(forme)}
                        </Link>
                      ))}
                  </div>
                  {sdEntry.canGigantamax && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Puede Gigamaxizar: <span className="font-semibold">{sdEntry.canGigantamax}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Sin datos competitivos para este Pokémon.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <nav className="flex items-center justify-between gap-3 border-t border-border pt-5">
        {prevEntry ? (
          <Link
            to={`/pokemon/${prevEntry.name}`}
            className="group flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-4 pl-2 text-xs font-semibold transition-colors hover:border-primary/40"
          >
            <ArrowLeft className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            <img src={SPRITE_ARTWORK(prevEntry.id)} alt="" loading="lazy" className="size-7 object-contain" />
            <span className="capitalize">{formatName(prevEntry.name)}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextEntry ? (
          <Link
            to={`/pokemon/${nextEntry.name}`}
            className="group flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-2 pl-4 text-xs font-semibold transition-colors hover:border-primary/40"
          >
            <span className="capitalize">{formatName(nextEntry.name)}</span>
            <img src={SPRITE_ARTWORK(nextEntry.id)} alt="" loading="lazy" className="size-7 object-contain" />
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            to="/favorites"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Ver favoritos <ArrowUpRight className="size-3" />
          </Link>
        )}
      </nav>

      <TcgCardDialog
        card={selectedCard}
        open={Boolean(selectedCard)}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />

      {inCompare && (
        <div className="fixed right-4 bottom-4 z-30 sm:right-6 sm:bottom-6">
          <Button asChild className="rounded-full shadow-lg">
            <Link to="/compare">
              <Check className="size-4" />
              Ver comparación ({compare.compare.length})
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
