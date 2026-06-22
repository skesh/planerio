import { useRouter } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native"
import { login } from "../src/services/authService"

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    if (!email || !password) return
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      router.replace("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка входа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 justify-center px-6">
      <Text className="text-2xl font-semibold text-gray-900 mb-8">Planner</Text>

      <View className="gap-3">
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900"
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900"
          placeholder="Пароль"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {error && <Text className="text-red-500 text-sm mt-3">{error}</Text>}

      <Pressable
        className="mt-6 bg-gray-900 rounded-lg py-3.5 items-center active:opacity-80"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-medium text-base">Войти</Text>
        )}
      </Pressable>
    </View>
  )
}
