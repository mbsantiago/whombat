import { useCallback } from "react";
import { useKeyPressEvent } from "react-use";

export default function useAnnotateKeyShortcuts({
  send,
}: {
  send: (
    event:
      | { type: "DRAW" }
      | { type: "SELECT" }
      | { type: "DELETE" }
      | { type: "IDLE" },
  ) => void;
  cond: boolean;
}) {
  const goToDrawing = useCallback(
    (event: KeyboardEvent) => {
      // Avoid triggering when typing in the text input
      if (event.target instanceof HTMLInputElement) return;
      send({ type: "DRAW" });
    },
    [send],
  );

  const goToSelecting = useCallback(
    (event: KeyboardEvent) => {
      // Avoid triggering when typing in the text input
      if (event.target instanceof HTMLInputElement) return;
      send({ type: "SELECT" });
    },
    [send],
  );

  const goToDeleting = useCallback(
    (event: KeyboardEvent) => {
      // Avoid triggering when typing in the text input
      if (event.target instanceof HTMLInputElement) return;
      send({ type: "DELETE" });
    },
    [send],
  );

  const goToIdle = useCallback(
    (event: KeyboardEvent) => {
      // Avoid triggering when typing in the text input
      if (event.target instanceof HTMLInputElement) return;
      send({ type: "IDLE" });
    },
    [send],
  );

  useKeyPressEvent("d", goToDeleting);
  useKeyPressEvent("a", goToDrawing);
  useKeyPressEvent("e", goToSelecting);
  useKeyPressEvent("Escape", goToIdle);
}
