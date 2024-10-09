import * as ui from "@/lib/components/ui";

import type { EvaluationSet, EvaluationSetUpdate } from "@/lib/types";

export default function EvaluationSetUpdateForm({
  evaluationSet,
  onChange,
}: {
  evaluationSet: EvaluationSet;
  onChange?: (data: EvaluationSetUpdate) => void;
}) {
  return (
    <ui.Card>
      <div className="px-4 sm:px-0">
        <ui.H3 className="text-center">Details</ui.H3>
      </div>
      <div className="mt-4 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="py-6 px-4 sm:px-0">
            <ui.Description
              name="Name"
              value={evaluationSet?.name ?? ""}
              onChange={(name) => onChange?.({ name })}
              type="text"
              editable
            />
          </div>
          <div className="py-6 px-4 sm:px-0">
            <ui.Description
              name="Description"
              value={evaluationSet?.description ?? ""}
              onChange={(description) => onChange?.({ description })}
              type="textarea"
              editable
            />
          </div>
          <div className="py-6 px-4 sm:px-0">
            <ui.Description
              name="Created On"
              value={evaluationSet?.created_on}
              type="date"
            />
          </div>
        </dl>
      </div>
    </ui.Card>
  );
}
