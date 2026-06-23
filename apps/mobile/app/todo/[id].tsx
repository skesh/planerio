import { type Todo } from "@repo/core"
import { router, useLocalSearchParams } from "expo-router"
import { useRef } from "react"
import { Pressable, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTodoSelectors } from "../../src/store"
import { EditTodoForm } from "../../src/widgets/EditTodoForm"

export default function TodoPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { todos } = useTodoSelectors()
  const todo = todos.find((t: Todo) => t.id === id)
  const { top } = useSafeAreaInsets()
  const formRef = useRef<{ save: () => void }>(null)

  if (!todo) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-lg">Todo not found</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: top }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="p-1">
          <Text className="text-gray-500 text-lg">← Back</Text>
        </Pressable>
        <Text className="text-base font-semibold text-gray-900">Edit task</Text>
        <Pressable onPress={() => formRef.current?.save()} className="p-1">
          <Text className="text-blue-500 text-lg font-medium">Save</Text>
        </Pressable>
      </View>
      <EditTodoForm todo={todo} ref={formRef} onSave={() => router.back()} />
    </View>
  )
}
