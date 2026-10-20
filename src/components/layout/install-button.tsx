import { Download, Share, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useInstallPrompt } from "@/lib/use-install-prompt";

export function InstallButton() {
  const { canInstall, isIOS, isStandalone, install } = useInstallPrompt();

  if (isStandalone || !canInstall) return null;

  if (isIOS) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Instalar aplicación"
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <Download className="size-[18px]" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <Smartphone className="size-5 text-primary" /> Instalar PokéGuía
            </DialogTitle>
            <DialogDescription>
              En iPhone o iPad se instala desde el menú de compartir de Safari.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                1
              </span>
              <span className="flex items-center gap-1.5">
                Toca el botón <strong>Compartir</strong>{" "}
                <Share className="inline size-4 text-primary" /> en la barra de Safari.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                2
              </span>
              <span>
                Desplázate y elige <strong>“Añadir a pantalla de inicio”</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                3
              </span>
              <span>
                Confirma en <strong>“Añadir”</strong>. ¡Listo, ya tienes PokéGuía como
                app!
              </span>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    );
  }

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === "accepted") {
      toast.success("¡Instalando PokéGuía!");
    } else if (outcome === "dismissed") {
      toast("Puedes instalarla cuando quieras desde este botón.");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleInstall}
          aria-label="Instalar aplicación"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Download className="size-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Instalar app</TooltipContent>
    </Tooltip>
  );
}
