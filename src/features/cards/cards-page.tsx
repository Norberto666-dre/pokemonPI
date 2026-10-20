import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Dices, Loader2, Search, Sparkles } from "lucide-react";

import { TcgCardDialog, TcgCardTile } from "@/components/tcg/card-dialog";
import { PageHeader } from "@/components/shared/states";
import { tcgSearchCards, tcgSetCards, tcgSets, type TcgCardSummary } from "@/lib/api/tcgdex";
import { cn } from "@/lib/utils";

export function CardsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [setId, setSetId] = useState<string | null>(null);
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
    queryKey: ["tcg-set-cards", setId],
    queryFn: () => tcgSetCards(setId!),
    enabled: Boolean(setId),
    staleTime: 1000 * 60 * 30,
  });

  const currentSet = useMemo(
    () => setsQuery.data?.find((entry) => entry.id === setId) ?? null,
    [setsQuery.data, setId],
  );

  const cards = searchQuery.data ?? setCardsQuery.data?.cards ?? [];
  const showingSearch = query.length > 1;

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSetId(null);
    setQuery(search.trim());
  }

  function openSet(id: string) {
    setSelectedCard(null);
    setQuery("");
    setSearch("");
    setSetId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setSetId(null);
    setQuery("");
    setSearch("");
  }

  const loading = setsQuery.isPending || searchQuery.isFetching || setCardsQuery.isFetching;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coleccionables"
        title="Cartas TCG"
        description="Explora expansiones y cartas Pokémon del juego de cartas coleccionables. Busca por nombre o navega por set."
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
            <ArrowLeft className="size-3.5" /> Volver a sets
          </button>
        )}
        {cards.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const random = cards[Math.floor(Math.random() * cards.length)];
              setSelectedCard(random);
            }}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Dices className="size-3.5" /> Carta aleatoria
          </button>
        )}
      </form>

      {loading && cards.length === 0 ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : showingSearch ? (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">
              Resultados para “{query}”
            </h2>
            <span className="text-xs text-muted-foreground">{cards.length} cartas</span>
          </div>
          {cards.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No encontramos cartas con ese nombre. Prueba con el nombre en inglés.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                {currentSet?.series ?? "Expansión"}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                {currentSet?.name ?? setId}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {setCardsQuery.data?.cardCount?.total ?? cards.length} cartas
                {currentSet?.releaseDate ? ` · ${currentSet.releaseDate}` : ""}
              </p>
            </div>
            {currentSet?.logo && (
              <img src={currentSet.logo} alt={currentSet.name} className="h-12 object-contain" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((card) => (
              <TcgCardTile key={card.id} card={card} onSelect={setSelectedCard} />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Expansiones</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {setsQuery.data?.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => openSet(set.id)}
                className={cn(
                  "group rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.4)]",
                )}
              >
                <div className="flex h-24 items-center justify-center rounded-xl bg-secondary/60 p-2">
                  {set.logo ? (
                    <img
                      src={set.logo}
                      alt={set.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Sparkles className="size-6 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-semibold group-hover:text-primary">
                  {set.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{set.id}</p>
              </button>
            ))}
          </div>
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
