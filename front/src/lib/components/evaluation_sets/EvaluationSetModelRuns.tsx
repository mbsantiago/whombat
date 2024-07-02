import { useMemo, useCallback } from "react";
import ModelRunList from "@/lib/components/model_runs/ModelRunList";
import type { EvaluationSet, ModelRun } from "@/lib/types";
import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";

export default function EvaluationSetModelRuns(props: {
  evaluationSet: EvaluationSet;
  onCreate: (data: Promise<ModelRun>) => void;
  openImport: boolean;
}) {
  const { evaluationSet, onCreate, openImport = false } = props;

  const {
    addModelRun: { mutateAsync: addModelRun },
  } = useEvaluationSet({
    uuid: evaluationSet.uuid,
    evaluationSet,
  });

  const filter = useMemo(
    () => ({ evaluation_set: evaluationSet }),
    [evaluationSet],
  );

  const handleCreate = useCallback(
    (data: Promise<ModelRun>) => {
      data.then((modelRun) => addModelRun(modelRun));
      onCreate?.(data);
    },
    [addModelRun, onCreate],
  );

  return (
    <ModelRunList
      filter={filter}
      openImport={openImport}
      onCreate={handleCreate}
    />
  );
}
