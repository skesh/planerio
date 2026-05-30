import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'

export interface UIState {
  sidebarOpen: boolean
  editProjectOpen: boolean
  activeIndex: number
  menuOpen: boolean
  todoOpen: 'add' | 'edit' | false
  editMode: 'normal' | 'edit'
  toggleSidebar: () => void
  setEditProject: (state: boolean) => void
  setActiveIndex: (index: number) => void
  toggleMenu: () => void
  setTodoOpen: (todoOpen: UIState['todoOpen']) => void
  setMode: (mode: UIState['editMode']) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  editProjectOpen: false,
  activeIndex: -1,
  menuOpen: false,
  todoOpen: false,
  editMode: 'normal',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  setEditProject: (editProjectOpen: boolean) => set({ editProjectOpen }),
  setActiveIndex: (index: number) => set({ activeIndex: index }),
  setTodoOpen: (todoOpen: UIState['todoOpen']) => set({ todoOpen }),
  setMode: (editMode: UIState['editMode']) => get().editMode !== editMode && set({ editMode }),
}))

export const useUiSelectors = () =>
  useUIStore(
    useShallow((s) => ({
      sidebarOpen: s.sidebarOpen,
      activeIndex: s.activeIndex,
      menuOpen: s.menuOpen,
      todoOpen: s.todoOpen,
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
      toggleMenu: s.toggleMenu,
      setTodoOpen: s.setTodoOpen,
      setMode: s.setMode,
    })),
  )
