import { type ReactNode } from "react";
import { type KeyboardModifiers } from "react-hotkeys-hook/src/types";

/**
 * Renders a `<kbd>` element to visually represent a keyboard key.
 */
export function KBD({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-block px-1 font-mono rounded border bg-stone-900 border-stone-800 text-stone-300 dark:bg-stone-300 dark:border-stone-400 dark:text-stone-900">
      {children}
    </kbd>
  );
}

/**
 * Displays a combination of keyboard keys (e.g., "Ctrl+S") based on provided
 * modifiers and keys.
 */
export default function KeyboardKey({
  keys = [],
  ...modifiers
}: { keys?: readonly string[] } & KeyboardModifiers) {
  for (const key in modifiers) {
    if (modifiers[key as keyof KeyboardModifiers]) {
      keys = [key, ...keys];
    }
  }

  if (keys.length === 0) {
    return null;
  }

  if (keys.length === 1) {
    return <KBD>{keys[0]}</KBD>;
  }

  return (
    <kbd className="inline-flex gap-1 items-center text-stone-300 dark:test-stone-900">
      {keys
        ?.map<ReactNode>((key) => <KBD key={key}>{key}</KBD>)
        .reduce((prev, curr) => [prev, "+", curr])}
    </kbd>
  );
}
