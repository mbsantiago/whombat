import { type Key, type ReactElement } from "react";

type ElementWithKey = ReactElement & { key: Key | null };

export default function StackedList({ items }: { items: ElementWithKey[] }) {
  return (
    <ul role="list" className="w-full divide-y divide-stone-300 dark:divide-stone-700">
      {items.map((item) => (
        <li className="flex justify-between gap-x-6 py-5" key={item.key}>
          {item}
        </li>
      ))}
    </ul>
  );
}
