import { cn } from "@/shared/lib/utils";
import { useUiActions } from "@/store/uiStore";
import { useEffect, useRef, useState } from "react";

function hasActiveEditableElement() {
  const active = document.activeElement as HTMLElement | null;
  if (!active) return false;

  const tag = active.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || active.isContentEditable;
}

function Textarea({
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: React.ComponentProps<"textarea">) {
  const [focused, setFocused] = useState(false);
  const isFocusedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { setMode } = useUiActions();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    if (document.activeElement === el) {
      isFocusedRef.current = true;
      setFocused(true);
      setMode("edit");
    }
  }, [setMode]);

  useEffect(() => {
    return () => {
      if (isFocusedRef.current) {
        requestAnimationFrame(() => {
          if (!hasActiveEditableElement()) {
            setMode("normal");
          }
        });
      }
    };
  }, [setMode]);

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      data-focused={focused}
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          e.currentTarget.blur();
          setMode("normal");
          isFocusedRef.current = false;
        }
        onKeyDown?.(e);
      }}
      onFocus={(e) => {
        onFocus?.(e);
        isFocusedRef.current = true;
        setFocused(true);
        setMode("edit");
      }}
      onBlur={(e) => {
        onBlur?.(e);
        isFocusedRef.current = false;
        setFocused(false);
        setMode("normal");
      }}
      {...props}
    />
  );
}

export { Textarea };
