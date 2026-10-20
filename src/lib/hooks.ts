import { useQuery } from "@tanstack/react-query";
import {
  pokeapi,
  idFromUrl,
  type ResourceList,
  type TypeRelations,
} from "@/lib/api/pokeapi";
import {
  fetchShowdownLearnsets,
  fetchShowdownMoves,
  fetchShowdownPokedex,
  showdownId,
  type ShowdownPokemon,
  type ShowdownMove,
  type ShowdownLearnset,
} from "@/lib/api/showdown";
import { POKEMON_TYPES } from "@/lib/pokemon-types";

export interface DexEntry {
  id: number;
  name: string;
  types: string[];
  stats: Record<string, number> | null;
  tier: string | null;
  eggGroups: string[];
}

export function useDexIndex() {
  return useQuery({
    queryKey: ["dex-index"],
    queryFn: async () => {
      const [list, sd] = await Promise.all([
        pokeapi<ResourceList>("/pokemon?limit=2000"),
        fetchShowdownPokedex(),
      ]);
      const index: DexEntry[] = list.results
        .map((item) => ({ id: idFromUrl(item.url), name: item.name }))
        .filter((item) => item.id >= 1 && item.id <= 1025)
        .sort((a, b) => a.id - b.id)
        .map(({ id, name }) => {
          const entry = sd[showdownId(name)] ?? null;
          return {
            id,
            name,
            types: entry?.types?.map((type) => type.toLowerCase()) ?? [],
            stats: entry?.baseStats ?? null,
            tier: entry?.tier ?? null,
            eggGroups: entry?.eggGroups ?? [],
          };
        });
      return index;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useShowdownPokedex() {
  return useQuery({
    queryKey: ["sd-pokedex"],
    queryFn: fetchShowdownPokedex,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useShowdownMoves() {
  return useQuery({
    queryKey: ["sd-moves"],
    queryFn: fetchShowdownMoves,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useShowdownLearnsets() {
  return useQuery({
    queryKey: ["sd-learnsets"],
    queryFn: fetchShowdownLearnsets,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export type TypeRelationsMap = Record<string, TypeRelations>;

export function useTypeRelations() {
  return useQuery({
    queryKey: ["type-relations"],
    queryFn: async () => {
      const results = await Promise.all(
        POKEMON_TYPES.map((type) =>
          pokeapi<{ name: string; damage_relations: TypeRelations }>(`/type/${type}`),
        ),
      );
      const map: TypeRelationsMap = {};
      POKEMON_TYPES.forEach((type, i) => {
        map[type] = results[i].damage_relations;
      });
      return map;
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function defenseMultiplier(
  relations: TypeRelationsMap,
  attacking: string,
  defending: string[],
): number {
  const relation = relations[attacking];
  if (!relation || !relation.no_damage_from) return 1;
  let multiplier = 1;
  for (const type of defending) {
    if (relation.no_damage_from.some((t) => t.name === type)) multiplier *= 0;
    else if (relation.half_damage_from.some((t) => t.name === type)) multiplier *= 0.5;
    else if (relation.double_damage_from.some((t) => t.name === type)) multiplier *= 2;
  }
  return multiplier;
}

export function defensiveProfile(
  relations: TypeRelationsMap,
  defending: string[],
) {
  const weak: { type: string; multiplier: number }[] = [];
  const resist: { type: string; multiplier: number }[] = [];
  const immune: string[] = [];
  for (const attacking of POKEMON_TYPES) {
    const multiplier = defenseMultiplier(relations, attacking, defending);
    if (multiplier === 0) immune.push(attacking);
    else if (multiplier > 1) weak.push({ type: attacking, multiplier });
    else if (multiplier < 1) resist.push({ type: attacking, multiplier });
  }
  return { weak, resist, immune };
}

export function attackMultiplier(
  relations: TypeRelationsMap,
  attacking: string,
  defending: string[],
): number {
  const relation = relations[attacking];
  if (!relation || !relation.no_damage_to) return 1;
  let multiplier = 1;
  for (const type of defending) {
    if (relation.no_damage_to.some((t) => t.name === type)) multiplier *= 0;
    else if (relation.half_damage_to.some((t) => t.name === type)) multiplier *= 0.5;
    else if (relation.double_damage_to.some((t) => t.name === type)) multiplier *= 2;
  }
  return multiplier;
}

export type { ShowdownPokemon, ShowdownMove, ShowdownLearnset };
