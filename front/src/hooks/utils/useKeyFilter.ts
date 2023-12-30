import { useCallback } from "react";

export type KeyShortcut = {
  label: string;
  shortcut: string;
  description: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

export default function useKeyFilter({
  key,
  enabled = true,
  preventDefault = false,
  stopPropagation = false,
}: {
  key: string;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}): (event: KeyboardEvent) => boolean {
  return useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return false;
      const { target } = event;

      // Avoid firing these events when typing in a text field
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement
      )
        return false;

      if (event.key !== key) {
        return false;
      }

      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
      return true;
    },
    [key, enabled, preventDefault, stopPropagation],
  );
}
