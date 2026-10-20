const DATA = "https://play.pokemonshowdown.com/data";

export interface ShowdownPokemon {
  num: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  abilities: Record<string, string>;
  heightm?: number;
  weightkg?: number;
  color?: string;
  prevo?: string;
  evoLevel?: number;
  evoType?: string;
  evoCondition?: string;
  evoItem?: string;
  evos?: string[];
  eggGroups?: string[];
  genderRatio?: { M: number; F: number };
  catchRate?: { number: number; percentage: number };
  baseFriendship?: number;
  baseExp?: number;
  growthRate?: string;
  tier?: string;
  isNonstandard?: string;
  otherFormes?: string[];
  formeOrder?: string[];
  canGigantamax?: string;
  released?: boolean;
  unreleased?: string;
}

export interface ShowdownMove {
  num: number;
  name: string;
  accuracy?: number | true;
  basePower: number;
  category: string;
  pp?: number;
  priority?: number;
  type?: string;
  target?: string;
  flags?: Record<string, number>;
  contestType?: string;
  critRatio?: number;
  drain?: number;
  healing?: number;
  recoil?: number;
  isZ?: string;
  isMax?: string;
  desc?: string;
  shortDesc?: string;
  secondaries?: unknown[];
  isNonstandard?: string;
}

export interface ShowdownLearnset {
  learnset: Record<string, string[]>;
}

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(`${DATA}/${file}`);
  if (!res.ok) throw new Error("api-error");
  return res.json() as Promise<T>;
}

export function fetchShowdownPokedex(): Promise<Record<string, ShowdownPokemon>> {
  return fetchJson("pokedex.json");
}

export function fetchShowdownMoves(): Promise<Record<string, ShowdownMove>> {
  return fetchJson("moves.json");
}

export function fetchShowdownLearnsets(): Promise<Record<string, ShowdownLearnset>> {
  return fetchJson("learnsets.json");
}

export function showdownId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findShowdownEntry(
  dex: Record<string, ShowdownPokemon>,
  name: string,
): ShowdownPokemon | null {
  const direct = dex[showdownId(name)];
  if (direct) return direct;
  return null;
}

export function statTotal(stats: Record<string, number>): number {
  return Object.values(stats).reduce((sum, value) => sum + value, 0);
}
