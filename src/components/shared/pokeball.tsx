import { cn } from "@/lib/utils";

export function Pokeball({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <circle cx="24" cy="24" r="21" fill="currentColor" fillOpacity="0.14" />
      <path
        d="M3.4 24a20.6 20.6 0 0 1 41.2 0H31.2a7.2 7.2 0 0 0-14.4 0H3.4Z"
        fill="currentColor"
      />
      <path
        d="M3.4 24a20.6 20.6 0 0 0 41.2 0H31.2a7.2 7.2 0 0 1-14.4 0H3.4Z"
        fill="currentColor"
        fillOpacity="0.35"
      />
      <circle cx="24" cy="24" r="20.6" stroke="currentColor" strokeWidth="2" />
      <path d="M3.4 24h41.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="7.2" fill="var(--background)" />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="24" cy="24" r="2.2" fill="currentColor" />
    </svg>
  );
}
