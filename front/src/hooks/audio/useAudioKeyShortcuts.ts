import { useKeyPressEvent } from "react-use";

import useKeyFilter from "@/hooks/utils/useKeyFilter";

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
  useKeyPressEvent(
    useKeyFilter({ enabled, key: " ", preventDefault: true }),
    onTogglePlay,
  );
}
