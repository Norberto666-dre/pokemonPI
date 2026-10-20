import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { formatName } from "@/components/pokemon/pokemon-tile";
import { TypeBadge } from "@/components/shared/type-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { pokeapi, localizedNameOf, type Ability } from "@/lib/api/pokeapi";

export function AbilityChip({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["ability", name],
    queryFn: () => pokeapi<Ability>(`/ability/${name}`),
    enabled: open,
    staleTime: Infinity,
  });

  const flavor =
    data?.flavor_text_entries.find((entry) => entry.language.name === "es")?.flavor_text ??
    data?.flavor_text_entries[0]?.flavor_text ??
    null;
  const effect =
    data?.effect_entries.find((entry) => entry.language.name === "es")?.effect ??
    data?.effect_entries.find((entry) => entry.language.name === "en")?.effect ??
    null;
  const localized = data ? localizedNameOf(data.names) ?? formatName(data.name) : formatName(name);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold capitalize transition-colors hover:border-primary/40 hover:text-primary"
        >
          {formatName(name)}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{localized}</DialogTitle>
          <DialogDescription>
            Habilidad · {data ? formatName(data.generation.name) : "Pokémon"}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
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
            {data && data.pokemon.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Pokémon con esta habilidad
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.pokemon.slice(0, 16).map(({ pokemon, is_hidden }) => (
                    <Link
                      key={pokemon.name}
                      to={`/pokemon/${pokemon.name}`}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] capitalize transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {formatName(pokemon.name)}
                      {is_hidden && <span className="ml-1 text-[9px] text-primary">oculta</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AbilityRow({ ability, hidden }: { ability: string; hidden?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <AbilityChip name={ability} />
      {hidden && <span className="text-[10px] font-medium text-muted-foreground">oculta</span>}
    </div>
  );
}

export { TypeBadge };
