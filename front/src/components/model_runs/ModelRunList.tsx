import Empty from "@/components/Empty";
import {
  AddIcon,
  ModelIcon,
  UploadIcon,
  WarningIcon,
} from "@/components/icons";
import Search from "@/components/inputs/Search";
import Link from "@/components/Link";
import Pagination from "@/components/lists/Pagination";
import StackedList from "@/components/lists/StackedList";
import Loading from "@/components/Loading";
import ModelRun from "@/components/model_runs/ModelRun";
import useModelRuns from "@/hooks/api/useModelRuns";

import type { ModelRunFilter } from "@/api/model_runs";

function NoModelRunss() {
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
}: {
  filter?: ModelRunFilter;
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
          <Link mode="text" href="/evaluation/detail/model_runs/create/">
            <UploadIcon className="inline-block w-4 h-4 align-middle" /> Import
          </Link>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {items.length === 0 && <NoModelRunss />}
          <StackedList
            items={items.map((item) => (
              <ModelRun key={item.uuid} modelRun={item} />
            ))}
          />
          {pagination.numPages > 1 && <Pagination {...pagination} />}
        </>
      )}
    </div>
  );
}
