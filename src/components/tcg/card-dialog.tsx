import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";

import { TypeBadge } from "@/components/shared/type-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tcgCard, type TcgCardSummary } from "@/lib/api/tcgdex";
import { cn } from "@/lib/utils";

export function cardImage(image: string | undefined, size: "low" | "high" = "low") {
  if (!image) return null;
  return `${image}/${size}.webp`;
}

export function TcgCardTile({
  card,
  onSelect,
  className,
}: {
  card: TcgCardSummary;
  onSelect?: (card: TcgCardSummary) => void;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = cardImage(card.image, "low");

  return (
    <button
      type="button"
      onClick={() => onSelect?.(card)}
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card p-2 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_36px_-24px_rgba(120,70,30,0.55)]",
        className,
      )}
    >
      <div className="relative aspect-[245/342] overflow-hidden rounded-xl bg-secondary">
        {src && !failed ? (
          <img
            src={src}
            alt={card.name}
            loading="lazy"
            onError={() => setFailed(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <Sparkles className="size-6" />
          </div>
        )}
      </div>
      <div className="space-y-1 px-1 pt-2 pb-1">
        <p className="truncate text-xs font-semibold">{card.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {card.set?.name ?? card.id} {card.rarity ? `· ${card.rarity}` : ""}
        </p>
      </div>
    </button>
  );
}

export function TcgCardDialog({
  card,
  open,
  onOpenChange,
}: {
  card: TcgCardSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["tcg-card", card?.id],
    queryFn: () => tcgCard(card!.id),
    enabled: Boolean(open && card),
    staleTime: Infinity,
  });

  const image = cardImage(data?.image ?? card?.image, "high");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{card?.name}</DialogTitle>
          <DialogDescription>
            {data?.set?.name ?? card?.set?.name ?? "Carta Pokémon TCG"}
            {data?.rarity ? ` · ${data.rarity}` : card?.rarity ? ` · ${card.rarity}` : ""}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-[240px_1fr]">
            {image && (
              <img
                src={image}
                alt={card?.name ?? "Carta"}
                className="mx-auto w-full max-w-60 rounded-xl shadow-lg"
              />
            )}
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {data?.types?.map((type) => (
                  <TypeBadge key={type} type={type} size="sm" />
                ))}
                {data?.hp && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                    {data.hp} PS
                  </span>
                )}
                {data?.stage && (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                    {data.stage}
                  </span>
                )}
              </div>

              {data?.description && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {data.description}
                </p>
              )}

              {data?.abilities?.map((ability) => (
                <div key={ability.name} className="rounded-xl border border-border p-3">
                  <p className="text-xs font-bold tracking-wide text-primary uppercase">
                    {ability.type}
                  </p>
                  <p className="text-sm font-semibold">{ability.name}</p>
                  <p className="text-xs text-muted-foreground">{ability.text ?? ability.effect}</p>
                </div>
              ))}

              {data?.attacks?.map((attack) => (
                <div key={attack.name} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{attack.name}</p>
                    {attack.damage && (
                      <span className="font-display text-lg font-semibold text-primary">
                        {attack.damage}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {attack.cost?.map((type, index) => (
                      <TypeBadge key={`${type}-${index}`} type={type} size="sm" showIcon={false} />
                    ))}
                  </div>
                  {(attack.effect || attack.text) && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {attack.effect ?? attack.text}
                    </p>
                  )}
                </div>
              ))}

              <dl className="grid grid-cols-2 gap-2 text-xs">
                {data?.illustrator && (
                  <div>
                    <dt className="text-muted-foreground">Ilustrador</dt>
                    <dd className="font-medium">{data.illustrator}</dd>
                  </div>
                )}
                {data?.retreat !== undefined && (
                  <div>
                    <dt className="text-muted-foreground">Retirada</dt>
                    <dd className="font-medium">{data.retreat}</dd>
                  </div>
                )}
                {data?.weaknesses?.length ? (
                  <div>
                    <dt className="text-muted-foreground">Debilidad</dt>
                    <dd className="flex gap-1 font-medium">
                      {data.weaknesses.map((weakness) => (
                        <TypeBadge key={weakness.type} type={weakness.type} size="sm" />
                      ))}
                    </dd>
                  </div>
                ) : null}
                {data?.regulationMark && (
                  <div>
                    <dt className="text-muted-foreground">Regulación</dt>
                    <dd className="font-medium">{data.regulationMark}</dd>
                  </div>
                )}
              </dl>

              <a
                href={`https://www.tcgdex.net/en/${data?.set?.id ?? ""}/${data?.localId ?? ""}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Ver en TCGdex <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
