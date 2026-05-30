import { useHotkeys } from "@/shared/hooks/useHotkeys";
import { useUiActions, useUiSelectors } from "@/store/uiStore";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function useGlobalKeybindings() {
  const { toggleSidebar } = useUiActions();
  const { editMode, todoOpen, sidebarOpen } = useUiSelectors();

  const navigate = useNavigate();

  useHotkeys("KeyH", () => toggleSidebar(), [editMode, todoOpen], {
    enabled: !todoOpen && editMode === "normal" && !sidebarOpen,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyH") {
        e.preventDefault();
        window.ipcRenderer.invoke("window:minimize");
        return;
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [navigate]);
}
