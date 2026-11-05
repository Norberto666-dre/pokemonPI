const BASE = "https://api.tcgdex.net/v2/en";

async function tcgGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (res.status === 404) throw new Error("not-found");
  if (!res.ok) throw new Error("api-error");
  return res.json() as Promise<T>;
}

const HAS_EXTENSION = /\.(webp|png|jpe?g|svg)$/i;

export interface TcgCardCount {
  total: number;
  official?: number;
}

export interface TcgSetSummary {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  serie?: string;
  releaseDate?: string;
  cardCount?: TcgCardCount;
}

export interface TcgSetDetail extends TcgSetSummary {
  cards?: TcgCardSummary[];
  legal?: { standard?: boolean; expanded?: boolean; unlimited?: boolean };
  abbreviation?: string;
  tcgOnline?: string;
}

export interface TcgCardSummary {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  types?: string[];
  hp?: string | number;
  stage?: string;
  set?: {
    id: string;
    name: string;
    logo?: string;
    symbol?: string;
    cardCount?: TcgCardCount;
  };
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
  cardCount?: TcgCardCount;
  cards: TcgCardSummary[];
}

/**
 * TCGdex changed its asset URLs: some come with an extension, most don't.
 * Card images live at `${image}/low.webp` or `${image}/high.webp`.
 */
export function tcgImageUrl(
  image: string | undefined | null,
  size: "low" | "high" = "low",
): string | null {
  if (!image) return null;
  if (HAS_EXTENSION.test(image)) return image;
  return `${image}/${size}.webp`;
}

/**
 * Set logos are served without an extension (`.../base1/logo`).
 * Most sets have `.png` and `.webp`, but a few only ship `.png`,
 * so png is the safest primary format.
 */
export function tcgLogoUrl(logo: string | undefined | null): string | null {
  if (!logo) return null;
  if (HAS_EXTENSION.test(logo)) return logo;
  return `${logo}.png`;
}

/** Candidate URLs to try in order when an image fails to load. */
export function tcgImageCandidates(
  image: string | undefined | null,
  size: "low" | "high" = "low",
): string[] {
  if (!image) return [];
  if (HAS_EXTENSION.test(image)) return [image];
  return [`${image}/${size}.webp`, `${image}/${size}.png`];
}

/** Candidate URLs for a set logo (png first, then webp/jpg as fallbacks). */
export function tcgLogoCandidates(logo: string | undefined | null): string[] {
  if (!logo) return [];
  if (HAS_EXTENSION.test(logo)) return [logo];
  return [`${logo}.png`, `${logo}.webp`, `${logo}.jpg`];
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

export function tcgSet(setId: string): Promise<TcgSetDetail> {
  return tcgGet<TcgSetDetail>(`/sets/${encodeURIComponent(setId)}`);
}

/**
 * The old `/sets/{id}/cards` endpoint no longer exists.
 * The set detail endpoint already returns the full card list.
 */
export async function tcgSetCards(setId: string): Promise<TcgCardsPage> {
  const set = await tcgSet(setId);
  return {
    cardCount: set.cardCount,
    cards: set.cards ?? [],
  };
}

/**
 * Paginated catalogue of every card, sorted alphabetically.
 * ~23.7k cards total, 60 per page.
 */
export function tcgAllCards(page = 1, perPage = 60): Promise<TcgCardSummary[]> {
  const params = new URLSearchParams({
    "pagination:page": String(page),
    "pagination:itemsPerPage": String(perPage),
    "sort:field": "name",
    "sort:order": "ASC",
  });
  return tcgGet<TcgCardSummary[]>(`/cards?${params.toString()}`);
}
