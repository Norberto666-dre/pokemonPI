import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Dices,
  Flame,
  Gamepad2,
  Heart,
  Layers,
  Search,
  Shuffle,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";

import { formatName } from "@/components/pokemon/pokemon-tile";
import { TypeBadge } from "@/components/shared/type-badge";
import { Button } from "@/components/ui/button";
import { useDexIndex } from "@/lib/hooks";
import {
  GENERATIONS,
  POKEMON_TYPES,
  SPRITE_ARTWORK,
  TYPE_ICONS,
  TYPE_LABELS,
} from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";
import { useFavoritesStore, useHistoryStore } from "@/stores/library";

const QUICK_LINKS = [
  { to: "/types", label: "Tabla de tipos", description: "18 tipos y efectividades", icon: Flame },
  { to: "/moves", label: "Movimientos", description: "Potencia, precisión y PP", icon: Swords },
  { to: "/items", label: "Objetos", description: "Bolsa completa con sprites", icon: Sparkles },
  { to: "/cards", label: "Cartas TCG", description: "Coleccionables y sets", icon: Gamepad2 },
  { to: "/compare", label: "Comparar", description: "Hasta 3 Pokémon a la vez", icon: Layers },
  { to: "/teams", label: "Equipos", description: "Constructor y cobertura", icon: Users },
];

