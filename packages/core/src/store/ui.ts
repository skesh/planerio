import { create } from "zustand"
import { useShallow } from "zustand/shallow"

export type DrawerMode = "edit" | "add" | false

export interface UIState {
  sidebarOpen: boolean
  editProjectOpen: boolean
  activeIndex: number
  drawerOpen: DrawerMode
  editMode: "normal" | "edit"
  toggleSidebar: () => void
  setEditProject: (state: boolean) => void
  setActiveIndex: (index: number) => void
  setDrawerOpen: (mode: DrawerMode) => void
  setMode: (mode: UIState["editMode"]) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  editProjectOpen: false,
  activeIndex: -1,
  drawerOpen: false,
  todoDrawerMode: false,
  editMode: "normal",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setEditProject: (editProjectOpen: boolean) => set({ editProjectOpen }),
  setActiveIndex: (index: number) => set({ activeIndex: index }),
  setDrawerOpen: (mode: DrawerMode) => set({ drawerOpen: mode }),
  setMode: (editMode: UIState["editMode"]) => get().editMode !== editMode && set({ editMode }),
}))

export const useUiSelectors = () =>
  useUIStore(
    useShallow((s) => ({
      sidebarOpen: s.sidebarOpen,
      activeIndex: s.activeIndex,
      drawerOpen: s.drawerOpen,
      editMode: s.editMode,
      editProjectOpen: s.editProjectOpen,
    })),
  )

export const useUiActions = () =>
  useUIStore(
    useShallow((s) => ({
      toggleSidebar: s.toggleSidebar,
      setEditProject: s.setEditProject,
      setActiveIndex: s.setActiveIndex,
      setDrawerOpen: s.setDrawerOpen,
      setMode: s.setMode,
    })),
  )
