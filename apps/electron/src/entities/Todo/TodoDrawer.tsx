import { Todo } from "@repo/core"
import { useProjectSelectors } from '@/store/projectsStore'
import { useTodoSelectors } from '@/store/todosStore'
import { useMemo } from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/shared/ui/drawer'
import EditTodo from './EditTodo.tsx'

interface TodoDrawerProps {
  open: "edit" | "add" | false
  onClose: () => void
}

export default function TodoDrawer({ open, onClose }: TodoDrawerProps) {
  const { activeTodo } = useTodoSelectors()
  const { activeProjectId } = useProjectSelectors()

  const initialTodo = useMemo(() => {
    if (open === "edit") {
      return activeTodo ?? new Todo()
    }
    return new Todo({ projectId: activeProjectId ?? "" })
  }, [open, activeTodo, activeProjectId])

  return (
    <Drawer open={!!open} onClose={onClose}>
      <DrawerContent className="px-4 py-4">
        <DrawerHeader hidden={true}>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description</DrawerDescription>
        </DrawerHeader>

        <EditTodo todoOpen={open} initialTodo={initialTodo} onClose={onClose} />
      </DrawerContent>
    </Drawer>
  )
}
