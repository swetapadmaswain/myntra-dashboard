import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FilterState, TabKey } from '@/types';

interface DashboardStore {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  source: null,
  sentiment: null,
  hesitation_driver: null,
  searchQuery: '',
  page: 1,
  limit: 20,
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      tab: 'friction',
      setTab: (tab) => set({ tab }),
      filters: initialFilters,
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value, page: 1 },
        })),
      resetFilters: () => set({ filters: initialFilters }),
    }),
    { name: 'dashboard-filters' }
  )
);
