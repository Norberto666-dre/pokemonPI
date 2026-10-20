import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, History, Loader2 } from "lucide-react";

import { formatName, PokemonTile } from "@/components/pokemon/pokemon-tile";
import { EmptyState, PageHeader } from "@/components/shared/states";
import { useDexIndex } from "@/lib/hooks";
import { SPRITE_THUMB } from "@/lib/pokemon-types";
import { useFavoritesStore, useHistoryStore } from "@/stores/library";

export function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const history = useHistoryStore((state) => state.history);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const { data: dex, isPending } = useDexIndex();

  const entries = useMemo(
    () =>
      favorites
        .map((name) => dex?.find((entry) => entry.name === name))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [favorites, dex],
  );

  const historyEntries = useMemo(
    () =>
      history
        .map((name) => dex?.find((entry) => entry.name === name))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [history, dex],
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Tu colección"
        title="Favoritos"
        description="Los Pokémon que marcaste con el corazón, siempre a mano."
      />

      {isPending ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Todavía no tienes favoritos"
          description="Abre la ficha de cualquier Pokémon y toca el corazón para guardarlo aquí."
          action={
            <Link
              to="/"
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Explorar Pokédex
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {entries.map((entry) => (
            <PokemonTile key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {historyEntries.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
              <History className="size-4 text-primary" /> Visitados recientemente
            </h2>
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
            >
              Borrar historial
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {historyEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/pokemon/${entry.name}`}
                className="group flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                <img
                  src={SPRITE_THUMB(entry.id)}
                  alt=""
                  className="size-7 object-contain [image-rendering:pixelated]"
                  loading="lazy"
                />
                {formatName(entry.name)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
