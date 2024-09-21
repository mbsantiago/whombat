import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";
import Description from "@/lib/components/ui/Description";
import { H3 } from "@/lib/components/ui/Headings";
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
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Description
              name="Name"
              value={evaluationSet?.name ?? ""}
              onChange={(name) => updateEvaluationSet({ name })}
              type="text"
              editable
            />
          </div>
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Description
              name="Description"
              value={evaluationSet?.description ?? ""}
              onChange={(description) => updateEvaluationSet({ description })}
              type="textarea"
              editable
            />
          </div>
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Description
              name="Created On"
              value={evaluationSet?.created_on}
              type="date"
            />
          </div>
        </dl>
      </div>
    </>
  );
}
