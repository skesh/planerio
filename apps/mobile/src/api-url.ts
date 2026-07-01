// Меняй IP здесь при тесте на телефоне — не требует пересборки
const DEV_API_URL = "http://192.168.1.99:3001"

import Constants from "expo-constants"

export function getApiUrl(): string {
  const src =
    Constants.expoConfig?.hostUri ||
    Constants.debuggerHost

  if (src) {
    const host = src.split(":")[0].replace(/^https?:\/\//, "")
    console.log("[DBG] API_URL:", `http://${host}:3001`, "(from:", src, ")")
    return `http://${host}:3001`
  }

  console.log("[DBG] API_URL:", DEV_API_URL, "(from api-url.ts)")
  return DEV_API_URL
}
