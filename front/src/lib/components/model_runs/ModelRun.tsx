import { GoToIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";

import type { ModelRun } from "@/lib/types";

export default function ModelRun({
  modelRun,
  onClick,
}: {
  modelRun: ModelRun;
  onClick?: () => void;
}) {
  return (
    <Card className="w-full">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-stone-500">Model</span>
          <span className="font-thin">{modelRun.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-stone-500">Version</span>
          <span className="font-thin">{modelRun.version}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-stone-500">Description</span>
          <span className="font-thin">{modelRun.description}</span>
        </div>
        <div className="flex flex-col justify-center h-full">
          <Button onClick={onClick} mode="text">
            View
            <GoToIcon className="w-6 h-6 ms-2" />
          </Button>
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <span className="text-xs text-stone-500">
          created on {modelRun.created_on.toLocaleString()}
        </span>
      </div>
    </Card>
  );
}
