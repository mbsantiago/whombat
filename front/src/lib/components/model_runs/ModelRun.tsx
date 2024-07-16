import { useMemo } from "react";
import Card from "@/lib/components/ui/Card";
import { useSearchParams } from "next/navigation";
import type { ModelRun } from "@/lib/types";
import Link from "@/lib/components/ui/Link";
import { GoToIcon } from "@/lib/components/icons";

export default function ModelRun({ modelRun }: { modelRun: ModelRun }) {
  const params = useSearchParams();

  const url = useMemo(() => {
    const search = new URLSearchParams(params);
    search.set("model_run_uuid", modelRun.uuid);
    const url = new URL("/evaluation/detail/model_run/", window.location.href);
    url.search = search.toString();
    return url;
  }, [params, modelRun.uuid]);

  return (
    <Card className="w-full">
      <div className="flex flex-row gap-4">
        <div className="flex flex-col">
          <span className="text-stone-500 text-sm">Model</span>
          <span className="font-thin">{modelRun.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-stone-500 text-sm">Version</span>
          <span className="font-thin">{modelRun.version}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-stone-500 text-sm">Description</span>
          <span className="font-thin">{modelRun.description}</span>
        </div>
        <div className="flex flex-col h-full justify-center">
          <Link href={url} mode="text">
            View
            <GoToIcon className="w-6 h-6 ms-2" />
          </Link>
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <span className="text-stone-500 text-xs">
          created on {modelRun.created_on.toLocaleString()}
        </span>
      </div>
    </Card>
  );
}
