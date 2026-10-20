const BASE = "https://api.tcgdex.net/v2/en";
const BASE_ES = "https://api.tcgdex.net/v2/es";

async function tcgGet<T>(path: string, locale = false): Promise<T> {
  const res = await fetch(`${locale ? BASE_ES : BASE}${path}`);
  if (res.status === 404) throw new Error("not-found");
  if (!res.ok) throw new Error("api-error");
  return res.json() as Promise<T>;
}

export interface TcgSetSummary {
  id: string;
  name: string;
  logo?: string;
  series?: string;
  releaseDate?: string;
  total?: number;
}

export interface TcgSetDetail extends TcgSetSummary {
  printedTotal?: number;
  legal?: { standard?: boolean; expanded?: boolean; unlimited?: boolean };
  symbol?: string;
  types?: string[];
}

export interface TcgCardSummary {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  types?: string[];
  hp?: string;
  stage?: string;
  set?: { id: string; name: string; logo?: string };
}

export interface TcgAttack {
  cost?: string[];
  name: string;
  damage?: string | number;
  effect?: string;
  text?: string;
}

export interface TcgCardDetail extends TcgCardSummary {
  dexId?: number[];
  illustrator?: string;
  suffix?: string;
  regulationMark?: string;
  retreat?: number;
  attacks?: TcgAttack[];
  abilities?: { type: string; name: string; text?: string; effect?: string }[];
  weaknesses?: { type: string; value: string }[];
  resistances?: { type: string; value: string }[];
  evolveFrom?: string;
  evolveTo?: string[];
  description?: string;
  variants?: Record<string, boolean>;
  category?: string;
}

export interface TcgCardsPage {
  cardCount?: { total: number; official?: number };
  cards: TcgCardSummary[];
}

export function tcgSearchCards(name: string): Promise<TcgCardSummary[]> {
  return tcgGet<TcgCardSummary[]>(
    `/cards?name=${encodeURIComponent(name.toLowerCase())}`,
  );
}

export function tcgCard(id: string): Promise<TcgCardDetail> {
  return tcgGet<TcgCardDetail>(`/cards/${encodeURIComponent(id)}`);
}

export function tcgSets(): Promise<TcgSetSummary[]> {
  return tcgGet<TcgSetSummary[]>("/sets");
}

export function tcgSetCards(setId: string): Promise<TcgCardsPage> {
  return tcgGet<TcgCardsPage>(`/sets/${encodeURIComponent(setId)}/cards`);
}
