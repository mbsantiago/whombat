import {
  DescriptionData,
  DescriptionTerm,
  EditableDescriptionData,
} from "@/components/Description";
import { H3 } from "@/components/Headings";
import { Input, TextArea } from "@/components/inputs/index";
import useEvaluationSet from "@/lib/hooks/api/useEvaluationSet";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetUpdateForm({
  evaluationSet: initialData,
  onChange,
}: {
  evaluationSet: EvaluationSet;
  onChange?: (data: EvaluationSet) => void;
}) {
  const {
    data: evaluationSet,
    update: { mutate: updateEvaluationSet },
  } = useEvaluationSet({
    uuid: initialData.uuid,
    evaluationSet: initialData,
    onUpdate: onChange,
  });

  return (
    <>
      <div className="px-4 sm:px-0">
        <H3 className="text-center">Details</H3>
      </div>
      <div className="mt-4 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Name</DescriptionTerm>
            <EditableDescriptionData
              value={evaluationSet?.name}
              onChange={(name) => updateEvaluationSet({ name })}
              Input={Input}
              autoFocus
            >
              {evaluationSet?.name}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Description</DescriptionTerm>
            <EditableDescriptionData
              value={evaluationSet?.description}
              onChange={(description) =>
                updateEvaluationSet({ description: description || undefined })
              }
              rows={6}
              Input={TextArea}
              autoFocus
            >
              {evaluationSet?.description}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Created On</DescriptionTerm>
            <DescriptionData>
              {evaluationSet?.created_on.toLocaleString()}
            </DescriptionData>
          </div>
        </dl>
      </div>
    </>
  );
}
