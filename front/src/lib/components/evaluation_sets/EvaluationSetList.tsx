import Loading from "@/app/loading";
import Dialog from "@/lib/components/Dialog";
import Empty from "@/lib/components/Empty";
import EvaluationSetComponent from "@/lib/components/evaluation_sets/EvaluationSet";
import EvaluationSetCreate from "@/lib/components/evaluation_sets/EvaluationSetCreate";
import EvaluationSetImport from "@/lib/components/evaluation_sets/EvaluationSetImport";
import {
  AddIcon,
  TasksIcon,
  UploadIcon,
  WarningIcon,
} from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import StackedList from "@/lib/components/lists/StackedList";
import useEvaluationSets from "@/lib/hooks/api/useEvaluationSets";

import type { EvaluationSet } from "@/lib/types";

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

export default function EvaluationSets(props: {
  onCreate?: (evaluationSet: Promise<EvaluationSet>) => void;
}) {
  const { onCreate } = props;
  const { items, pagination, filter, isLoading } = useEvaluationSets();

  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search evaluation set..."
            value={filter.get("search")}
            onChange={(value) => filter.set("search", value as string)}
            onSubmit={() => filter.submit()}
            icon={<TasksIcon />}
          />
        </div>
        <div className="h-full">
          <Dialog
            mode="text"
            title="Import an Evaluation Set"
            label={
              <>
                <UploadIcon className="inline-block w-4 h-4 align-middle" />{" "}
                Import
              </>
            }
          >
            {() => <EvaluationSetImport onCreate={onCreate} />}
          </Dialog>
        </div>
        <div className="h-full">
          <Dialog
            mode="text"
            title="Create Evaluation Set"
            label={
              <>
                <AddIcon className="inline-block w-4 h-4 align-middle" /> Create
              </>
            }
          >
            {() => <EvaluationSetCreate onCreate={onCreate} />}
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {items.length === 0 && <NoEvaluationSets />}
          <StackedList
            items={items.map((item) => (
              <EvaluationSetComponent key={item.uuid} evaluationSet={item} />
            ))}
          />
          {items.length > 0 && <Pagination {...pagination} />}
        </>
      )}
    </div>
  );
}
