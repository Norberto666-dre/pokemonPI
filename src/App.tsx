import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { HomePage } from "@/features/home/home-page";

const PokemonDetailPage = lazy(() =>
  import("@/features/detail/pokemon-detail-page").then((m) => ({
    default: m.PokemonDetailPage,
  })),
);
const TypesPage = lazy(() =>
  import("@/features/types/types-page").then((m) => ({ default: m.TypesPage })),
);
const MovesPage = lazy(() =>
  import("@/features/moves/moves-page").then((m) => ({ default: m.MovesPage })),
);
const ItemsPage = lazy(() =>
  import("@/features/items/items-page").then((m) => ({ default: m.ItemsPage })),
);
const AbilitiesPage = lazy(() =>
  import("@/features/abilities/abilities-page").then((m) => ({ default: m.AbilitiesPage })),
);
const GenerationsPage = lazy(() =>
  import("@/features/generations/generations-page").then((m) => ({
    default: m.GenerationsPage,
  })),
);
const GenerationDetailPage = lazy(() =>
  import("@/features/generations/generations-page").then((m) => ({
    default: m.GenerationDetailPage,
  })),
);
const CardsPage = lazy(() =>
  import("@/features/cards/cards-page").then((m) => ({ default: m.CardsPage })),
);
const ComparePage = lazy(() =>
  import("@/features/compare/compare-page").then((m) => ({ default: m.ComparePage })),
);
const FavoritesPage = lazy(() =>
  import("@/features/favorites/favorites-page").then((m) => ({ default: m.FavoritesPage })),
);
const TeamsPage = lazy(() =>
  import("@/features/teams/teams-page").then((m) => ({ default: m.TeamsPage })),
);
const TeamDetailPage = lazy(() =>
  import("@/features/teams/teams-page").then((m) => ({ default: m.TeamDetailPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-primary">404</p>
      <h1 className="font-display text-2xl font-semibold">Un Pokémon salvaje bloquea el camino</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
      >
        Volver a la Pokédex
      </Link>
    </div>
  );
}

function RouteFallback() {
  return (
    <div className="flex justify-center py-24 text-muted-foreground">
      <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route
              path="pokemon/:name"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <PokemonDetailPage />
                </Suspense>
              }
            />
            <Route
              path="types"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <TypesPage />
                </Suspense>
              }
            />
            <Route
              path="moves"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <MovesPage />
                </Suspense>
              }
            />
            <Route
              path="items"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ItemsPage />
                </Suspense>
              }
            />
            <Route
              path="abilities"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <AbilitiesPage />
                </Suspense>
              }
            />
            <Route
              path="generations"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <GenerationsPage />
                </Suspense>
              }
            />
            <Route
              path="generations/:id"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <GenerationDetailPage />
                </Suspense>
              }
            />
            <Route
              path="cards"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <CardsPage />
                </Suspense>
              }
            />
            <Route
              path="compare"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ComparePage />
                </Suspense>
              }
            />
            <Route
              path="favorites"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <FavoritesPage />
                </Suspense>
              }
            />
            <Route
              path="teams"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <TeamsPage />
                </Suspense>
              }
            />
            <Route
              path="teams/:id"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <TeamDetailPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
