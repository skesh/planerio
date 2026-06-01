import { Todo } from "@repo/core"
import { create } from "zustand"
import { useShallow } from "zustand/shallow"

export interface TodoState {
  items: Todo[]
  activeId: string | null
  isFiltred: boolean
  initialized: boolean
  showDone: boolean
  initialize: () => Promise<void>
  reset: () => void
  setItems: (items: Todo[]) => void
  setActiveId: (index: string | null) => void
  addItem: (item: Todo) => void
  editItemById: (id: string, item: Todo) => void
  deleteActiveTodo: () => void
  toggleDone: (id: string) => void
  toggleFilter: () => void
  toggleShowDone: () => void
}

export const useTodoStore = create<TodoState>((set, get) => ({
  items: [],
  activeId: null,
  initialized: false,
  isFiltred: true,
  showDone: false,

  initialize: async () => {
    if (get().initialized) return
    set({ initialized: true })
    const items = (await window.ipcRenderer.store.get("items")) as Todo[]
    set({ items: (items || []).map((i) => new Todo(i)) })
  },

  reset: () => set({ initialized: false, items: [], activeId: null }),

  setItems: (items: Todo[]) => {
    set({ items })
    window.ipcRenderer.store.set("items", items)
  },

  addItem: (item: Todo) => {
    const { items, setItems } = get()
    setItems([...items, new Todo(item)])
  },

  editItemById: (id: string, item: Todo) => {
    const { items, setItems } = get()
    const newItem = new Todo(item)
    newItem.updatedAt = new Date().toISOString()
    const newArr = [...items].map((i) => (i.id === id ? newItem : i))
    setItems(newArr)
  },

  setActiveId: (activeId: string | null) => set({ activeId }),

  deleteActiveTodo: () => {
    const { activeId, items, setItems } = get()
    setItems(items.filter((item) => item.id !== activeId))
  },

  toggleDone: (id: string) => {
    const { editItemById, items, addItem } = get()
    const todo = items.find((i) => i.id === id)
    if (todo) {
      if (todo.repeat && !todo.done) {
        addItem(todo.repeatNext())
      }
      editItemById(
        id,
        new Todo({
          ...todo,
          done: !todo.done,
          doneDate: todo.done ? "" : new Date().toISOString(),
        }),
      )
    }
  },

  toggleShowDone: () => set((state) => ({ showDone: !state.showDone })),
  toggleFilter: () => set((state) => ({ isFiltred: !state.isFiltred })),
}))

export const useTodoActions = () =>
  useTodoStore(
    useShallow((s) => ({
      setItems: s.setItems,
      addItem: s.addItem,
      editItemById: s.editItemById,
      setActiveId: s.setActiveId,
      deleteActiveTodo: s.deleteActiveTodo,
      toggleFilter: s.toggleFilter,
      toggleDone: s.toggleDone,
      toggleShowDone: s.toggleShowDone,
    })),
  )

export const useTodoSelectors = () =>
  useTodoStore(
    useShallow((s) => ({
      todos: s.items,
      activeTodo: s.items.find((i) => i.id === s.activeId),
      showDone: s.showDone,
    })),
  )
