import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Moon, Search, Sun } from "lucide-react";

import { SearchDialog, useSearchShortcut } from "@/components/search/search-dialog";
import { InstallButton } from "@/components/layout/install-button";
import { Pokeball } from "@/components/shared/pokeball";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/stores/library";
import { useThemeStore } from "@/stores/theme";

function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {theme === "dark" ? "Modo claro" : "Modo oscuro"}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const location = useLocation();
  useSearchShortcut(() => setSearchOpen(true));

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
            >
              <Pokeball className="size-9 text-primary" />
              <span className="font-display text-xl font-semibold tracking-tight">
                Poké<span className="text-primary">Guía</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="ml-auto hidden h-9 w-64 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground md:flex xl:w-80"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Buscar Pokémon…</span>
              <kbd className="pointer-events-none rounded border border-border bg-secondary px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-foreground">
                Ctrl K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-0.5 md:ml-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar Pokémon"
                className="rounded-full text-muted-foreground hover:text-foreground md:hidden"
              >
                <Search className="size-[18px]" />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Link to="/favorites" aria-label="Favoritos">
                      <Heart className="size-[18px]" />
                      {favoritesCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {favoritesCount > 9 ? "9+" : favoritesCount}
                        </span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Favoritos</TooltipContent>
              </Tooltip>
              <InstallButton />
              <ThemeToggle />
            </div>
          </div>

          <nav aria-label="Secciones" className="border-t border-border/50">
            <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "group flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>

        <footer className="mt-6 border-t border-border/70 bg-card/40">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <p className="flex items-center gap-2">
              <Pokeball className="size-4 text-primary" />
              PokéGuía · hecha para entrenadores
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <a
                className="transition-colors hover:text-primary"
                href="https://pokeapi.co"
                target="_blank"
                rel="noreferrer"
              >
                PokéAPI
              </a>
              <span aria-hidden="true">·</span>
              <a
                className="transition-colors hover:text-primary"
                href="https://tcgdex.dev"
                target="_blank"
                rel="noreferrer"
              >
                TCGdex
              </a>
              <span aria-hidden="true">·</span>
              <a
                className="transition-colors hover:text-primary"
                href="https://pokemonshowdown.com"
                target="_blank"
                rel="noreferrer"
              >
                Pokémon Showdown
              </a>
            </p>
          </div>
        </footer>

        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        <Toaster position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
