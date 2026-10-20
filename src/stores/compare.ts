import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareState {
  compare: string[];
  toggle: (name: string) => void;
  remove: (name: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compare: [],
      toggle: (name) => {
        const current = get().compare;
        if (current.includes(name)) {
          set({ compare: current.filter((item) => item !== name) });
        } else if (current.length < 3) {
          set({ compare: [...current, name] });
        }
      },
      remove: (name) =>
        set((state) => ({ compare: state.compare.filter((item) => item !== name) })),
      clear: () => set({ compare: [] }),
    }),
    { name: "pokeguia-compare" },
  ),
);
