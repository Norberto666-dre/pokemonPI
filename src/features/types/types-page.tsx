import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Grid3X3, Loader2, Search } from "lucide-react";

import { formatName, PokemonTile } from "@/components/pokemon/pokemon-tile";
import { PageHeader } from "@/components/shared/states";
import { TypeBadge } from "@/components/shared/type-badge";
import { pokeapi, type NamedResource } from "@/lib/api/pokeapi";
import {
  attackMultiplier,
  useDexIndex,
  useShowdownMoves,
  useTypeRelations,
} from "@/lib/hooks";
import {
  isPokemonType,
  POKEMON_TYPES,
  TYPE_ICONS,
  TYPE_LABELS,
  type PokemonTypeName,
} from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";

interface TypeDetail {
  id: number;
  name: string;
  damage_relations: {
    double_damage_to: NamedResource[];
    half_damage_to: NamedResource[];
    no_damage_to: NamedResource[];
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
  pokemon: { pokemon: NamedResource; slot: number }[];
}

function multiplierCell(value: number) {
  if (value === 0) return { label: "0", className: "bg-foreground/8 text-foreground/45" };
  if (value === 4) return { label: "4×", className: "bg-destructive/25 text-destructive" };
  if (value === 2) return { label: "2×", className: "bg-destructive/15 text-destructive" };
  if (value === 0.5) return { label: "½", className: "bg-success/15 text-success" };
  if (value === 0.25) return { label: "¼", className: "bg-success/25 text-success" };
  return { label: "·", className: "text-muted-foreground/30" };
}

export function TypesPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("tipo");
  const [selected, setSelected] = useState<PokemonTypeName>(
    initial && isPokemonType(initial) ? initial : "fire",
  );
  const [search, setSearch] = useState("");

  const { data: relations } = useTypeRelations();
  const { data: dex } = useDexIndex();
  const { data: moves } = useShowdownMoves();

  const typeQuery = useQuery({
    queryKey: ["type-detail", selected],
    queryFn: () => pokeapi<TypeDetail>(`/type/${selected}`),
    staleTime: Infinity,
  });

  const relation = relations?.[selected];

  const typeMoves = useMemo(() => {
    if (!moves) return [];
    return Object.values(moves)
      .filter((move) => move.type?.toLowerCase() === selected)
      .sort((a, b) => (b.basePower ?? 0) - (a.basePower ?? 0) || a.name.localeCompare(b.name));
  }, [moves, selected]);

  const pokemonList = useMemo(() => {
    if (!typeQuery.data || !dex) return [];
    const names = new Set(typeQuery.data.pokemon.map((entry) => entry.pokemon.name));
    return dex
      .filter((entry) => names.has(entry.name))
      .filter((entry) => entry.name.includes(search.toLowerCase()));
  }, [typeQuery.data, dex, search]);

