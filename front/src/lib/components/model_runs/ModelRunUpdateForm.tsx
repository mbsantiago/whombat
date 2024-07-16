import { useCallback } from "react";

import Card from "@/lib/components/ui/Card";
import Description from "@/lib/components/ui/Description";
import DeleteModelRun from "@/lib/components/model_runs/ModelRunDelete";
import useModelRun from "@/app/hooks/api/useModelRun";

import type { ModelRunUpdate } from "@/lib/api/model_runs";
import type { ModelRun } from "@/lib/types";

export default function ModelRunUpdateForm(props: {
  modelRun: ModelRun;
  onDelete?: (data: Promise<ModelRun>) => void;
  onUpdate?: (data: Promise<ModelRun>) => void;
}) {
  const { onDelete, onUpdate } = props;

  const {
    data: modelRun,
    delete: { mutateAsync: deleteModelRun },
    update: { mutateAsync: updateModelRun },
  } = useModelRun({
    uuid: props.modelRun.uuid,
    modelRun: props.modelRun,
  });

  const handleDelete = useCallback(() => {
    const promise = deleteModelRun();
    onDelete?.(promise);
  }, [deleteModelRun, onDelete]);

  const handleUpdate = useCallback(
    (data: ModelRunUpdate) => {
      const promise = updateModelRun(data);
      onUpdate?.(promise);
    },
    [updateModelRun, onUpdate],
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2 justify-center">
        <DeleteModelRun onDelete={handleDelete} />
      </div>
      <Card>
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
            {modelRun?.name}
          </h3>
          <p className="text-xs text-stone-500">{modelRun?.version}</p>
        </div>
        <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
          <dl className="divide-y divide-stone-500">
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Description"
                value={modelRun?.description ?? ""}
                onChange={(description) => handleUpdate({ description })}
                type="textarea"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Imported On"
                value={modelRun?.created_on}
                type="date"
              />
            </div>
          </dl>
        </div>
      </Card>
    </div>
  );
}
