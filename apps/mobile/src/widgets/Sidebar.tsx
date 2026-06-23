import { useAuthStore } from "@repo/core"
import { nanoid } from "nanoid"
import { useState } from "react"
import { Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useProjectActions, useProjectSelectors } from "../store"

const STATIC_NAV = [
  { id: "home", name: "Home", route: "/(app)" },
  { id: "inbox", name: "Inbox", route: "/(app)/inbox" },
  { id: "repeats", name: "Repeats", route: "/(app)/repeats" },
]

interface SidebarProps {
  onNavigate: (route: string) => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { top, bottom } = useSafeAreaInsets()
  const { projects } = useProjectSelectors()
  const { addProject } = useProjectActions()
  const activeAccountId = useAuthStore((s) => s.activeAccountId)

  const [name, setName] = useState("")
  const [adding, setAdding] = useState(false)

  function submitProject() {
    if (name.trim()) {
      addProject({ id: nanoid(), name, description: "" })
      setName("")
      setAdding(false)
    }
  }

  return (
    <View
      className="flex-1 bg-gray-900"
      style={{ paddingTop: top + 16, paddingBottom: bottom + 16 }}
    >
      <View className="px-4 py-3 border-b border-gray-700">
        <Text className="text-white font-semibold">
          {activeAccountId ? "Planner" : "Гостевой режим"}
        </Text>
      </View>

      <ScrollView className="flex-1 px-3 py-4">
        <Text className="text-xs font-medium text-gray-400 uppercase mb-2 px-2">Navigation</Text>
        {STATIC_NAV.map((item) => (
          <Pressable
            key={item.id}
            className="py-2.5 px-3 rounded-lg active:bg-gray-700"
            onPress={() => onNavigate(item.route)}
          >
            <Text className="text-white text-base">{item.name}</Text>
          </Pressable>
        ))}

        <Text className="text-xs font-medium text-gray-400 uppercase mt-6 mb-2 px-2">Projects</Text>
        {projects
          .filter((p) => p.id !== "inbox")
          .map((item) => (
            <Pressable
              key={item.id}
              className="py-2.5 px-3 rounded-lg active:bg-gray-700"
              onPress={() => onNavigate(`/(app)/project/${item.id}`)}
            >
              <Text className="text-white text-base">{item.name}</Text>
            </Pressable>
          ))}

        {adding ? (
          <TextInput
            className="bg-gray-800 text-white px-3 py-2.5 rounded-lg mt-2 text-base"
            placeholder="Project name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            onSubmitEditing={submitProject}
            autoFocus
            onBlur={() => {
              if (!name.trim()) setAdding(false)
            }}
          />
        ) : (
          <Pressable
            className="py-2.5 px-3 rounded-lg active:bg-gray-700 mt-1"
            onPress={() => setAdding(true)}
          >
            <Text className="text-gray-400 text-base">+ Add project</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}
