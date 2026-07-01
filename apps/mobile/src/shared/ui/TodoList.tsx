import { defaultSort, type Todo } from "@repo/core"
import { useMemo, useRef, useState } from "react"
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native"
import { useTodoActions } from "../../store"

interface TodoListProps {
  items: Todo[]
  onPress?: (todo: Todo) => void
  refreshing?: boolean
  onRefresh?: () => void
}

export function TodoList({ items, onPress, refreshing, onRefresh }: TodoListProps) {
  const { toggleDone } = useTodoActions()
  const sorted = useMemo(() => defaultSort(items), [items])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const doneRef = useRef<Set<string>>(new Set())
  const [tick, forceUpdate] = useState(0)

  function ensureRender() {
    forceUpdate((n) => n + 1)
  }

  function handleToggle(id: string) {
    if (doneRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id))
      timersRef.current.delete(id)
      doneRef.current.delete(id)
      ensureRender()
      return
    }

    doneRef.current.add(id)
    ensureRender()

    const timer = setTimeout(() => {
      timersRef.current.delete(id)
      doneRef.current.delete(id)
      toggleDone(id)
      ensureRender()
    }, 5000)

    timersRef.current.set(id, timer)
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16 }}
      data={sorted}
      keyExtractor={(item) => item.id}
      extraData={[tick, refreshing]}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }
      renderItem={({ item }) => {
        const locallyDone = doneRef.current.has(item.id)
        return (
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <Pressable
              onPress={() => handleToggle(item.id)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: locallyDone ? "#22c55e" : "#d1d5db",
                backgroundColor: locallyDone ? "#22c55e" : "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {locallyDone && <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>✓</Text>}
            </Pressable>
            <Pressable onPress={() => onPress?.(item)} style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "500", color: "#111827" }}>
                {item.title}
                {item.priority && <Text style={{ color: "#ef4444" }}> ★</Text>}
              </Text>
              {item.description && <Text style={{ color: "#9ca3af", fontSize: 14, marginTop: 2 }}>{item.description}</Text>}
            </Pressable>
          </View>
        )
      }}
    />
  )
}
