import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, Search, Shuffle } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { formatName } from "@/components/pokemon/pokemon-tile";
import { TypeBadge } from "@/components/shared/type-badge";
import { useDexIndex } from "@/lib/hooks";
import { NAV_ITEMS } from "@/lib/nav";
import { SPRITE_THUMB } from "@/lib/pokemon-types";

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: dex } = useDexIndex();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    if (!dex) return [];
    const term = query.trim().toLowerCase();
    if (!term) {
      return dex.filter((entry) => entry.id <= 24).slice(0, 24);
    }
    const numeric = /^#?\d+$/.test(term);
    return dex
      .filter((entry) =>
        numeric
          ? String(entry.id) === term.replace("#", "").replace(/^0+(?=\d)/, "")
          : entry.name.replace(/-/g, " ").includes(term.replace(/\s+/g, " "))
            || entry.name.includes(term),
      )
      .slice(0, 30);
  }, [dex, query]);

  function go(path: string) {
    onOpenChange(false);
    navigate(path);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar Pokémon"
      description="Busca un Pokémon por nombre o número, o salta a una sección."
      className="sm:max-w-xl"
    >
      <CommandInput
        placeholder="Pikachu, 25, tipos, objetos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[min(420px,60vh)]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-1 py-6 text-sm text-muted-foreground">
            <Search className="size-5" />
            Sin resultados para “{query}”
          </div>
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading={query ? "Pokémon" : "Pokémon populares"}>
            {results.map((entry) => (
              <CommandItem
                key={entry.id}
                value={`${entry.name} ${entry.id}`}
                onSelect={() => go(`/pokemon/${entry.name}`)}
                className="gap-3"
              >
                <img
                  src={SPRITE_THUMB(entry.id)}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  className="size-9 object-contain"
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{formatName(entry.name)}</span>
                  <span className="block text-[11px] text-muted-foreground tabular-nums">
                    #{String(entry.id).padStart(3, "0")}
                  </span>
                </span>
                <span className="flex gap-1">
                  {entry.types.map((type) => (
                    <TypeBadge key={type} type={type} size="sm" showIcon={false} />
                  ))}
                </span>
                <CornerDownLeft className="size-3.5 text-muted-foreground/60" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Acciones">
          <CommandItem
            value="aleatorio random sorpresa"
            onSelect={() => {
              if (!dex?.length) return;
              const random = dex[Math.floor(Math.random() * dex.length)];
              go(`/pokemon/${random.name}`);
            }}
          >
            <Shuffle className="size-4 text-primary" />
            Pokémon aleatorio
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ir a">
          {NAV_ITEMS.filter((item) => item.to !== "/").map((item) => (
            <CommandItem
              key={item.to}
              value={`${item.label} ${item.to}`}
              onSelect={() => go(item.to)}
            >
              <item.icon className="size-4 text-primary" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function openSearch() {
  window.dispatchEvent(new CustomEvent("pokeguia:search"));
}

export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      } else if (event.key === "/" && !isTyping) {
        event.preventDefault();
        onOpen();
      }
    };
    const onCustom = () => onOpen();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pokeguia:search", onCustom);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pokeguia:search", onCustom);
    };
  }, [onOpen]);
}
