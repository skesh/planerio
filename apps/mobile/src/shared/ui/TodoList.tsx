import { defaultSort, type Todo } from "@repo/core"
import { useMemo } from "react"
import { FlatList, Pressable, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface TodoListProps {
  items: Todo[]
  onPress?: (todo: Todo) => void
}

export function TodoList({ items, onPress }: TodoListProps) {
  const { top } = useSafeAreaInsets()
  const sorted = useMemo(() => defaultSort(items), [items])

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingTop: top + 16, paddingHorizontal: 16, paddingBottom: 16 }}
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPress?.(item)}
          className="py-3 border-b border-gray-100 active:opacity-60"
        >
          <Text className="text-lg font-medium text-gray-900">{item.title}</Text>
          {item.description && <Text className="text-sm text-gray-500">{item.description}</Text>}
        </Pressable>
      )}
    />
  )
}
