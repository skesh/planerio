import { createContext, useCallback, useContext, useState } from "react"
import { Appearance, View } from "react-native"

type Theme = "dark" | "light"

export interface ThemeColors {
  bg: string
  text: string
  textMuted: string
  border: string
}

const light: ThemeColors = {
  bg: "#ffffff",
  text: "#111827",
  textMuted: "#9ca3af",
  border: "#f3f4f6",
}

const dark: ThemeColors = {
  bg: "#030712",
  text: "#f3f4f6",
  textMuted: "#6b7280",
  border: "#1f2937",
}

interface ThemeContextValue {
  theme: Theme
  colors: ThemeColors
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  colors: light,
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)

const system: Theme = Appearance.getColorScheme() === "dark" ? "dark" : "light"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(system)
  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const colors = theme === "dark" ? dark : light

  return (
    <ThemeContext.Provider value={{ theme, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
