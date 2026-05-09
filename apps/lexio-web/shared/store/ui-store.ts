'use client';

/**
 * UI store — sidebar collapse state and other transient UI preferences.
 * Not persisted to localStorage (intentional — resets on refresh).
 */
import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
}));
