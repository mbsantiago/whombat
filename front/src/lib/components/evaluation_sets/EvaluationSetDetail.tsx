import Card from "@/components/Card";
import EvaluationSetActions from "@/components/evaluation_sets/EvaluationSetActions";
import EvaluationSetOverview from "@/components/evaluation_sets/EvaluationSetOverview";
import EvaluationSetUpdateForm from "@/components/evaluation_sets/EvaluationSetUpdateForm";
import ModelEvaluationSummary from "@/components/evaluation_sets/ModelEvaluationSummary";
import UserEvaluationSummary from "@/components/evaluation_sets/UserEvaluationSummary";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetDetail({
  evaluationSet,
  onChange,
  onDelete,
}: {
  evaluationSet: EvaluationSet;
  onChange?: (evaluationSet: EvaluationSet) => void;
  onDelete?: (evaluationSet: Promise<EvaluationSet>) => void;
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
        <EvaluationSetActions
          evaluationSet={evaluationSet}
          onDelete={onDelete}
        />
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
