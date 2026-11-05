import { useState } from "react";

import { tcgLogoCandidates } from "@/lib/api/tcgdex";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function TcgSetLogo({
  logo,
  name,
  className,
  imgClassName,
}: {
  logo?: string | null;
  name: string;
  className?: string;
  imgClassName?: string;
}) {
  const candidates = tcgLogoCandidates(logo);
  const [attempt, setAttempt] = useState(0);
  const src = candidates[attempt];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        onError={() => setAttempt((current) => current + 1)}
        className={cn("object-contain", imgClassName, className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-xl bg-secondary font-display text-sm font-semibold text-muted-foreground",
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
