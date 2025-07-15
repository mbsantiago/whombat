import { type Hotkey } from "react-hotkeys-hook/src/types";

import KeyboardKey from "./KeyboardKey";

export default function ShortcutsList({
  shortcuts,
}: {
  shortcuts: Omit<Hotkey, "hotkey">[];
}) {
  return (
    <table className="rounded-md border border-collapse table-auto border-stone-500 text-stone-800 dark:text-stone-200">
      <thead className="bg-stone-200 dark:bg-stone-700">
        <tr>
          <th className="p-1 text-center border border-stone-500 text-stone-900 dark:text-stone-100">
            Key
          </th>
          <th className="p-1 text-center border border-stone-500 text-stone-900 dark:text-stone-100">
            Description
          </th>
        </tr>
      </thead>
      <tbody>
        {shortcuts?.map(({ keys, description, ...modifiers }, index) => (
          <tr key={index}>
            <td className="p-2 text-center border border-stone-500">
              <KeyboardKey keys={keys} {...modifiers} />
            </td>
            <td className="p-2 text-left border border-stone-500">
              {description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
