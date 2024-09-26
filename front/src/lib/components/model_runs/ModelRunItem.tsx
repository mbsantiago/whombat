import * as ui from "@/lib/components/ui";

import type * as types from "@/lib/types";

export default function ModelRunItem({
  modelRun,
  onClick,
}: {
  modelRun: types.ModelRun;
  onClick?: () => void;
}) {
  return (
    <li key={modelRun.uuid}>
      <div className="inline-flex gap-2 items-baseline">
        <ui.Button mode="text" padding="p-0" onClick={onClick}>
          {modelRun.name}
        </ui.Button>
        <span className="text-sm text-stone-500">{modelRun.version}</span>
      </div>
      <div className="text-xs text-stone-500">
        {modelRun.created_on.toLocaleString()}
      </div>
    </li>
  );
}
