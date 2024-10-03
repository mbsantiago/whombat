import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";

import EvaluationSetUpdateFormBase from "@/lib/components/evaluation_sets/EvaluationSetUpdateForm";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetUpdateForm({
  evaluationSet: initialData,
  onChange,
}: {
  evaluationSet: EvaluationSet;
  onChange?: (data: EvaluationSet) => void;
}) {
  const {
    data,
    update: { mutate: updateEvaluationSet },
  } = useEvaluationSet({
    uuid: initialData.uuid,
    evaluationSet: initialData,
    onUpdate: onChange,
  });

  return (
    <EvaluationSetUpdateFormBase
      evaluationSet={data || initialData}
      onChange={updateEvaluationSet}
    />
  );
}
