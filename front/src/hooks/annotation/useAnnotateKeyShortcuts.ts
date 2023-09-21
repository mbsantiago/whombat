import { useCallback } from "react";
import { useKeyPressEvent } from "react-use";

export default function useAnnotateKeyShortcuts({
  send,
  cond,
}: {
  send: (event: "DRAW" | "SELECT" | "DELETE" | "IDLE") => void;
  cond: boolean;
}) {
  const goToDrawing = useCallback(() => {
    send("DRAW");
  }, [send]);

  const goToSelecting = useCallback(() => {
    send("SELECT");
  }, [send]);

  const goToIdle = useCallback(() => {
    if (!cond) {
      send("IDLE");
    }
  }, [send, cond]);

  const goToDeleting = useCallback(() => {
    send("DELETE");
  }, [send]);

  // Keyboard shortcuts
  useKeyPressEvent("d", goToDeleting, goToIdle);

  useKeyPressEvent("a", goToDrawing, goToIdle);

  useKeyPressEvent("e", goToSelecting, goToIdle);
}
