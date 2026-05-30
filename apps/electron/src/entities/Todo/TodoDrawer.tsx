import { Todo } from '@/shared/model/todo.ts'
import { useProjectSelectors } from '@/store/projectsStore'
import { useTodoSelectors } from '@/store/todosStore'
import { useUiSelectors } from '@/store/uiStore'
import { useMemo } from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/shared/ui/drawer'
import EditTodo from './EditTodo.tsx'

export default function TodoDrawer() {
  const { activeTodo } = useTodoSelectors()
  const { todoOpen } = useUiSelectors()
  const { activeProjectId } = useProjectSelectors()

  const initialTodo = useMemo(() => {
    if (todoOpen === "edit") {
      return activeTodo ?? new Todo()
    }
    return new Todo({ projectId: activeProjectId ?? "" })
  }, [todoOpen, activeTodo, activeProjectId])

  return (
    <Drawer open={!!todoOpen}>
      <DrawerContent className="px-4 py-4">
        <DrawerHeader hidden={true}>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description</DrawerDescription>
        </DrawerHeader>

        <EditTodo todoOpen={todoOpen} initialTodo={initialTodo} />
      </DrawerContent>
    </Drawer>
  )
}
