import { filterProject } from "@repo/core"
import { router, useLocalSearchParams } from "expo-router"
import { useMemo, useState } from "react"
import { Text, View } from "react-native"
import { TodoList } from "../../../src/shared/ui/TodoList"
import { syncFromServer } from "../../../src/services/authService"
import { useProjectSelectors, useTodoSelectors } from "../../../src/store"

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { projects } = useProjectSelectors()
  const { todos } = useTodoSelectors()
  const [refreshing, setRefreshing] = useState(false)

  const project = projects.find((p) => p.id === id)
  const items = useMemo(() => filterProject(todos, id ?? ""), [todos, id])

  async function handleRefresh() {
    setRefreshing(true)
    await syncFromServer()
    setRefreshing(false)
  }

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Project not found</Text>
      </View>
    )
  }

  return (
    <TodoList items={items} onPress={(t) => router.push(`/todo/${t.id}`)} refreshing={refreshing} onRefresh={handleRefresh} />
  )
}
