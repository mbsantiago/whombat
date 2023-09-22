import { useCallback } from "react";
import { useKeyPressEvent } from "react-use";

export default function useAnnotateKeyShortcuts({
  send,
}: {
  send: (event: "DRAW" | "SELECT" | "DELETE" | "IDLE") => void;
  cond: boolean;
}) {
  const goToDrawing = useCallback(
    (event: KeyboardEvent) => {
      // Avoid triggering when typing in the text input
      if (event.target instanceof HTMLInputElement) return
      send("DRAW");
    },
    [send],
  );

  const goToSelecting = useCallback(
    (event: KeyboardEvent) => {
      // Avoid triggering when typing in the text input
      if (event.target instanceof HTMLInputElement) return
      send("SELECT");
    },
    [send],
  );

  const goToDeleting = useCallback(
    (event: KeyboardEvent) => {
      // Avoid triggering when typing in the text input
      if (event.target instanceof HTMLInputElement) return
      send("DELETE");
    },
    [send],
  );

  useKeyPressEvent("d", goToDeleting);
  useKeyPressEvent("a", goToDrawing);
  useKeyPressEvent("e", goToSelecting);
}