function HeroSearch({ onRandom }: { onRandom: () => void }) {
  const navigate = useNavigate();
  const { data: dex } = useDexIndex();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!dex || !term) return [];
    return dex
      .filter(
        (entry) =>
          entry.name.replace(/-/g, " ").includes(term) || String(entry.id).startsWith(term),
      )
      .slice(0, 7);
  }, [dex, query]);

  function submit(value?: string) {
    const term = (value ?? query).trim().toLowerCase();
    if (!term) return;
    const match =
      dex?.find((entry) => entry.name === term) ??
      dex?.find((entry) => String(entry.id) === term.replace("#", "")) ??
      suggestions[0];
    navigate(`/pokemon/${match ? match.name : encodeURIComponent(term)}`);
    setFocused(false);
  }

  return (
    <div className="relative w-full max-w-xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-2 pr-2 pl-5 shadow-[0_18px_40px_-28px_rgba(120,70,30,0.6)] transition-all focus-within:border-primary/50 focus-within:shadow-[0_20px_44px_-24px_rgba(217,106,53,0.45)]"
        role="search"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && suggestions.length > 0 && query.trim()) {
              event.preventDefault();
              submit(suggestions[0].name);
            }
          }}
          placeholder="Nombre o número: pikachu, 25, charizard…"
          aria-label="Buscar Pokémon"
          autoComplete="off"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
        <button
          type="button"
          onClick={onRandom}
          aria-label="Pokémon aleatorio"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <Shuffle className="size-4" />
        </button>
        <Button type="submit" className="rounded-full px-5">
          Buscar
          <ArrowRight className="size-4" />
        </Button>
      </form>

      {focused && suggestions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-xl"
        >
          {suggestions.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submit(entry.name)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary"
              >
                <img
                  src={SPRITE_ARTWORK(entry.id)}
                  alt=""
                  loading="lazy"
                  className="size-9 object-contain"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {formatName(entry.name)}
                  </span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    #{String(entry.id).padStart(3, "0")}
                  </span>
                </span>
                <span className="flex gap-1">
                  {entry.types.map((type) => (
                    <TypeBadge key={type} type={type} size="sm" showIcon={false} />
                  ))}
                </span>
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { data: dex } = useDexIndex();
  const favorites = useFavoritesStore((state) => state.favorites);
  const history = useHistoryStore((state) => state.history);

  const featured = useMemo(() => {
    if (!dex?.length) return null;
    const day = Math.floor(Date.now() / 86_400_000);
    return dex[(day * 37) % dex.length];
  }, [dex]);

  const favoriteEntries = useMemo(
    () => (dex ?? []).filter((entry) => favorites.includes(entry.name)).slice(0, 6),
    [dex, favorites],
  );

  const historyEntries = useMemo(
    () =>
      history
        .map((name) => (dex ?? []).find((entry) => entry.name === name))
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .slice(0, 6),
    [dex, history],
  );

  function random() {
    if (!dex?.length) return;
    const entry = dex[Math.floor(Math.random() * dex.length)];
    navigate(`/pokemon/${entry.name}`);
  }

  return (
    <div className="space-y-14">
      <section className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 -z-10 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-primary uppercase">
            <Sparkles className="size-3" />
            Guía Pokémon completa
          </p>
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
            Todo el mundo Pokémon,
            <span className="block text-primary italic">en un solo lugar.</span>
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Consulta cualquier Pokémon, domina la tabla de tipos, descubre
            evoluciones, movimientos, objetos y cartas. Tu guía de campo para
            cada aventura.
          </p>
          <HeroSearch onRandom={random} />
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-semibold tracking-wide uppercase">Prueba</span>
            {["pikachu", "charizard", "gengar", "lucario"].map((name) => (
              <Link
                key={name}
                to={`/pokemon/${name}`}
                className="rounded-full border border-border bg-card px-2.5 py-1 font-medium capitalize transition-colors hover:border-primary/40 hover:text-primary"
              >
                {name}
              </Link>
            ))}
            <span className="text-border">|</span>
            <button
              type="button"
              onClick={random}
              className="inline-flex items-center gap-1 font-semibold text-primary transition-opacity hover:opacity-75"
            >
              <Dices className="size-3.5" /> Sorpréndeme
            </button>
          </div>
        </div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-accent/60 to-secondary blur-2xl" />
            <Link
              to={`/pokemon/${featured.name}`}
              className="group relative block overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-[0_30px_70px_-40px_rgba(120,70,30,0.6)] transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                  Pokémon del día
                </span>
                <span className="font-display text-sm font-semibold text-muted-foreground tabular-nums">
                  #{String(featured.id).padStart(3, "0")}
                </span>
              </div>
              <motion.img
                src={SPRITE_ARTWORK(featured.id)}
                alt={formatName(featured.name)}
                className="mx-auto my-4 size-52 object-contain drop-shadow-[0_24px_30px_rgba(120,70,30,0.25)] sm:size-60"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-semibold capitalize">
                    {formatName(featured.name)}
                  </p>
                  <div className="mt-1.5 flex gap-1.5">
                    {featured.types.map((type) => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                </div>
                <span className="grid size-10 place-items-center rounded-full border border-border bg-background text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        )}
      </section>

      <section aria-labelledby="acceso-rapido" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="acceso-rapido" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Acceso rápido
            </h2>
            <p className="text-sm text-muted-foreground">
              Las herramientas que más vas a usar, a un clic.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_36px_-28px_rgba(120,70,30,0.6)]"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <link.icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{link.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  {link.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {(favoriteEntries.length > 0 || historyEntries.length > 0) && (
        <section className="grid gap-6 lg:grid-cols-2">
          {favoriteEntries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Heart className="size-4 text-primary" /> Tus favoritos
                </h2>
                <Link
                  to="/favorites"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Ver todos
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {favoriteEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/pokemon/${entry.name}`}
                    className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1.5 text-xs font-medium transition-colors hover:border-primary/40"
                  >
                    <img
                      src={SPRITE_ARTWORK(entry.id)}
                      alt=""
                      loading="lazy"
                      className="size-8 object-contain"
                    />
                    {formatName(entry.name)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {historyEntries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <Clock className="size-4 text-primary" /> Últimas consultas
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {historyEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/pokemon/${entry.name}`}
                    className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1.5 text-xs font-medium transition-colors hover:border-primary/40"
                  >
                    <img
                      src={SPRITE_ARTWORK(entry.id)}
                      alt=""
                      loading="lazy"
                      className="size-8 object-contain"
                    />
                    {formatName(entry.name)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="tipos" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="tipos" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Explora por tipo
            </h2>
            <p className="text-sm text-muted-foreground">
              Fortalezas, debilidades y Pokémon de cada tipo.
            </p>
          </div>
          <Link
            to="/types"
            className="shrink-0 text-xs font-semibold text-primary hover:underline"
          >
            Tabla completa
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {POKEMON_TYPES.map((type) => (
            <Link
              key={type}
              to={`/types?tipo=${type}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-transform hover:-translate-y-0.5",
              )}
              style={{
                color: `var(--type-${type})`,
                backgroundColor: `color-mix(in srgb, var(--type-${type}) 12%, transparent)`,
                borderColor: `color-mix(in srgb, var(--type-${type}) 32%, transparent)`,
              }}
            >
              <span aria-hidden="true">{TYPE_ICONS[type]}</span>
              {TYPE_LABELS[type]}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="generaciones" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="generaciones" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Explora por generación
            </h2>
            <p className="text-sm text-muted-foreground">
              De Kanto a Paldea, la Pokédex completa.
            </p>
          </div>
          <Link
            to="/generations"
            className="shrink-0 text-xs font-semibold text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {GENERATIONS.map((gen) => (
            <Link
              key={gen.id}
              to={`/generations/${gen.id}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="font-display text-3xl font-semibold text-primary/25 transition-colors group-hover:text-primary/50">
                {String(gen.id).padStart(2, "0")}
              </span>
              <span className="mt-2 block text-sm font-semibold">{gen.region}</span>
              <span className="block text-[11px] text-muted-foreground">
                {gen.range[1] - gen.range[0] + 1} Pokémon
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
