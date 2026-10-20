import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TeamMember {
  name: string;
  moves: string[];
  item?: string;
  ability?: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

interface TeamsState {
  teams: Team[];
  createTeam: (name: string) => Team;
  renameTeam: (id: string, name: string) => void;
  deleteTeam: (id: string) => void;
  addMember: (teamId: string, member: TeamMember) => void;
  removeMember: (teamId: string, memberName: string) => void;
  updateMember: (
    teamId: string,
    memberName: string,
    updates: Partial<TeamMember>,
  ) => void;
  replaceAll: (teams: Team[]) => void;
}

function newId() {
  return crypto.randomUUID();
}

export const useTeamsStore = create<TeamsState>()(
  persist(
    (set) => ({
      teams: [],
      createTeam: (name) => {
        const team: Team = { id: newId(), name, members: [] };
        set((state) => ({ teams: [...state.teams, team] }));
        return team;
      },
      renameTeam: (id, name) => {
        set((state) => ({
          teams: state.teams.map((team) => (team.id === id ? { ...team, name } : team)),
        }));
      },
      deleteTeam: (id) => {
        set((state) => ({ teams: state.teams.filter((team) => team.id !== id) }));
      },
      addMember: (teamId, member) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId && team.members.length < 6
              ? { ...team, members: [...team.members, member] }
              : team,
          ),
        }));
      },
      removeMember: (teamId, memberName) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  members: team.members.filter((m) => m.name !== memberName),
                }
              : team,
          ),
        }));
      },
      updateMember: (teamId, memberName, updates) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId
              ? {
                  ...team,
                  members: team.members.map((m) =>
                    m.name === memberName ? { ...m, ...updates } : m,
                  ),
                }
              : team,
          ),
        }));
      },
      replaceAll: (teams) => set({ teams }),
    }),
    { name: "pokeguia-teams" },
  ),
);
