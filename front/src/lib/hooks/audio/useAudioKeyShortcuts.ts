import { useHotkeys } from "react-hotkeys-hook";

export const AUDIO_KEY_SHORTCUTS = [
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
