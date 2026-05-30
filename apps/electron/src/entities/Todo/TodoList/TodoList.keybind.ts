import { useHotkeys } from "@/shared/hooks/useHotkeys";
import type { Todo } from "@/shared/model/todo";
import { useTodoActions, useTodoSelectors } from "@/store/todosStore";
import { useUiActions, useUiSelectors } from "@/store/uiStore";
import { useRef } from "react";

export function useTodoListKeybindings(todos: Todo[], activeIndex: number) {
  const lastKeyJPressAtRef = useRef(0);
  const { activeTodo, showDone } = useTodoSelectors();
  const { setActiveId, deleteActiveTodo, toggleDone, toggleShowDone } =
    useTodoActions();
  const { setTodoOpen } = useUiActions();
  const { menuOpen, editMode, todoOpen, sidebarOpen } = useUiSelectors();

  const hotkeysEnable =
    !todoOpen && !menuOpen && editMode === "normal" && !sidebarOpen;
  const hotkeysDeps = [todos, menuOpen, editMode, sidebarOpen, todoOpen];

  useHotkeys(
    "KeyJ",
    () => {
      if (todos.length === 0) return;
      const now = Date.now();
      if (now - lastKeyJPressAtRef.current < 100) return;
      lastKeyJPressAtRef.current = now;
      const next =
        activeIndex < todos.length - 1 && activeIndex !== -1
          ? activeIndex + 1
          : 0;
      setActiveId(todos[next].id);
    },
    [showDone, activeIndex, setActiveId, ...hotkeysDeps],
    { enabled: hotkeysEnable },
  );
  useHotkeys(
    "KeyK",
    () => {
      if (todos.length === 0) return;
      const now = Date.now();
      if (now - lastKeyJPressAtRef.current < 100) return;
      lastKeyJPressAtRef.current = now;
      const next = activeIndex > 0 ? activeIndex - 1 : todos.length - 1;
      setActiveId(todos[next].id);
    },
    [showDone, activeIndex, setActiveId, ...hotkeysDeps],
    { enabled: hotkeysEnable },
  );
  useHotkeys("KeyI", () => setTodoOpen("edit"), hotkeysDeps, {
    enabled: hotkeysEnable,
  });
  useHotkeys("G", () => setActiveId(todos[0].id), hotkeysDeps, {
    enabled: hotkeysEnable,
  });
  useHotkeys(
    "D",
    () => {
      deleteActiveTodo();
      moveActiveOnPrevTodoDone();
    },
    hotkeysDeps,
    { enabled: hotkeysEnable },
  );

  useHotkeys(
    "Space",
    () => {
      if (activeTodo) {
        moveActiveOnPrevTodoDone();
        toggleDone(activeTodo.id);
      }
    },
    hotkeysDeps,
    {
      enabled: hotkeysEnable,
    },
  );

  useHotkeys("KeyS", () => toggleShowDone(), hotkeysDeps, {
    enabled: hotkeysEnable,
  });

  useHotkeys("KeyO", () => setTodoOpen("add"), hotkeysDeps, {
    enabled: hotkeysEnable,
  });
  useHotkeys("Escape", () => setTodoOpen(false), hotkeysDeps, {
    enabled: !!todoOpen && editMode === "normal",
  });

  function moveActiveOnPrevTodoDone() {
    if (activeTodo?.done || showDone) return;
    const index = todos.findIndex((t) => t.id === activeTodo?.id);
    if (index && index > 0) setActiveId(todos[index - 1].id);
  }
}
