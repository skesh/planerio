import { filterProject } from "@repo/core"
import { useLocalSearchParams } from "expo-router"
import { useMemo } from "react"
import { Text, View } from "react-native"
import { TodoList } from "../../../src/shared/ui/TodoList"
import { useProjectSelectors, useTodoSelectors } from "../../../src/store"

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { projects } = useProjectSelectors()
  const { todos } = useTodoSelectors()

  const project = projects.find((p) => p.id === id)
  const items = useMemo(() => filterProject(todos, id ?? ""), [todos, id])

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Project not found</Text>
      </View>
    )
  }

  return <TodoList items={items} />
}