  function selectType(type: PokemonTypeName) {
    setSelected(type);
    setSearch("");
    setParams({ tipo: type }, { replace: true });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Referencia"
        title="Tabla de tipos"
        description="Consulta fortalezas, debilidades e inmunidades. Explora qué Pokémon y movimientos pertenecen a cada tipo."
      />

      <div className="flex flex-wrap gap-2">
        {POKEMON_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => selectType(type)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5",
              selected === type && "ring-2 ring-primary/40",
            )}
            style={{
              color: `var(--type-${type})`,
              backgroundColor:
                selected === type
                  ? `color-mix(in srgb, var(--type-${type}) 22%, transparent)`
                  : `color-mix(in srgb, var(--type-${type}) 8%, transparent)`,
              borderColor: `color-mix(in srgb, var(--type-${type}) 32%, transparent)`,
            }}
          >
            <span aria-hidden="true">{TYPE_ICONS[type]}</span>
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={selected} size="lg" />
            <h2 className="font-display text-xl font-semibold">{TYPE_LABELS[selected]}</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Atacando es fuerte contra
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {relation?.double_damage_to.map((entry) => (
                  <TypeBadge key={entry.name} type={entry.name} size="sm" />
                ))}
                {!relation?.double_damage_to.length && (
                  <span className="text-xs text-muted-foreground">Ninguno</span>
                )}
              </div>
              <h3 className="mt-4 mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Poco eficaz contra
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {relation?.half_damage_to.map((entry) => (
                  <TypeBadge key={entry.name} type={entry.name} size="sm" />
                ))}
                {!relation?.half_damage_to.length && (
                  <span className="text-xs text-muted-foreground">Ninguno</span>
                )}
              </div>
              <h3 className="mt-4 mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Sin efecto contra
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {relation?.no_damage_to.map((entry) => (
                  <TypeBadge key={entry.name} type={entry.name} size="sm" />
                ))}
                {!relation?.no_damage_to.length && (
                  <span className="text-xs text-muted-foreground">Ninguno</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Débil contra
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {relation?.double_damage_from.map((entry) => (
                  <TypeBadge key={entry.name} type={entry.name} size="sm" />
                ))}
                {!relation?.double_damage_from.length && (
                  <span className="text-xs text-muted-foreground">Ninguno</span>
                )}
              </div>
              <h3 className="mt-4 mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Resiste
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {relation?.half_damage_from.map((entry) => (
                  <TypeBadge key={entry.name} type={entry.name} size="sm" />
                ))}
                {!relation?.half_damage_from.length && (
                  <span className="text-xs text-muted-foreground">Ninguno</span>
                )}
              </div>
              <h3 className="mt-4 mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Inmune a
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {relation?.no_damage_from.map((entry) => (
                  <TypeBadge key={entry.name} type={entry.name} size="sm" />
                ))}
                {!relation?.no_damage_from.length && (
                  <span className="text-xs text-muted-foreground">Ninguno</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold">
            <Grid3X3 className="size-4 text-primary" /> Movimientos del tipo
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {typeMoves.length} movimientos · ordenados por potencia
          </p>
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1">
            {typeMoves.slice(0, 30).map((move) => (
              <div
                key={move.name}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-secondary/60"
              >
                <span className="font-medium">{move.name}</span>
                <span className="flex items-center gap-2 text-muted-foreground tabular-nums">
                  {move.category}
                  <span className="font-semibold text-foreground">
                    {move.basePower || "—"}
                  </span>
                </span>
              </div>
            ))}
            {typeMoves.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">Sin movimientos.</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">
            Pokémon de tipo {TYPE_LABELS[selected]}
          </h2>
          <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-xs">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filtrar…"
              className="w-36 bg-transparent outline-none"
            />
          </label>
        </div>
        {typeQuery.isPending ? (
          <div className="flex justify-center py-14 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pokemonList.map((entry) => (
              <PokemonTile key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Matriz de efectividad</h2>
        <p className="text-xs text-muted-foreground">
          Filas: tipo atacante. Columnas: tipo defensor. Pasa el cursor para leer cada
          cruce. Haz clic en un encabezado para cambiar el tipo seleccionado.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card p-2">
          <table className="border-separate border-spacing-0 text-center text-[10px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card p-1" />
                {POKEMON_TYPES.map((type) => (
                  <th key={type} className="p-0.5">
                    <button
                      type="button"
                      onClick={() => selectType(type)}
                      title={TYPE_LABELS[type]}
                      className="grid size-7 place-items-center rounded-md font-semibold"
                      style={{
                        color: `var(--type-${type})`,
                        backgroundColor: `color-mix(in srgb, var(--type-${type}) 12%, transparent)`,
                      }}
                    >
                      {TYPE_ICONS[type]}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POKEMON_TYPES.map((attacking) => (
                <tr key={attacking}>
                  <th className="sticky left-0 z-10 bg-card p-0.5">
                    <button
                      type="button"
                      onClick={() => selectType(attacking)}
                      title={TYPE_LABELS[attacking]}
                      className="grid size-7 place-items-center rounded-md font-semibold"
                      style={{
                        color: `var(--type-${attacking})`,
                        backgroundColor: `color-mix(in srgb, var(--type-${attacking}) 12%, transparent)`,
                      }}
                    >
                      {TYPE_ICONS[attacking]}
                    </button>
                  </th>
                  {POKEMON_TYPES.map((defending) => {
                    const value = relations
                      ? attackMultiplier(relations, attacking, [defending])
                      : 1;
                    const cell = multiplierCell(value);
                    return (
                      <td key={defending} className="p-0.5">
                        <div
                          title={`${TYPE_LABELS[attacking]} → ${TYPE_LABELS[defending]}: ${value}×`}
                          className={cn(
                            "grid size-7 place-items-center rounded-md text-[10px] font-bold tabular-nums transition-transform hover:scale-110",
                            cell.className,
                            selected === attacking && "ring-1 ring-primary/30",
                          )}
                        >
                          {cell.label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Pokémon con doble tipo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Combina tipos para ver su efectividad real. Prueba con{" "}
          <Link to="/pokemon/charizard" className="font-semibold text-primary hover:underline">
            Charizard
          </Link>{" "}
          (Fuego/Volador) o{" "}
          <Link to="/pokemon/swampert" className="font-semibold text-primary hover:underline">
            Swampert
          </Link>{" "}
          (Agua/Tierra).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PKM_SAMPLES.map((name) => (
            <Link
              key={name}
              to={`/pokemon/${name}`}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium capitalize transition-colors hover:border-primary/40 hover:text-primary"
            >
              {formatName(name)} <ArrowUpRight className="size-3" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const PKM_SAMPLES = [
  "charizard",
  "swampert",
  "garchomp",
  "tyranitar",
  "ferrothorn",
  "dragapult",
];


