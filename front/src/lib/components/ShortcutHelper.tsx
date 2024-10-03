import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { HelpIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import { DialogOverlay } from "@/lib/components/ui/Dialog";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";

import type { Shortcut } from "@/lib/types";

export default function ShortcutHelper({
  shortcuts,
}: {
  shortcuts?: Shortcut[];
} = {}) {
  const [show, setShow] = useState(false);
  useHotkeys("h", () => setShow((v) => !v));

  return (
    <>
      <Button
        mode="text"
        variant="info"
        type="button"
        onClick={() => setShow(true)}
      >
        <HelpIcon className="inline-block w-4 h-4 align-middle" />
      </Button>
      <DialogOverlay
        title="Keyboard Shortcuts"
        isOpen={show}
        onClose={() => setShow(false)}
      >
        {() => (
          <table className="border border-collapse table-auto border-stone-500">
            <thead>
              <tr>
                <th className="p-1 text-center border border-stone-500">Key</th>
                <th className="p-1 text-center border border-stone-500">
                  Action
                </th>
                <th className="p-1 text-center border border-stone-500">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 text-center border border-stone-500">
                  <KeyboardKey keys={["h"]} />
                </td>
                <td className="p-2 font-bold text-center border border-stone-500">
                  Help
                </td>
                <td className="p-2 text-left border border-stone-500">
                  Show this help.
                </td>
              </tr>
              {shortcuts?.map((shortcut) => (
                <tr key={shortcut.shortcut}>
                  <td className="p-2 text-center border border-stone-500">
                    <KeyboardKey keys={[shortcut.shortcut.trim() || "Space"]} />
                  </td>
                  <td className="p-2 font-bold text-center border border-stone-500">
                    {shortcut.label}
                  </td>
                  <td className="p-2 text-left border border-stone-500">
                    {shortcut.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogOverlay>
    </>
  );
}
