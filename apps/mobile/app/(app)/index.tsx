import { Text, View } from "react-native"
import { useTodoSelectors } from "../../src/store"

export default function HomeScreen() {
  const { todos } = useTodoSelectors()

  return (
    <View className="flex-1 bg-white p-4">
      <Text>{todos.length}</Text>
      {todos?.map((todo) => (
        <View key={todo.id} className="py-3 border-b border-gray-100">
          <Text className="text-lg font-medium text-gray-900">{todo.title}</Text>
          {todo.description && <Text className="text-sm text-gray-500">{todo.description}</Text>}
        </View>
      ))}
    </View>
  )
}
