import EvaluationSetActions from "@/lib/components/evaluation_sets/EvaluationSetActions";
import EvaluationSetOverview from "@/lib/components/evaluation_sets/EvaluationSetOverview";
import EvaluationSetUpdateForm from "@/lib/components/evaluation_sets/EvaluationSetUpdateForm";
import ModelEvaluationSummary from "@/lib/components/evaluation_sets/ModelEvaluationSummary";
import UserEvaluationSummary from "@/lib/components/evaluation_sets/UserEvaluationSummary";
import DetailLayout from "@/lib/components/layouts/Detail";
import Card from "@/lib/components/ui/Card";
import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetDetail({
  evaluationSet,
  onChange,
  onDelete,
}: {
  evaluationSet: EvaluationSet;
  onChange?: (evaluationSet: EvaluationSet) => void;
  onDelete?: () => void;
}) {
  return (
    <DetailLayout
      Actions={
        <EvaluationSetActions
          evaluationSet={evaluationSet}
          onDelete={onDelete}
        />
      }
      SideBar={
        <Card>
          <EvaluationSetUpdateForm
            evaluationSet={evaluationSet}
            onChange={onChange}
          />
        </Card>
      }
      MainContent={
        <div className="flex flex-col gap-4 grow">
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
      }
    />
  );
}
