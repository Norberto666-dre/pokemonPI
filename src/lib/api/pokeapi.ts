const BASE = "https://pokeapi.co/api/v2";

export class NotFoundError extends Error {
  constructor() {
    super("not-found");
    this.name = "NotFoundError";
  }
}

export async function pokeapi<T>(path: string): Promise<T> {
  const suffix = path.startsWith("http")
    ? path.slice(path.indexOf("/api/v2") + "/api/v2".length)
    : path;
  const res = await fetch(`${BASE}${suffix}`);
  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) throw new Error("api-error");
  return res.json() as Promise<T>;
}

export interface NamedResource {
  name: string;
  url: string;
}

export interface ResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResource[];
}

export interface TypeRelations {
  double_damage_from: NamedResource[];
  double_damage_to: NamedResource[];
  half_damage_from: NamedResource[];
  half_damage_to: NamedResource[];
  no_damage_from: NamedResource[];
  no_damage_to: NamedResource[];
}

export interface PokemonTypeEntry {
  slot: number;
  type: NamedResource;
}

export interface PokemonAbilityEntry {
  is_hidden: boolean;
  slot: number;
  ability: NamedResource;
}

export interface PokemonStatEntry {
  base_stat: number;
  effort: number;
  stat: NamedResource;
}

export interface PokemonMoveEntry {
  move: NamedResource;
  version_group_details: {
    level_learned_at: number;
    move_learn_method: NamedResource;
    version_group: NamedResource;
  }[];
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
      front_shiny: string | null;
    };
    home?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokemonCries {
  latest: string;
  legacy: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: PokemonTypeEntry[];
  sprites: PokemonSprites;
  stats: PokemonStatEntry[];
  abilities: PokemonAbilityEntry[];
  moves: PokemonMoveEntry[];
  cries: PokemonCries | null;
  species: NamedResource;
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedResource;
  version: NamedResource;
}

export interface GenusEntry {
  genus: string;
  language: NamedResource;
}

export interface SpeciesNameEntry {
  name: string;
  language: NamedResource;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  growth_rate: NamedResource;
  genera: GenusEntry[];
  flavor_text_entries: FlavorTextEntry[];
  names: SpeciesNameEntry[];
  evolves_from_species: NamedResource | null;
  evolution_chain: { url: string };
  habitat: NamedResource | null;
  color: NamedResource;
  generation: NamedResource;
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  shape: NamedResource | null;
  hatch_counter: number | null;
  has_gender_differences: boolean;
  forms_switchable: boolean;
}

export interface AbilityEffectEntry {
  effect: string;
  short_effect: string;
  language: NamedResource;
}

export interface AbilityFlavorEntry {
  flavor_text: string;
  language: NamedResource;
}

export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedResource;
  effect_entries: AbilityEffectEntry[];
  flavor_text_entries: AbilityFlavorEntry[];
  names: SpeciesNameEntry[];
  pokemon: { is_hidden: boolean; slot: number; pokemon: NamedResource }[];
}

export interface ItemSprite {
  default?: string;
  shiny?: string;
  holdable?: string;
  [key: string]: string | undefined;
}

export interface ItemFlavorEntry {
  text: string;
  language: NamedResource;
}

export interface ItemEffectEntry {
  effect_entries: {
    effect: string;
    short_effect: string;
    language: NamedResource;
  }[];
  language: NamedResource;
}

export interface Item {
  id: number;
  name: string;
  cost: number | null;
  fling_power: number | null;
  fling_effect: NamedResource | null;
  attributes: NamedResource[];
  category: NamedResource;
  names: SpeciesNameEntry[];
  sprites: ItemSprite;
  flavor_text_entries: ItemFlavorEntry[];
  effect_entries: {
    effect: string;
    short_effect: string;
    language: NamedResource;
  }[];
  held_by_pokemon: { pokemon: NamedResource; version_details: unknown[] }[];
  baby_trigger_for: NamedResource | null;
}

export interface ItemPocket {
  id: number;
  name: string;
  descriptions: { description: string; language: NamedResource }[];
  categories: NamedResource[];
  items: NamedResource[];
}

export interface EvolutionDetail {
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  time_of_day: string;
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
  item: NamedResource | null;
  held_item: NamedResource | null;
  known_move: NamedResource | null;
  known_move_type: NamedResource | null;
  relative_physical_stats: number | null;
  gender: number | null;
  trade_species: NamedResource | null;
  trigger: NamedResource;
  item_is_held: boolean;
}

export interface ChainLink {
  is_baby: boolean;
  species: NamedResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}

export interface Generation {
  id: number;
  name: string;
  abilities: NamedResource[];
  main_region: NamedResource;
  moves: NamedResource[];
  names: SpeciesNameEntry[];
  pokemon_species: NamedResource[];
  types: NamedResource[];
  version_groups: NamedResource[];
}

export interface EncounterDetail {
  max_level: number;
  min_level: number;
  method: NamedResource;
  chance: number;
  version: NamedResource;
}

export interface AreaEncounter {
  location_area: NamedResource;
  version_details: {
    max_chance: number;
    version: NamedResource;
    encounter_details: EncounterDetail[];
  }[];
}

export function idFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return Number(parts[parts.length - 1]);
}

export function latestFlavor(
  entries: FlavorTextEntry[],
  language = "es",
): string | null {
  const preferred = entries.filter((entry) => entry.language.name === language);
  const pool = preferred.length ? preferred : entries;
  return pool.length ? pool[pool.length - 1].flavor_text.replace(/\f/g, " ") : null;
}

export function genusOf(species: PokemonSpecies, language = "es"): string | null {
  const preferred = species.genera.find((g) => g.language.name === language);
  return preferred?.genus ?? species.genera[0]?.genus ?? null;
}

export function localizedNameOf(
  names: SpeciesNameEntry[],
  language = "es",
): string | null {
  return names.find((entry) => entry.language.name === language)?.name ?? null;
}
