import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt=""
      aria-hidden="true"
      className={cn("h-8 w-auto object-contain", className)}
    />
  );
}
