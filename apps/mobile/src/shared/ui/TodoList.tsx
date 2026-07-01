import { defaultSort, type Todo } from "@repo/core"
import { useMemo, useRef, useState } from "react"
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native"
import { useTheme } from "../lib/theme"
import { useTodoActions } from "../../store"

interface TodoListProps {
  items: Todo[]
  onPress?: (todo: Todo) => void
  refreshing?: boolean
  onRefresh?: () => void
}

export function TodoList({ items, onPress, refreshing, onRefresh }: TodoListProps) {
  const { toggleDone } = useTodoActions()
  const { theme } = useTheme()
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

  const { colors } = useTheme()

  return (
    <FlatList
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
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
          <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
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
              <Text style={{ fontSize: 18, fontWeight: "500", color: colors.text }}>
                {item.title}
                {item.priority && <Text style={{ color: "#ef4444" }}> ★</Text>}
              </Text>
              {item.description && <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 2 }}>{item.description}</Text>}
            </Pressable>
          </View>
        )
      }}
    />
  )
}
