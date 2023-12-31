import {
  type EvaluationSet,
  type EvaluationSetUpdate,
} from "@/api/evaluation_sets";
import {
  DescriptionData,
  DescriptionTerm,
  EditableDescriptionData,
} from "@/components/Description";
import { H3 } from "@/components/Headings";
import { Input, TextArea } from "@/components/inputs";

export default function EvaluationSetUpdateForm({
  evaluationSet,
  onChange,
}: {
  evaluationSet: EvaluationSet;
  onChange?: (data: EvaluationSetUpdate) => void;
}) {
  return (

    <>
      <div className="px-4 sm:px-0">
        <H3 className="text-center">
          Details
        </H3>
      </div>
      <div className="mt-4 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Name</DescriptionTerm>
            <EditableDescriptionData
              value={evaluationSet.name}
              onChange={(value) => onChange?.({ name: value })}
              Input={Input}
              autoFocus
            >
              {evaluationSet.name}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Description</DescriptionTerm>
            <EditableDescriptionData
              value={evaluationSet.description}
              onChange={(value) => onChange?.({ description: value })}
              rows={6}
              Input={TextArea}
              autoFocus
            >
              {evaluationSet.description}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Evaluation Mode</DescriptionTerm>
            <DescriptionData>
              {evaluationSet.mode}
            </DescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Created On</DescriptionTerm>
            <DescriptionData>
              {evaluationSet.created_at.toLocaleString()}
            </DescriptionData>
          </div>
        </dl>
      </div>
    </>
  )
}
