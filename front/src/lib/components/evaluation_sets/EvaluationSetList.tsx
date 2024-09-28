import EvaluationSetComponent from "@/lib/components/evaluation_sets/EvaluationSet";
import { AddIcon, UploadIcon, WarningIcon } from "@/lib/components/icons";
import Dialog from "@/lib/components/ui/Dialog";
import Empty from "@/lib/components/ui/Empty";

import type { EvaluationSet, Tag } from "@/lib/types";

import ListLayout from "../layouts/List";

export default function EvaluationSets({
  evaluationSets,
  isLoading = false,
  onClickEvaluationSet,
  onClickEvaluationSetTag,
  Search,
  Create,
  Import,
  Pagination,
}: {
  evaluationSets: EvaluationSet[];
  isLoading?: boolean;
  onClickEvaluationSet?: (dataset: EvaluationSet) => void;
  onClickEvaluationSetTag?: (tag: Tag) => void;
  Search: JSX.Element;
  Create: JSX.Element;
  Import: JSX.Element;
  Pagination: JSX.Element;
}) {
  return (
    <ListLayout
      isLoading={isLoading}
      isEmpty={evaluationSets.length === 0}
      Search={Search}
      Empty={<NoEvaluationSets />}
      Actions={[
        <Dialog
          key="create"
          mode="text"
          title="Create Evaluation Set"
          label={
            <>
              <AddIcon className="inline-block w-4 h-4 align-middle" /> Create
            </>
          }
        >
          {() => Create}
        </Dialog>,
        <Dialog
          key="import"
          mode="text"
          title="Import an Evaluation Set"
          label={
            <>
              <UploadIcon className="inline-block w-4 h-4 align-middle" />{" "}
              Import
            </>
          }
        >
          {() => Import}
        </Dialog>,
      ]}
      Pagination={Pagination}
      items={evaluationSets.map((item) => (
        <EvaluationSetComponent
          key={item.uuid}
          evaluationSet={item}
          onClickEvaluationSet={() => onClickEvaluationSet?.(item)}
          onClickEvaluationSetTag={onClickEvaluationSetTag}
        />
      ))}
    />
  );
}

function NoEvaluationSets() {
  return (
    <Empty>
      <WarningIcon className="w-8 h-8 text-stone-500" />
      <p>No evaluation sets found.</p>
      <p>
        To create an evaluation set, click on the
        <span className="text-emerald-500">
          <AddIcon className="inline-block mr-1 ml-2 w-4 h-4" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}
