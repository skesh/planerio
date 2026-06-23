import { type Todo } from "@repo/core"
import { useLocalSearchParams } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTodoSelectors } from "../../src/store"

export default function TodoPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { todos } = useTodoSelectors()
  const todo = todos.find((t: Todo) => t.id === id)
  const { top } = useSafeAreaInsets()

  if (!todo) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-lg">Todo not found</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white px-4" style={{ paddingTop: top + 16 }}>
      <Text className="text-xl font-semibold text-gray-900 mb-4">{todo.title}</Text>

      {todo.description ? (
        <Text className="text-gray-700 mb-4">{todo.description}</Text>
      ) : null}

      <View className="gap-3">
        <Row label="Done" value={todo.done ? "Yes" : "No"} />
        <Row label="Priority" value={todo.priority ? "High" : "Normal"} />
        <Row label="Date" value={todo.date || "—"} />
        <Row label="Time" value={todo.time || "—"} />
        {todo.tags.length > 0 && <Row label="Tags" value={todo.tags.join(", ")} />}
        <Row label="Project ID" value={todo.projectId || "—"} />
        {todo.repeat && <Row label="Repeat" value={todo.repeat} />}
        {todo.dependsOn.length > 0 && (
          <Row label="Depends on" value={todo.dependsOn.join(", ")} />
        )}
      </View>
    </ScrollView>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="text-gray-500 w-24 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm flex-1">{value}</Text>
    </View>
  )
}
