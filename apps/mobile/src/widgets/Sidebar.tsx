import { useAuthSelectors } from "@repo/core"
import { nanoid } from "nanoid/non-secure"
import { useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { logout, switchAccount, syncFromServer } from "../services/authService"
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
  const { activeAccount, accounts } = useAuthSelectors()

  const [name, setName] = useState("")
  const [adding, setAdding] = useState(false)
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    await syncFromServer()
    setSyncing(false)
  }

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
        <Text className="text-white font-semibold">Planner</Text>
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

      <View className="px-4 py-3 border-t border-gray-700">
        {activeAccount ? (
          <>
            <Text className="text-gray-400 text-sm">{activeAccount.email}</Text>
            {accounts.length > 1 && (
              <Pressable
                onPress={() => {
                  const others = accounts.filter((a) => a.id !== activeAccount.id)
                  Alert.alert("Switch account", undefined, [
                    ...others.map((a) => ({
                      text: a.email,
                      onPress: () => switchAccount(a.id),
                    })),
                    { text: "Cancel", style: "cancel" },
                  ])
                }}
                className="mt-1"
              >
                <Text className="text-gray-500 text-xs">Switch account</Text>
              </Pressable>
            )}
            <Pressable onPress={handleSync} className="mt-1 flex-row items-center" disabled={syncing}>
              {syncing ? (
                <ActivityIndicator size={12} color="#6b7280" style={{ marginRight: 6 }} />
              ) : null}
              <Text className="text-gray-500 text-xs">{syncing ? "Syncing..." : "Sync"}</Text>
            </Pressable>
            <Pressable onPress={logout} className="mt-1">
              <Text className="text-red-400 text-xs">Logout</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text className="text-gray-500 text-sm">Гостевой режим</Text>
            <Pressable onPress={() => onNavigate("/login")} className="mt-1">
              <Text className="text-blue-400 text-xs">Login</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  )
}
