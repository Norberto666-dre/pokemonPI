import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 space-y-3", className)}>
      {eyebrow && (
        <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}

export function ErrorState({
  message = "No pudimos cargar la información.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <p className="text-sm font-medium text-destructive">{message}</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Revisa tu conexión o inténtalo de nuevo en unos segundos.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="mx-auto size-20 rounded-full" />
          <Skeleton className="mx-auto h-3 w-16" />
          <Skeleton className="mx-auto h-4 w-24" />
          <Skeleton className="mx-auto h-5 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}
