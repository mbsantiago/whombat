import { useCallback } from "react";

import Card from "@/lib/components/Card";
import {
  DescriptionData,
  DescriptionTerm,
  EditableDescriptionData,
} from "@/lib/components/Description";
import { TextArea } from "@/lib/components/inputs/index";
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
          <p className="text-stone-500 text-xs">{modelRun?.version}</p>
        </div>
        <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
          <dl className="divide-y divide-stone-500">
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Description</DescriptionTerm>
              <EditableDescriptionData
                value={modelRun?.description}
                onChange={(value) =>
                  handleUpdate({ description: value as string })
                }
                Input={TextArea}
                autoFocus
              >
                {modelRun?.description}
              </EditableDescriptionData>
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Imported On</DescriptionTerm>
              <DescriptionData>
                {modelRun?.created_on.toLocaleString()}
              </DescriptionData>
            </div>
          </dl>
        </div>
      </Card>
    </div>
  );
}
