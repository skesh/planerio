import type { StorageAdapter } from "@repo/core"

export class ElectronStorageAdapter implements StorageAdapter {
  get<T>(key: string): Promise<T | null> {
    return window.ipcRenderer.store.get(key) as Promise<T | null>
  }
  set<T>(key: string, value: T): Promise<void> {
    return window.ipcRenderer.store.set(key, value)
  }
}
