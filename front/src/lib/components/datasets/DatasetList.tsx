import DatasetComponent from "@/lib/components/datasets/Dataset";
import DatasetCreate from "@/lib/components/datasets/DatasetCreate";
import DatasetImport from "@/lib/components/datasets/DatasetImport";
import Dialog from "@/lib/components/Dialog";
import Empty from "@/lib/components/Empty";
import {
  AddIcon,
  DatasetIcon,
  UploadIcon,
  WarningIcon,
} from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import StackedList from "@/lib/components/lists/StackedList";
import Loading from "@/lib/components/Loading";
import useDatasets from "@/app/hooks/api/useDatasets";

import type { Dataset } from "@/lib/types";

/**
 * Component to display a message when no datasets are found.
 *
 * @returns JSX element providing information and guidance when no datasets are
 * found.
 */
function NoDatasets() {
  return (
    <Empty>
      <WarningIcon className="w-8 h-8 text-stone-500" />
      <p>No datasets found.</p>
      <p>
        To create a dataset, click on the
        <span className="text-emerald-500">
          <AddIcon className="inline-block mr-1 ml-2 w-4 h-4" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}

/**
 * Component to display a list of datasets along with search functionality,
 * create and import links.
 *
 * @returns JSX element displaying a list of datasets with search and
 * navigation options.
 */
export default function DatasetList(props: {
  onCreate?: (dataset: Promise<Dataset>) => void;
}) {
  const { onCreate } = props;
  const datasets = useDatasets();

  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search dataset..."
            value={datasets.filter.get("search")}
            // @ts-ignore
            onChange={(value) => datasets.filter.set("search", value)}
            onSubmit={() => datasets.filter.submit()}
            icon={<DatasetIcon />}
          />
        </div>
        <div className="h-full">
          <Dialog
            mode="text"
            title="Create Dataset"
            label={
              <>
                <AddIcon className="inline-block w-4 h-4 align-middle" /> Create
              </>
            }
          >
            {() => <DatasetCreate onCreate={onCreate} />}
          </Dialog>
        </div>
        <div className="h-full">
          <Dialog
            mode="text"
            title="Import a Dataset"
            label={
              <>
                <UploadIcon className="inline-block w-4 h-4 align-middle" />{" "}
                Import
              </>
            }
          >
            {() => <DatasetImport onCreate={onCreate} />}
          </Dialog>
        </div>
      </div>
      {datasets.isLoading ? (
        <Loading />
      ) : (
        <>
          {datasets.items.length === 0 && <NoDatasets />}
          <StackedList
            items={datasets.items.map((item) => (
              <DatasetComponent key={item.uuid} dataset={item} />
            ))}
          />
          {datasets.pagination.numPages > 1 && (
            <Pagination {...datasets.pagination} />
          )}
        </>
      )}
    </div>
  );
}
