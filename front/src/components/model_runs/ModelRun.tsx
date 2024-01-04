import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ModelRun } from "@/types";
import Link from "@/components/Link";

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
    <div>
      <Link href={url} mode="text">{modelRun.name}</Link>
    </div>
  );
}
