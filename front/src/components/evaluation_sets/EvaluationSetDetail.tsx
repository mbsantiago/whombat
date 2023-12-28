import { type EvaluationSetUpdate } from "@/api/evaluation_sets";
import Card from "@/components/Card";

import EvaluationSetActions from "./EvaluationSetActions";
import EvaluationSetOverview from "./EvaluationSetOverview";
import EvaluationSetUpdateForm from "./EvaluationSetUpdateForm";
import ModelEvaluationSummary from "./ModelEvaluationSummary";
import UserEvaluationSummary from "./UserEvaluationSummary";

import type { EvaluationSet } from "@/types";

export default function EvaluationSetDetail({
  evaluationSet,
  onChange,
  onDelete,
}: {
  evaluationSet: EvaluationSet;
  onChange?: (data: EvaluationSetUpdate) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="w-100 flex flex-row gap-8 justify-between">
      <div className="grow flex flex-col gap-4">
        <EvaluationSetOverview evaluationSet={evaluationSet} />
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <ModelEvaluationSummary evaluationSet={evaluationSet} />
          </Card>
          <Card>
            <UserEvaluationSummary evaluationSet={evaluationSet} />
          </Card>
        </div>
      </div>
      <div className="flex flex-col flex-none max-w-sm gap-4">
        <EvaluationSetActions onDelete={onDelete} />
        <div className="sticky top-8">
          <Card>
            <EvaluationSetUpdateForm
              evaluationSet={evaluationSet}
              onChange={onChange}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
