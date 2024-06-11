import { useHotkeys } from "react-hotkeys-hook";

import type { KeyShortcut } from "@/hooks/utils/useKeyFilter";

export const AUDIO_KEY_SHORTCUTS: KeyShortcut[] = [
  {
    label: "Play/Pause",
    shortcut: " ",
    description: "Play or pause the audio",
  },
];

export default function useAnnotateClipKeyShortcuts(props: {
  onTogglePlay: () => void;
  enabled?: boolean;
}) {
  const { onTogglePlay, enabled = true } = props;
  useHotkeys(" ", onTogglePlay, { enabled });
}
