import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Search, Swords } from "lucide-react";

import { formatName } from "@/components/pokemon/pokemon-tile";
import { PageHeader } from "@/components/shared/states";
import { TypeBadge } from "@/components/shared/type-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pokeapi, type NamedResource } from "@/lib/api/pokeapi";
import { useShowdownMoves } from "@/lib/hooks";
import { POKEMON_TYPES, TYPE_LABELS, isPokemonType } from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 60;

const CATEGORY_LABEL: Record<string, string> = {
  Physical: "Físico",
  Special: "Especial",
  Status: "Estado",
};

interface PokeMove {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  type: NamedResource;
  damage_class: NamedResource;
  effect_entries: { effect: string; short_effect: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource }[];
  names: { name: string; language: NamedResource }[];
}

function MoveDialog({
  move,
  onClose,
}: {
  move: string | null;
  onClose: () => void;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["move-detail", move],
    queryFn: () => pokeapi<PokeMove>(`/move/${move}`),
    enabled: Boolean(move),
    staleTime: Infinity,
  });

  const effect =
    data?.effect_entries.find((entry) => entry.language.name === "es")?.effect ??
    data?.effect_entries.find((entry) => entry.language.name === "en")?.effect ??
    null;
  const flavor =
    data?.flavor_text_entries.find((entry) => entry.language.name === "es")?.flavor_text ??
    null;

  return (
    <Dialog open={Boolean(move)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl capitalize">
            {move ? formatName(move) : ""}
          </DialogTitle>
          <DialogDescription>Detalle del movimiento</DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={data.type.name} />
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                {CATEGORY_LABEL[data.damage_class.name] ?? data.damage_class.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Poder <strong className="text-foreground">{data.power ?? "—"}</strong>
              </span>
              <span className="text-xs text-muted-foreground">
                Precisión <strong className="text-foreground">{data.accuracy ?? "—"}%</strong>
              </span>
              <span className="text-xs text-muted-foreground">
                PP <strong className="text-foreground">{data.pp ?? "—"}</strong>
              </span>
              {data.priority !== 0 && (
                <span className="text-xs text-muted-foreground">
                  Prioridad <strong className="text-foreground">{data.priority}</strong>
                </span>
              )}
            </div>
            {flavor && (
              <p className="rounded-xl bg-accent/60 p-3 text-sm leading-relaxed text-accent-foreground">
                {flavor.replace(/\f/g, " ")}
              </p>
            )}
            {effect && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {effect.replace(/\f/g, " ")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pudimos cargar el movimiento.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MovesPage() {
  const { data: moves, isPending } = useShowdownMoves();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"name" | "power" | "accuracy" | "pp">("name");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const list = useMemo(() => {
    if (!moves) return [];
    const term = deferredSearch.trim().toLowerCase();
    return Object.entries(moves)
      .map(([key, move]) => ({ key, ...move }))
      .filter((move) => (term ? move.name.toLowerCase().includes(term) : true))
      .filter((move) => (type === "all" ? true : move.type?.toLowerCase() === type))
      .filter((move) => (category === "all" ? true : move.category === category))
      .filter((move) => move.basePower > 0 || category === "Status" || category === "all")
      .sort((a, b) => {
        if (sort === "power") return b.basePower - a.basePower;
        if (sort === "accuracy") {
          const accA = a.accuracy === true ? 101 : (a.accuracy ?? 0);
          const accB = b.accuracy === true ? 101 : (b.accuracy ?? 0);
          return accB - accA;
        }
        if (sort === "pp") return (b.pp ?? 0) - (a.pp ?? 0);
        return a.name.localeCompare(b.name);
      });
  }, [moves, deferredSearch, type, category, sort]);

  function updateFilter(callback: () => void) {
    callback();
    setVisible(PAGE_SIZE);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guía"
        title="Movimientos"
        description="Explora todos los movimientos con su tipo, categoría, potencia, precisión y PP. Haz clic en cualquiera para ver su descripción completa."
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-52 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm sm:max-w-xs">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => updateFilter(() => setSearch(event.target.value))}
            placeholder="Buscar movimiento…"
            className="w-full bg-transparent outline-none"
          />
        </label>

        <select
          value={type}
          onChange={(event) => updateFilter(() => setType(event.target.value))}
          className="h-10 rounded-full border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary/50"
          aria-label="Filtrar por tipo"
        >
          <option value="all">Todos los tipos</option>
          {POKEMON_TYPES.map((item) => (
            <option key={item} value={item}>
              {TYPE_LABELS[item]}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) => updateFilter(() => setCategory(event.target.value))}
          className="h-10 rounded-full border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary/50"
          aria-label="Filtrar por categoría"
        >
          <option value="all">Todas las categorías</option>
          <option value="Physical">Físico</option>
          <option value="Special">Especial</option>
          <option value="Status">Estado</option>
        </select>

        <select
          value={sort}
          onChange={(event) => updateFilter(() => setSort(event.target.value as typeof sort))}
          className="h-10 rounded-full border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary/50"
          aria-label="Ordenar"
        >
          <option value="name">Ordenar: nombre</option>
          <option value="power">Ordenar: potencia</option>
          <option value="accuracy">Ordenar: precisión</option>
          <option value="pp">Ordenar: PP</option>
        </select>

        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Swords className="size-3.5" />
          {list.length} movimientos
        </span>
      </div>

      {isPending ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-3 font-semibold">Movimiento</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-right font-semibold">Poder</th>
                  <th className="px-4 py-3 text-right font-semibold">Precisión</th>
                  <th className="px-4 py-3 text-right font-semibold">PP</th>
                  <th className="px-4 py-3 text-right font-semibold">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, visible).map((move) => (
                  <tr
                    key={move.key}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-secondary/40"
                    onClick={() => setSelected(move.name.toLowerCase().replace(/\s+/g, "-"))}
                  >
                    <td className="px-4 py-2.5 text-xs font-medium">{move.name}</td>
                    <td className="px-4 py-2.5">
                      {move.type && isPokemonType(move.type.toLowerCase()) ? (
                        <TypeBadge type={move.type.toLowerCase()} size="sm" />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {CATEGORY_LABEL[move.category] ?? move.category}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-semibold tabular-nums">
                      {move.basePower > 0 ? move.basePower : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums">
                      {move.accuracy === true ? "—" : `${move.accuracy ?? "—"}%`}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums">{move.pp ?? "—"}</td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-right text-xs tabular-nums",
                        (move.priority ?? 0) > 0 && "font-semibold text-success",
                        (move.priority ?? 0) < 0 && "text-destructive",
                      )}
                    >
                      {(move.priority ?? 0) > 0 ? `+${move.priority}` : move.priority ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visible < list.length && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((value) => value + PAGE_SIZE)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
              >
                Mostrar más <ChevronDown className="size-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      <MoveDialog move={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
