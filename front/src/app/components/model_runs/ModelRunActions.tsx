import { useCallback } from "react";
import toast from "react-hot-toast";

import useModelRun from "@/app/hooks/api/useModelRun";

import ModelRunActionsBase from "@/lib/components/model_runs/ModelRunActions";

import type { ModelRun } from "@/lib/types";

export default function ModelRunActions({
  modelRun,
  onDeleteModelRun,
}: {
  modelRun: ModelRun;
  onDeleteModelRun: (modelRun: ModelRun) => void;
}) {
  const {
    data = modelRun,
    delete: { mutateAsync: deleteModelRun },
  } = useModelRun({
    uuid: modelRun.uuid,
    modelRun: modelRun,
    onDelete: onDeleteModelRun,
  });

  const handleDelete = useCallback(async () => {
    toast.promise(deleteModelRun(), {
      loading: "Deleting model run...",
      success: "Model run deleted",
      error: "Failed to delete model",
    });
  }, [deleteModelRun]);

  return (
    <ModelRunActionsBase modelRun={data} onDeleteModelRun={handleDelete} />
  );
}
