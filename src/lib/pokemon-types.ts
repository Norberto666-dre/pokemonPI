export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

export const TYPE_LABELS: Record<PokemonTypeName, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

export const TYPE_HEX: Record<PokemonTypeName, string> = {
  normal: "#a89b8c",
  fire: "#e06b3a",
  water: "#4a90c4",
  electric: "#e8b03a",
  grass: "#6fae5e",
  ice: "#7cc4c8",
  fighting: "#c45a4a",
  poison: "#a06bc4",
  ground: "#cfa05c",
  flying: "#8fa8d8",
  psychic: "#d8709f",
  bug: "#8fae3f",
  rock: "#b09a6e",
  ghost: "#7a6bb0",
  dragon: "#7a68c4",
  dark: "#6b5a4e",
  steel: "#8f9ba3",
  fairy: "#dd8ab0",
};

export const TYPE_ICONS: Record<PokemonTypeName, string> = {
  normal: "◉",
  fire: "✦",
  water: "◆",
  electric: "⚡",
  grass: "❧",
  ice: "❄",
  fighting: "✚",
  poison: "☣",
  ground: "▲",
  flying: "✧",
  psychic: "◎",
  bug: "✱",
  rock: "⬟",
  ghost: "☽",
  dragon: "☄",
  dark: "🌑",
  steel: "⬡",
  fairy: "✿",
};

export function isPokemonType(value: string): value is PokemonTypeName {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

export const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};

export const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export interface GenRange {
  id: number;
  name: string;
  region: string;
  range: [number, number];
}

export const GENERATIONS: GenRange[] = [
  { id: 1, name: "Generación I", region: "Kanto", range: [1, 151] },
  { id: 2, name: "Generación II", region: "Johto", range: [152, 251] },
  { id: 3, name: "Generación III", region: "Hoenn", range: [252, 386] },
  { id: 4, name: "Generación IV", region: "Sinnoh", range: [387, 493] },
  { id: 5, name: "Generación V", region: "Teselia", range: [494, 649] },
  { id: 6, name: "Generación VI", region: "Kalos", range: [650, 721] },
  { id: 7, name: "Generación VII", region: "Alola", range: [722, 809] },
  { id: 8, name: "Generación VIII", region: "Galar", range: [810, 905] },
  { id: 9, name: "Generación IX", region: "Paldea", range: [906, 1025] },
];

export function generationOf(id: number): GenRange {
  return (
    GENERATIONS.find((gen) => id >= gen.range[0] && id <= gen.range[1]) ??
    GENERATIONS[0]
  );
}

export const SPRITE_THUMB = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const SPRITE_ARTWORK = (id: number, shiny = false) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork${
    shiny ? "/shiny" : ""
  }/${id}.png`;

export type Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

export function multiplierLabel(value: Multiplier): string {
  if (value === 0) return "0×";
  return `${value}×`;
}
