import { useHotkeys } from "@/shared/hooks/useHotkeys";
import { useProjectActions, useProjectSelectors } from "@/store/projectsStore";
import { useUiActions, useUiSelectors } from "@/store/uiStore";

export function useSidebarKeybindings(
  index: number,
  setIndex: (result: number) => void,
  totalLength: number,
  onEnter: () => void,
) {
  const { sidebarOpen, editProjectOpen, editMode } = useUiSelectors();
  const { setEditProject } = useUiActions();
  const { activeProjectId } = useProjectSelectors();
  const { deleteById } = useProjectActions();

  const hotkeysEnable =
    sidebarOpen && !editProjectOpen && editMode === "normal";

  useHotkeys(
    "j",
    () => setIndex(index < totalLength - 1 ? index + 1 : 0),
    [sidebarOpen, editMode, editProjectOpen, index, totalLength],
    { enabled: hotkeysEnable },
  );

  useHotkeys(
    "k",
    () => setIndex(index > 0 ? index - 1 : totalLength - 1),
    [sidebarOpen, editMode, editProjectOpen, index, totalLength],
    { enabled: hotkeysEnable },
  );

  useHotkeys(
    "o",
    () => setEditProject(true),
    [sidebarOpen, editMode, editProjectOpen],
    {
      enabled: hotkeysEnable,
    },
  );

  useHotkeys(
    "D",
    () => (activeProjectId ? deleteById(activeProjectId) : undefined),
    [sidebarOpen, editMode, editProjectOpen],
    { enabled: hotkeysEnable },
  );

  useHotkeys("l", () => onEnter(), [sidebarOpen, editMode, editProjectOpen], {
    enabled: hotkeysEnable,
  });

  useHotkeys(
    "Escape",
    () => {
      if (editProjectOpen) {
        setEditProject(false);
      }
    },
    [sidebarOpen, editMode, editProjectOpen],
    {
      enabled: sidebarOpen && editMode === "normal" && editProjectOpen,
    },
  );
}
