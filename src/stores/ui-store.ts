import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  /** Admin sidebar icon-rail collapse (persisted). */
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandMenuOpen: boolean;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandMenuOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      commandMenuOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),
    }),
    {
      name: 'neet.ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
