import useModelRuns from "@/app/hooks/api/useModelRuns";

import Empty from "@/lib/components/Empty";
import {
  AddIcon,
  ModelIcon,
  UploadIcon,
  WarningIcon,
} from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import StackedList from "@/lib/components/lists/StackedList";
import ModelRunComponent from "@/lib/components/model_runs/ModelRun";
import ModelRunImport from "@/lib/components/model_runs/ModelRunImport";
import Dialog from "@/lib/components/ui/Dialog";
import Loading from "@/lib/components/ui/Loading";

import type { ModelRunFilter } from "@/lib/api/model_runs";
import type { ModelRun } from "@/lib/types";

function NoModelRuns() {
  return (
    <Empty>
      <WarningIcon className="w-8 h-8 text-stone-500" />
      <p>No model runs found.</p>
      <p>
        To create a model run click on the{" "}
        <span className="text-emerald-500">
          <AddIcon className="inline-block mr-1 ml-2 w-4 h-4" />
          Import{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}

export default function ModelRunsList({
  filter: initialFilter,
  onCreate,
  openImport = false,
}: {
  filter?: ModelRunFilter;
  onCreate?: (data: Promise<ModelRun>) => void;
  openImport?: boolean;
}) {
  const { items, isLoading, filter, pagination } = useModelRuns({
    filter: initialFilter,
    fixed: Object.keys(initialFilter || {}) as Array<keyof ModelRunFilter>,
  });

  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search dataset..."
            value={filter.get("search")}
            onChange={(value) => filter.set("search", value as string)}
            onSubmit={() => filter.submit()}
            icon={<ModelIcon />}
          />
        </div>
        <div className="h-full">
          <Dialog
            mode="text"
            title="Import a Model Run"
            open={openImport}
            label={
              <>
                <UploadIcon className="inline-block w-4 h-4 align-middle" />{" "}
                Import
              </>
            }
          >
            {() => <ModelRunImport onCreate={onCreate} />}
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {items.length === 0 && <NoModelRuns />}
          <StackedList
            items={items.map((item) => (
              <ModelRunComponent key={item.uuid} modelRun={item} />
            ))}
          />
          {pagination.numPages > 1 && <Pagination {...pagination} />}
        </>
      )}
    </div>
  );
}
