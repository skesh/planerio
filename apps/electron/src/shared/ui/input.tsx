import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { useUiActions } from "@/store/uiStore"

function hasActiveEditableElement() {
  const active = document.activeElement as HTMLElement | null
  if (!active) return false

  const tag = active.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable
}

function Input({
  className,
  type,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: React.ComponentProps<"input">) {
  const isFocusedRef = React.useRef(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { setMode } = useUiActions()

  React.useEffect(() => {
    const el = inputRef.current
    if (!el) return

    if (document.activeElement === el) {
      isFocusedRef.current = true
      setMode("edit")
    }
  }, [setMode])

  React.useEffect(() => {
    return () => {
      if (isFocusedRef.current) {
        requestAnimationFrame(() => {
          if (!hasActiveEditableElement()) {
            setMode("normal")
          }
        })
      }
    }
  }, [setMode])

  return (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation()
          e.currentTarget.blur()
          setMode("normal")
          isFocusedRef.current = false
        }
        onKeyDown?.(e)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        isFocusedRef.current = true
        setMode("edit")
      }}
      onBlur={(e) => {
        onBlur?.(e)
        isFocusedRef.current = false
        setMode("normal")
      }}
      {...props}
    />
  )
}

export { Input }
