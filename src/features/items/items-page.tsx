import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Package, Search } from "lucide-react";

import { formatName } from "@/components/pokemon/pokemon-tile";
import { PageHeader } from "@/components/shared/states";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  pokeapi,
  type Item,
  type ItemPocket,
  type ResourceList,
} from "@/lib/api/pokeapi";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 60;

const POCKET_LABELS: Record<string, string> = {
  misc: "Objetos varios",
  medicine: "Medicina",
  pokeballs: "Poké Balls",
  machines: "Máquinas",
  berries: "Bayas",
  mail: "Correo",
  battle: "Objetos de combate",
  key: "Objetos clave",
};

function ItemIcon({ name, className }: { name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={cn(
          "grid size-10 place-items-center rounded-xl bg-secondary text-xs font-bold text-muted-foreground uppercase",
          className,
        )}
      >
        {name.slice(0, 2)}
      </div>
    );
  }
  return (
    <img
      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("size-10 object-contain [image-rendering:pixelated]", className)}
    />
  );
}

function ItemDialog({ item, onClose }: { item: string | null; onClose: () => void }) {
  const { data, isPending } = useQuery({
    queryKey: ["item-detail", item],
    queryFn: () => pokeapi<Item>(`/item/${item}`),
    enabled: Boolean(item),
    staleTime: Infinity,
  });

  const flavor =
    data?.flavor_text_entries.find((entry) => entry.language.name === "es")?.text ??
    data?.flavor_text_entries.find((entry) => entry.language.name === "en")?.text ??
    null;
  const effect =
    data?.effect_entries.find((entry) => entry.language.name === "es")?.effect ??
    data?.effect_entries.find((entry) => entry.language.name === "en")?.effect ??
    null;

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl capitalize">
            {item ? formatName(item) : ""}
          </DialogTitle>
          <DialogDescription>Detalle del objeto</DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div className="flex justify-center py-8 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {data.sprites.default ? (
                <img
                  src={data.sprites.default}
                  alt={data.name}
                  className="size-16 object-contain [image-rendering:pixelated]"
                />
              ) : (
                item && <ItemIcon name={item} className="size-16" />
              )}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-secondary px-2.5 py-1 font-semibold">
                  {formatName(data.category.name)}
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                  Coste {data.cost ?? 0} ₽
                </span>
                {data.fling_power ? (
                  <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                    Lanzamiento {data.fling_power}
                  </span>
                ) : null}
              </div>
            </div>
            {data.attributes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.attributes.map((attribute) => (
                  <span
                    key={attribute.name}
                    className="rounded-full bg-accent/60 px-2.5 py-1 text-[11px] font-medium text-accent-foreground"
                  >
                    {formatName(attribute.name)}
                  </span>
                ))}
              </div>
            )}
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
          <p className="text-sm text-muted-foreground">No pudimos cargar el objeto.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ItemsPage() {
  const [search, setSearch] = useState("");
  const [pocket, setPocket] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const itemsQuery = useQuery({
    queryKey: ["items"],
    queryFn: () => pokeapi<ResourceList>("/item?limit=2000"),
    staleTime: Infinity,
  });

  const pocketsQuery = useQuery({
    queryKey: ["item-pockets"],
    queryFn: () => pokeapi<ResourceList>("/item-pocket?limit=20"),
    staleTime: Infinity,
  });

  const pocketDetail = useQuery({
    queryKey: ["item-pocket", pocket],
    queryFn: () => pokeapi<ItemPocket>(`/item-pocket/${pocket}`),
    enabled: pocket !== "all",
    staleTime: Infinity,
  });

  const list = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    const allowed = pocketDetail.data
      ? new Set(pocketDetail.data.items.map((entry) => entry.name))
      : null;
    return (itemsQuery.data?.results ?? [])
      .filter((entry) => (term ? entry.name.includes(term) : true))
      .filter((entry) => (allowed ? allowed.has(entry.name) : true));
  }, [itemsQuery.data, pocketDetail.data, deferredSearch]);

  function updateFilter(callback: () => void) {
    callback();
    setVisible(PAGE_SIZE);
  }

  const loading = itemsQuery.isPending || (pocket !== "all" && pocketDetail.isPending);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Guía"
        title="Objetos"
        description="Encuentra objetos de combate, bayas, medicina y más. Filtra por bolsillo y descubre para qué sirve cada uno."
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-52 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm sm:max-w-xs">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => updateFilter(() => setSearch(event.target.value))}
            placeholder="Buscar objeto…"
            className="w-full bg-transparent outline-none"
          />
        </label>

        <select
          value={pocket}
          onChange={(event) => updateFilter(() => setPocket(event.target.value))}
          className="h-10 rounded-full border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary/50"
          aria-label="Filtrar por bolsillo"
        >
          <option value="all">Todos los bolsillos</option>
          {pocketsQuery.data?.results.map((entry) => (
            <option key={entry.name} value={entry.name}>
              {POCKET_LABELS[entry.name] ?? formatName(entry.name)}
            </option>
          ))}
        </select>

        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Package className="size-3.5" />
          {list.length} objetos
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.slice(0, visible).map((entry) => (
              <button
                key={entry.name}
                type="button"
                onClick={() => setSelected(entry.name)}
                className="group flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-14px_rgba(0,0,0,0.35)]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary/70">
                  <ItemIcon name={entry.name} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold group-hover:text-primary">
                    {formatName(entry.name)}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    Ver detalle
                  </span>
                </span>
              </button>
            ))}
          </div>

          {list.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No encontramos objetos con esos filtros.
            </p>
          )}

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

      <ItemDialog item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
