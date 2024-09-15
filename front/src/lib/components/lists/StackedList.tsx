import { type Key, type ReactElement } from "react";

type ElementWithKey = ReactElement & { key: Key | null };

/**
  * StackedList component renders a list of React elements with keys.
1 */
export default function StackedList({
  items,
}: {
  /** An array of React elements with keys to be rendered in the list. */
  items: ElementWithKey[];
}) {
  return (
    <ul
      role="list"
      className="w-full divide-y divide-stone-300 dark:divide-stone-700"
    >
      {items.map((item) => (
        <li className="flex gap-x-6 justify-between py-5" key={item.key}>
          {item}
        </li>
      ))}
    </ul>
  );
}
