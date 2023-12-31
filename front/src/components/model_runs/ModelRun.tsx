import type { ModelRun } from "@/types";

export default function ModelRun({ modelRun }: { modelRun: ModelRun }) {
  return <div>{modelRun.name}</div>;
}
