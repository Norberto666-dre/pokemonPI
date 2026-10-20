import {
  Flame,
  Gamepad2,
  GitCompareArrows,
  Heart,
  Layers,
  LayoutGrid,
  Package,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Pokédex", icon: LayoutGrid, end: true },
  { to: "/types", label: "Tipos", icon: Flame },
  { to: "/moves", label: "Movimientos", icon: Swords },
  { to: "/items", label: "Objetos", icon: Package },
  { to: "/abilities", label: "Habilidades", icon: Sparkles },
  { to: "/generations", label: "Generaciones", icon: Layers },
  { to: "/cards", label: "Cartas TCG", icon: Gamepad2 },
  { to: "/compare", label: "Comparar", icon: GitCompareArrows },
  { to: "/teams", label: "Equipos", icon: Users },
  { to: "/favorites", label: "Favoritos", icon: Heart },
];
