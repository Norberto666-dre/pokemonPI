import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (name) => {
        const current = get().favorites;
        set({
          favorites: current.includes(name)
            ? current.filter((item) => item !== name)
            : [name, ...current],
        });
      },
      isFavorite: (name) => get().favorites.includes(name),
    }),
    { name: "pokeguia-favorites" },
  ),
);

interface HistoryState {
  history: string[];
  pushHistory: (name: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      pushHistory: (name) => {
        set((state) => ({
          history: [name, ...state.history.filter((item) => item !== name)].slice(
            0,
            12,
          ),
        }));
      },
      clearHistory: () => set({ history: [] }),
    }),
    { name: "pokeguia-history" },
  ),
);
