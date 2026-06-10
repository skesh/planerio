import AsyncStorage from "@react-native-async-storage/async-storage"
import type { StorageAdapter } from "@repo/core"

export class AsyncStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  }

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  }
}
