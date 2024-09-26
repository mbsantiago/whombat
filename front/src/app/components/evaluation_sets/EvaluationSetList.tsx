import Pagination from "@/app/components/Pagination";
import EvaluationSetCreate from "@/app/components/evaluation_sets/EvaluationSetCreate";
import EvaluationSetImport from "@/app/components/evaluation_sets/EvaluationSetImport";

import useEvaluationSets from "@/app/hooks/api/useEvaluationSets";

import EvaluationSetListBase from "@/lib/components/evaluation_sets/EvaluationSetList";
import { EvaluationIcon } from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetList(props: {
  onCreateEvaluationSet?: (evaluationSet: EvaluationSet) => void;
  onClickEvaluationSet?: (evaluationSet: EvaluationSet) => void;
}) {
  const { items, pagination, filter, isLoading } = useEvaluationSets();

  return (
    <EvaluationSetListBase
      evaluationSets={items}
      isLoading={isLoading}
      onClickEvaluationSet={props.onClickEvaluationSet}
      Pagination={<Pagination pagination={pagination} />}
      Import={
        <EvaluationSetImport
          onImportEvaluationSet={props.onCreateEvaluationSet}
        />
      }
      Search={
        <Search
          label="Search"
          placeholder="Search evaluation sets..."
          value={filter.get("search")}
          onChange={(value) => filter.set("search", value as string)}
          onSubmit={filter.submit}
          icon={<EvaluationIcon />}
        />
      }
      Create={
        <EvaluationSetCreate
          onCreateEvaluationSet={props.onCreateEvaluationSet}
        />
      }
    />
  );
}
