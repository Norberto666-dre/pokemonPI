import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Dices, Layers, LayoutGrid, Loader2, Search } from "lucide-react";

import { TcgCardDialog, TcgCardTile } from "@/components/tcg/card-dialog";
import { TcgSetLogo } from "@/components/tcg/set-logo";
import { EmptyState, ErrorState, PageHeader } from "@/components/shared/states";
import {
  tcgAllCards,
  tcgSearchCards,
  tcgSetCards,
  tcgSets,
  type TcgCardSummary,
} from "@/lib/api/tcgdex";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 60;
const CARD_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

type Mode = "sets" | "all";

export function CardsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [setId, setSetId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("sets");
  const [setFilter, setSetFilter] = useState("");
  const [selectedCard, setSelectedCard] = useState<TcgCardSummary | null>(null);

  const setsQuery = useQuery({
    queryKey: ["tcg-sets"],
    queryFn: tcgSets,
    staleTime: 1000 * 60 * 60,
  });

  const searchQuery = useQuery({
    queryKey: ["tcg-search", query],
    queryFn: () => tcgSearchCards(query),
    enabled: query.length > 1,
    staleTime: 1000 * 60 * 10,
  });

  const setCardsQuery = useQuery({
    queryKey: ["tcg-set", setId],
    queryFn: () => tcgSetCards(setId!),
    enabled: Boolean(setId),
    staleTime: 1000 * 60 * 30,
  });

  const allQuery = useInfiniteQuery({
    queryKey: ["tcg-all-cards"],
    queryFn: ({ pageParam }) => tcgAllCards(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    enabled: mode === "all" && !setId && query.length <= 1,
    staleTime: 1000 * 60 * 60,
  });

  const showingSearch = query.length > 1;
  const showingAll = !showingSearch && !setId && mode === "all";

  const allCards = useMemo(() => {
    const seen = new Set<string>();
    const cards: TcgCardSummary[] = [];
    for (const page of allQuery.data?.pages ?? []) {
      for (const card of page) {
        if (seen.has(card.id)) continue;
        seen.add(card.id);
        cards.push(card);
      }
    }
    return cards;
  }, [allQuery.data]);

  const filteredSets = useMemo(() => {
    const term = setFilter.trim().toLowerCase();
    const sets = setsQuery.data ?? [];
    if (!term) return sets;
    return sets.filter(
      (set) =>
        set.name.toLowerCase().includes(term) || set.id.toLowerCase().includes(term),
    );
  }, [setsQuery.data, setFilter]);

  const currentSet = useMemo(
    () => setsQuery.data?.find((entry) => entry.id === setId) ?? null,
    [setsQuery.data, setId],
  );

  const cards: TcgCardSummary[] = showingSearch
    ? (searchQuery.data ?? [])
    : setId
      ? (setCardsQuery.data?.cards ?? [])
      : showingAll
        ? allCards
        : [];

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = allQuery;
  const AUTO_LOAD_LIMIT = 600;
  const reachedAutoLimit = allCards.length >= AUTO_LOAD_LIMIT;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !showingAll || !hasNextPage || reachedAutoLimit) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [showingAll, hasNextPage, isFetchingNextPage, fetchNextPage, reachedAutoLimit]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSetId(null);
    setQuery(search.trim());
  }

  function openSet(id: string) {
    setSelectedCard(null);
    setQuery("");
    setSearch("");
    setSetFilter("");
    setSetId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setSetId(null);
    setQuery("");
    setSearch("");
    setSetFilter("");
  }

  function changeMode(next: Mode) {
    reset();
    setMode(next);
  }

  function pickRandom() {
    if (cards.length === 0) return;
    setSelectedCard(cards[Math.floor(Math.random() * cards.length)]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coleccionables"
        title="Cartas TCG"
        description="Explora las 220 expansiones o recorre las más de 23.000 cartas Pokémon del juego de cartas coleccionables. Busca por nombre o navega por set."
      />

      <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
        <label className="flex h-11 min-w-52 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm sm:max-w-md">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar carta por nombre (p. ej. Pikachu)…"
            className="w-full bg-transparent outline-none"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Buscar
        </button>
        {(setId || query) && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" /> Volver
          </button>
        )}
        {cards.length > 0 && (
          <button
            type="button"
            onClick={pickRandom}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Dices className="size-3.5" /> Carta aleatoria
          </button>
        )}
      </form>

      {!showingSearch && !setId && (
        <div className="inline-flex rounded-full border border-border bg-card p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => changeMode("sets")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors",
              mode === "sets"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <Layers className="size-3.5" /> Expansiones
          </button>
          <button
            type="button"
            onClick={() => changeMode("all")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors",
              mode === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <LayoutGrid className="size-3.5" /> Todas las cartas
          </button>
        </div>
      )}

      {showingSearch ? (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">
              Resultados para “{query}”
            </h2>
            <span className="text-xs text-muted-foreground">{cards.length} cartas</span>
          </div>
          {searchQuery.isPending ? (
            <Loading />
          ) : searchQuery.isError ? (
            <ErrorState
              message="No pudimos buscar cartas."
              onRetry={() => void searchQuery.refetch()}
            />
          ) : cards.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              description="No encontramos cartas con ese nombre. Prueba con el nombre en inglés."
            />
          ) : (
            <div className={CARD_GRID}>
              {cards.map((card) => (
                <TcgCardTile key={card.id} card={card} onSelect={setSelectedCard} />
              ))}
            </div>
          )}
        </section>
      ) : setId ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-card p-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                {currentSet?.serie ?? "Expansión"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                {currentSet?.name ?? setId}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {setCardsQuery.data?.cardCount?.total ?? cards.length} cartas
                {currentSet?.releaseDate ? ` · ${currentSet.releaseDate}` : ""}
              </p>
            </div>
            <TcgSetLogo
              logo={currentSet?.logo}
              name={currentSet?.name ?? setId}
              className="h-12 max-w-40"
            />
          </div>
          {setCardsQuery.isPending ? (
            <Loading />
          ) : setCardsQuery.isError ? (
            <ErrorState
              message="No pudimos cargar esta expansión."
              onRetry={() => void setCardsQuery.refetch()}
            />
          ) : cards.length === 0 ? (
            <EmptyState title="Expansión sin cartas" description="Esta expansión no tiene cartas disponibles." />
          ) : (
            <div className={CARD_GRID}>
              {cards.map((card) => (
                <TcgCardTile key={card.id} card={card} onSelect={setSelectedCard} />
              ))}
            </div>
          )}
        </section>
      ) : showingAll ? (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Todas las cartas</h2>
            <span className="text-xs text-muted-foreground">
              {allCards.length} cargadas
            </span>
          </div>
          {allQuery.isPending ? (
            <Loading />
          ) : allQuery.isError ? (
            <ErrorState
              message="No pudimos cargar el catálogo."
              onRetry={() => void allQuery.refetch()}
            />
          ) : allCards.length === 0 ? (
            <EmptyState title="Sin cartas" description="No hay cartas disponibles." />
          ) : (
            <>
              <div className={CARD_GRID}>
                {allCards.map((card) => (
                  <TcgCardTile key={card.id} card={card} onSelect={setSelectedCard} />
                ))}
              </div>
              <div ref={loadMoreRef} className="flex flex-col items-center gap-2 py-8">
                {hasNextPage ? (
                  reachedAutoLimit ? (
                    <button
                      type="button"
                      onClick={() => void fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="rounded-full border border-border bg-card px-5 py-2 text-xs font-semibold transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      {isFetchingNextPage ? "Cargando…" : "Cargar más cartas"}
                    </button>
                  ) : (
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  )
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {allCards.length} cartas mostradas.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Expansiones</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {filteredSets.length} de {setsQuery.data?.length ?? 0}
              </span>
              <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs">
                <Search className="size-3.5 text-muted-foreground" />
                <input
                  value={setFilter}
                  onChange={(event) => setSetFilter(event.target.value)}
                  placeholder="Filtrar sets…"
                  className="w-32 bg-transparent outline-none"
                />
              </label>
            </div>
          </div>
          {setsQuery.isPending ? (
            <Loading />
          ) : setsQuery.isError ? (
            <ErrorState
              message="No pudimos cargar las expansiones."
              onRetry={() => void setsQuery.refetch()}
            />
          ) : filteredSets.length === 0 ? (
            <EmptyState title="Sin expansiones" description="Ningún set coincide con ese filtro." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredSets.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  onClick={() => openSet(set.id)}
                  className="group rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex h-24 items-center justify-center rounded-xl bg-secondary/60 p-2">
                    <TcgSetLogo
                      logo={set.logo}
                      name={set.name}
                      className="size-full"
                      imgClassName="max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold group-hover:text-primary">
                    {set.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {set.cardCount?.total ?? "?"} cartas
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <TcgCardDialog
        card={selectedCard}
        open={Boolean(selectedCard)}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
