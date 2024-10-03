import toast from "react-hot-toast";

import useModelRun from "@/app/hooks/api/useModelRun";

import ModelRunUpdateBase from "@/lib/components/model_runs/ModelRunUpdate";

import type { ModelRun } from "@/lib/types";

export default function ModelRunUpdateForm(props: {
  modelRun: ModelRun;
  onUpdate?: (data: ModelRun) => void;
}) {
  const { data = props.modelRun, update } = useModelRun({
    uuid: props.modelRun.uuid,
    modelRun: props.modelRun,
    onUpdate: (data) => {
      toast.success("Model run updated");
      props.onUpdate?.(data);
    },
  });

  return <ModelRunUpdateBase modelRun={data} onUpdate={update.mutate} />;
}
