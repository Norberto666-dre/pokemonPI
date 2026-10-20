import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Copy,
  Download,
  Loader2,
  Plus,
  Search,
  Shield,
  Swords,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { formatName } from "@/components/pokemon/pokemon-tile";
import { EmptyState, PageHeader } from "@/components/shared/states";
import { TypeBadge } from "@/components/shared/type-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showdownId, statTotal } from "@/lib/api/showdown";
import {
  defensiveProfile,
  useDexIndex,
  useShowdownLearnsets,
  useShowdownMoves,
  useShowdownPokedex,
  useTypeRelations,
} from "@/lib/hooks";
import {
  POKEMON_TYPES,
  SPRITE_ARTWORK,
  SPRITE_THUMB,
  TYPE_LABELS,
} from "@/lib/pokemon-types";
import { cn } from "@/lib/utils";
import { useTeamsStore, type Team, type TeamMember } from "@/stores/teams";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ExportDialog({
  team,
  open,
  onOpenChange,
}: {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: sd } = useShowdownPokedex();
  const copy = () => {
    void navigator.clipboard.writeText(JSON.stringify(team, null, 2));
    toast.success("Equipo copiado al portapapeles");
  };

  const paste = team.members
    .map((member) => {
      const entry = sd?.[showdownId(member.name)];
      const lines = [
        `${entry?.name ?? formatName(member.name)}${member.item ? ` @ ${member.item}` : ""}`,
        ...(member.ability ? [`Ability: ${member.ability}`] : []),
        ...member.moves.map((move) => `- ${formatName(move)}`),
      ];
      return lines.join("\n");
    })
    .join("\n\n");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Exportar equipo</DialogTitle>
          <DialogDescription>
            Descarga el JSON para respaldarlo o copia el formato de Showdown.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadJson(`${team.name.replace(/\s+/g, "-").toLowerCase()}.json`, team)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground"
          >
            <Download className="size-3.5" /> Descargar JSON
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold hover:border-primary/40 hover:text-primary"
          >
            <Copy className="size-3.5" /> Copiar JSON
          </button>
        </div>
        <div>
          <h3 className="mb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Formato Showdown
          </h3>
          <pre className="max-h-64 overflow-auto rounded-xl bg-secondary/60 p-3 text-xs leading-relaxed">
            {paste || "Añade Pokémon al equipo para generar el texto."}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [text, setText] = useState("");
  const replaceAll = useTeamsStore((state) => state.replaceAll);
  const teams = useTeamsStore((state) => state.teams);

  function importJson() {
    try {
      const parsed = JSON.parse(text) as Team | { teams?: Team[] } | Team[];
      const incoming: Team[] = Array.isArray(parsed)
        ? parsed
        : "teams" in parsed && Array.isArray((parsed as { teams?: Team[] }).teams)
          ? (parsed as { teams: Team[] }).teams
          : [parsed as Team];
      const valid = incoming.filter(
        (team) => team && typeof team.name === "string" && Array.isArray(team.members),
      );
      if (!valid.length) throw new Error("invalid");
      replaceAll([
        ...teams,
        ...valid.map((team) => ({
          ...team,
          id: team.id || crypto.randomUUID(),
          members: team.members.slice(0, 6).map((member) => ({
            name: member.name,
            moves: Array.isArray(member.moves) ? member.moves.slice(0, 4) : [],
            item: member.item,
            ability: member.ability,
          })),
        })),
      ]);
      toast.success(`${valid.length} equipo(s) importado(s)`);
      setText("");
      onOpenChange(false);
    } catch {
      toast.error("JSON inválido. Revisa el formato.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Importar equipo</DialogTitle>
          <DialogDescription>
            Pega el JSON exportado desde esta u otra guía. También acepta un objeto con la
            propiedad <code>teams</code>.
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={9}
          placeholder='{"name":"Mi equipo","members":[{"name":"pikachu","moves":["thunderbolt"]}]}'
          className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs outline-none focus:border-primary/50"
        />
        <button
          type="button"
          onClick={importJson}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          <Upload className="size-3.5" /> Importar
        </button>
      </DialogContent>
    </Dialog>
  );
}

function NewTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const createTeam = useTeamsStore((state) => state.createTeam);
  const navigate = useNavigate();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const team = createTeam(name.trim());
    setName("");
    onOpenChange(false);
    navigate(`/teams/${team.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nuevo equipo</DialogTitle>
          <DialogDescription>Ponle un nombre y empieza a fichar Pokémon.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Equipo tormenta"
            className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground"
          >
            Crear equipo
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TeamsPage() {
  const teams = useTeamsStore((state) => state.teams);
  const deleteTeam = useTeamsStore((state) => state.deleteTeam);
  const { data: dex } = useDexIndex();
  const [newOpen, setNewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Herramientas"
        title="Equipos"
        description="Arma equipos de hasta seis Pokémon, elige sus movimientos y revisa la cobertura de tipos."
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-3.5" /> Nuevo equipo
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Upload className="size-3.5" /> Importar
          </button>
          {teams.length > 0 && (
            <button
              type="button"
              onClick={() => downloadJson("pokeguia-teams.json", { teams })}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Download className="size-3.5" /> Exportar todo
            </button>
          )}
        </div>
      </PageHeader>

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin equipos todavía"
          description="Crea tu primer equipo y añade Pokémon desde la Pokédex completa."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="group relative rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <Link to={`/teams/${team.id}`} className="min-w-0">
                  <h2 className="truncate font-display text-lg font-semibold group-hover:text-primary">
                    {team.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {team.members.length}/6 Pokémon
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el equipo “${team.name}”?`)) {
                      deleteTeam(team.id);
                      toast.success("Equipo eliminado");
                    }
                  }}
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Eliminar equipo"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="mt-4 flex min-h-14 items-center gap-1">
                {team.members.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Equipo vacío</span>
                ) : (
                  team.members.map((member) => {
                    const entry = dex?.find((item) => item.name === member.name);
                    return (
                      <img
                        key={member.name}
                        src={SPRITE_THUMB(entry?.id ?? 0)}
                        alt={member.name}
                        title={formatName(member.name)}
                        loading="lazy"
                        className="size-12 object-contain [image-rendering:pixelated]"
                      />
                    );
                  })
                )}
              </div>

              <Link
                to={`/teams/${team.id}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Abrir equipo <ArrowUpRight className="size-3" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <NewTeamDialog open={newOpen} onOpenChange={setNewOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function MovePickerDialog({
  teamId,
  member,
  open,
  onOpenChange,
}: {
  teamId: string;
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: learnsets, isPending } = useShowdownLearnsets();
  const { data: moves } = useShowdownMoves();
  const updateMember = useTeamsStore((state) => state.updateMember);
  const [search, setSearch] = useState("");

  const options = useMemo(() => {
    if (!member || !learnsets) return [];
    const learnset = learnsets[showdownId(member.name)]?.learnset ?? {};
    const term = search.trim().toLowerCase();
    return Object.keys(learnset)
      .map((key) => ({
        key,
        name: moves?.[key]?.name ?? formatName(key),
        type: moves?.[key]?.type,
        power: moves?.[key]?.basePower ?? 0,
      }))
      .filter((option) => (term ? option.name.toLowerCase().includes(term) : true))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 120);
  }, [member, learnsets, moves, search]);

  function toggleMove(key: string) {
    if (!member) return;
    const selected = member.moves.includes(key);
    if (selected) {
      updateMember(teamId, member.name, {
        moves: member.moves.filter((move) => move !== key),
      });
    } else if (member.moves.length < 4) {
      updateMember(teamId, member.name, { moves: [...member.moves, key] });
    } else {
      toast.error("Máximo 4 movimientos por Pokémon");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Movimientos de {member ? formatName(member.name) : ""}
          </DialogTitle>
          <DialogDescription>
            Elige hasta 4. {member?.moves.length ?? 0}/4 seleccionados.
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar movimiento…"
            className="w-full bg-transparent outline-none"
          />
        </label>

        {isPending ? (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="grid max-h-80 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {options.map((option) => {
              const active = member?.moves.includes(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleMove(option.key)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent hover:bg-secondary",
                  )}
                >
                  <span className="truncate font-medium">{option.name}</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground tabular-nums">
                    {option.type && <TypeBadge type={option.type} size="sm" showIcon={false} />}
                    {option.power > 0 ? option.power : ""}
                  </span>
                </button>
              );
            })}
            {options.length === 0 && (
              <p className="col-span-full py-6 text-center text-xs text-muted-foreground">
                Sin movimientos para ese filtro.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TeamDetailPage() {
  const { id } = useParams();
  const team = useTeamsStore((state) => state.teams.find((entry) => entry.id === id));
  const renameTeam = useTeamsStore((state) => state.renameTeam);
  const deleteTeam = useTeamsStore((state) => state.deleteTeam);
  const addMember = useTeamsStore((state) => state.addMember);
  const removeMember = useTeamsStore((state) => state.removeMember);
  const navigate = useNavigate();

  const { data: dex } = useDexIndex();
  const { data: sd } = useShowdownPokedex();
  const { data: relations } = useTypeRelations();

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [moveMember, setMoveMember] = useState<TeamMember | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!dex || !search.trim()) return [];
    const term = search.trim().toLowerCase();
    const taken = new Set(team?.members.map((member) => member.name));
    return dex
      .filter((entry) => entry.name.includes(term) && !taken.has(entry.name))
      .slice(0, 10);
  }, [dex, search, team]);

  const analysis = useMemo(() => {
    if (!team || !relations) return null;
    const weakCount: Record<string, number> = {};
    const covered = new Set<string>();
    for (const member of team.members) {
      const entry = dex?.find((item) => item.name === member.name);
      if (!entry) continue;
      const profile = defensiveProfile(relations, entry.types);
      for (const weak of profile.weak) {
        weakCount[weak.type] = (weakCount[weak.type] ?? 0) + 1;
      }
      for (const attacking of entry.types) {
        for (const defending of POKEMON_TYPES) {
          if (!relations[attacking]) continue;
          const multiplier = relations[attacking].double_damage_to.some(
            (target) => target.name === defending,
          );
          if (multiplier) covered.add(defending);
        }
      }
    }
    const sharedWeak = Object.entries(weakCount)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);
    const uncovered = POKEMON_TYPES.filter((type) => !covered.has(type));
    return { sharedWeak, uncovered, covered };
  }, [team, relations, dex]);

  if (!team) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="font-display text-2xl">Equipo no encontrado</p>
        <p className="text-sm text-muted-foreground">
          Puede que se haya eliminado o que el enlace sea incorrecto.
        </p>
        <Link to="/teams" className="text-sm font-semibold text-primary hover:underline">
          Volver a equipos
        </Link>
      </div>
    );
  }

  const emptySlots = Math.max(0, 6 - team.members.length);

  return (
    <div className="space-y-6">
      <Link
        to="/teams"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Equipos
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <input
            ref={nameRef}
            value={team.name}
            onChange={(event) => renameTeam(team.id, event.target.value)}
            className="w-full max-w-lg rounded-lg bg-transparent font-display text-3xl font-semibold tracking-tight outline-none focus:bg-secondary/40 sm:text-4xl"
            aria-label="Nombre del equipo"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {team.members.length} de 6 Pokémon · Haz clic en el nombre para editarlo
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Download className="size-3.5" /> Exportar
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`¿Eliminar el equipo “${team.name}”?`)) {
                deleteTeam(team.id);
                toast.success("Equipo eliminado");
                navigate("/teams");
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Eliminar
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {team.members.map((member) => {
          const entry = dex?.find((item) => item.name === member.name);
          const sdEntry = sd?.[showdownId(member.name)];
          const total = sdEntry ? statTotal(sdEntry.baseStats) : 0;
          return (
            <div key={member.name} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start gap-3">
                <Link to={`/pokemon/${member.name}`} className="shrink-0">
                  <img
                    src={SPRITE_ARTWORK(entry?.id ?? 0)}
                    alt={formatName(member.name)}
                    className="size-20 object-contain"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/pokemon/${member.name}`}
                    className="block truncate font-display text-base font-semibold hover:text-primary"
                  >
                    {formatName(member.name)}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry?.types.map((type) => (
                      <TypeBadge key={type} type={type} size="sm" showIcon={false} />
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    BST {total} · {sdEntry?.tier ?? "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(team.id, member.name)}
                  className="grid size-7 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Quitar a ${formatName(member.name)}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {member.moves.map((move) => (
                  <span
                    key={move}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"
                  >
                    {formatName(move)}
                  </span>
                ))}
                {member.moves.length === 0 && (
                  <span className="text-[10px] text-muted-foreground">Sin movimientos</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMoveMember(member)}
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <Swords className="size-3" /> Elegir movimientos
              </button>
            </div>
          );
        })}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus className="size-5" />
            <span className="text-xs font-semibold">Añadir Pokémon</span>
          </button>
        ))}
      </section>

      {analysis && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Shield className="size-4 text-primary" /> Debilidades compartidas
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Tipos que golpean a dos o más miembros del equipo.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.sharedWeak.map(([type, count]) => (
                <span key={type} className="relative">
                  <TypeBadge type={type} size="md" />
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive px-1.5 text-[9px] font-bold text-white">
                    ×{count}
                  </span>
                </span>
              ))}
              {analysis.sharedWeak.length === 0 && (
                <p className="text-xs text-success">
                  ¡Buen equilibrio! No hay debilidades repetidas.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Swords className="size-4 text-primary" /> Cobertura ofensiva
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Tipos a los que el equipo puede golpear súper eficazmente con STAB.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {POKEMON_TYPES.filter((type) => analysis.covered.has(type)).map((type) => (
                <TypeBadge key={type} type={type} size="sm" />
              ))}
            </div>
            {analysis.uncovered.length > 0 && (
              <>
                <p className="mt-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Sin cobertura
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {analysis.uncovered.map((type) => (
                    <span
                      key={type}
                      className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {TYPE_LABELS[type]}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Añadir Pokémon</DialogTitle>
            <DialogDescription>
              Busca por nombre. Quedan {emptySlots} hueco(s) en el equipo.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pikachu, garchomp, dragapult…"
              className="w-full bg-transparent outline-none"
            />
          </label>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {suggestions.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  addMember(team.id, { name: entry.name, moves: [] });
                  toast.success(`${formatName(entry.name)} añadido`);
                  setSearch("");
                  setAddOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-secondary"
              >
                <img
                  src={SPRITE_THUMB(entry.id)}
                  alt=""
                  className="size-8 object-contain [image-rendering:pixelated]"
                  loading="lazy"
                />
                <span className="flex-1 truncate font-medium">{formatName(entry.name)}</span>
                <span className="flex gap-1">
                  {entry.types.map((type) => (
                    <TypeBadge key={type} type={type} size="sm" showIcon={false} />
                  ))}
                </span>
              </button>
            ))}
            {search.trim() && suggestions.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No encontramos ese Pokémon.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ExportDialog team={team} open={exportOpen} onOpenChange={setExportOpen} />
      <MovePickerDialog
        teamId={team.id}
        member={moveMember}
        open={Boolean(moveMember)}
        onOpenChange={(open) => !open && setMoveMember(null)}
      />
    </div>
  );
}
