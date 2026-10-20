import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import { formatName } from "@/components/pokemon/pokemon-tile";
import {
  pokeapi,
  idFromUrl,
  localizedNameOf,
  type EvolutionChain,
  type EvolutionDetail,
  type PokemonSpecies,
} from "@/lib/api/pokeapi";
import { SPRITE_ARTWORK } from "@/lib/pokemon-types";

function conditionOf(detail?: EvolutionDetail): string | null {
  if (!detail) return null;
  const parts: string[] = [];
  if (detail.trigger.name === "trade") {
    parts.push(detail.trade_species ? `Intercambio por ${formatName(detail.trade_species.name)}` : "Intercambio");
  }
  if (detail.min_level) parts.push(`Nivel ${detail.min_level}`);
  if (detail.item) parts.push(`Usar ${formatName(detail.item.name)}`);
  if (detail.held_item) parts.push(`Equipado con ${formatName(detail.held_item.name)}`);
  if (detail.min_happiness) parts.push(`Felicidad ${detail.min_happiness}`);
  if (detail.min_beauty) parts.push(`Belleza ${detail.min_beauty}`);
  if (detail.min_affection) parts.push(`Afecto ${detail.min_affection}`);
  if (detail.known_move) parts.push(`Aprender ${formatName(detail.known_move.name)}`);
  if (detail.known_move_type) parts.push(`Movimiento de tipo ${detail.known_move_type.name}`);
  if (detail.time_of_day) parts.push(detail.time_of_day === "day" ? "De día" : "De noche");
  if (detail.gender === 1) parts.push("Solo hembra");
  if (detail.gender === 2) parts.push("Solo macho");
  if (detail.needs_overworld_rain) parts.push("Con lluvia");
  if (detail.turn_upside_down) parts.push("Consola invertida");
  if (detail.relative_physical_stats === 1) parts.push("Ataque > Defensa");
  if (detail.relative_physical_stats === -1) parts.push("Ataque < Defensa");
  if (detail.relative_physical_stats === 0) parts.push("Ataque = Defensa");
  if (parts.length === 0 && detail.trigger.name === "level-up") parts.push("Subir de nivel");
  return parts.length ? parts.join(" · ") : null;
}

function flattenChain(
  link: EvolutionChain["chain"],
  depth = 0,
  stages: EvolutionChain["chain"][][] = [],
) {
  stages[depth] = stages[depth] ?? [];
  stages[depth].push(link);
  for (const child of link.evolves_to) flattenChain(child, depth + 1, stages);
  return stages;
}

export function EvolutionChainView({ species }: { species: PokemonSpecies }) {
  const { data, isLoading } = useQuery({
    queryKey: ["evolution", species.evolution_chain.url],
    queryFn: () => pokeapi<EvolutionChain>(species.evolution_chain.url),
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <div className="h-28 animate-pulse rounded-2xl bg-secondary" aria-label="Cargando evoluciones" />
    );
  }
  if (!data) return null;

  const stages = flattenChain(data.chain);

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {stages.map((stage, stageIndex) => (
        <div key={stageIndex} className="flex items-center gap-2">
          {stageIndex > 0 && (
            <ArrowRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
          )}
          <div className="flex flex-col gap-2">
            {stage.map((link) => {
              const id = idFromUrl(link.species.url);
              const condition = conditionOf(link.evolution_details[0]);
              return (
                <div key={link.species.name} className="flex flex-col items-center">
                  <Link
                    to={`/pokemon/${link.species.name}`}
                    className="group flex w-28 flex-col items-center rounded-2xl border border-border bg-card p-2.5 text-center transition-all hover:-translate-y-1 hover:border-primary/40"
                  >
                    <img
                      src={SPRITE_ARTWORK(id)}
                      alt={localizedNameOf(species.names) ?? formatName(link.species.name)}
                      loading="lazy"
                      className="size-16 object-contain transition-transform group-hover:scale-110"
                    />
                    <span className="mt-1 text-[11px] leading-tight font-semibold capitalize">
                      {formatName(link.species.name)}
                    </span>
                    <span className="text-[9px] text-muted-foreground tabular-nums">
                      #{String(id).padStart(3, "0")}
                    </span>
                  </Link>
                  {stageIndex > 0 && condition && (
                    <span className="mt-1 max-w-28 text-center text-[9px] leading-tight text-muted-foreground">
                      {condition}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {stages.length === 1 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" /> Este Pokémon no evoluciona.
        </p>
      )}
    </div>
  );
}
