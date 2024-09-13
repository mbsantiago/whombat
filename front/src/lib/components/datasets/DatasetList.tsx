import { type ComponentProps } from "react";
import DatasetComponent from "@/lib/components/datasets/Dataset";
import DatasetCreate from "@/lib/components/datasets/DatasetCreate";
import DatasetImport from "@/lib/components/datasets/DatasetImport";
import Dialog from "@/lib/components/ui/Dialog";
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
import Loading from "@/lib/components/ui/Loading";

import type { Dataset } from "@/lib/types";

/**
 * Component to display a list of datasets along with search functionality,
 * create and import links.
 *
 * @returns JSX element displaying a list of datasets with search and
 * navigation options.
 */
export default function DatasetList({
  datasets,
  isLoading = false,
  onChangeQuery,
  onSumbitQuery,
  ...props
}: {
  datasets: Dataset[];
  isLoading?: boolean;
  onChangeQuery?: (query: string) => void;
  onSumbitQuery?: () => void;
  onClickDataset?: (dataset: Dataset) => void;
} & ComponentProps<typeof DatasetCreate> &
  ComponentProps<typeof DatasetImport> &
  ComponentProps<typeof Pagination>) {
  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search dataset..."
            onChange={onChangeQuery}
            onSubmit={onSumbitQuery}
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
            {() => <DatasetCreate onCreateDataset={props.onCreateDataset} />}
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
            {() => <DatasetImport onImportDataset={props.onImportDataset} />}
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {datasets.length === 0 && <NoDatasets />}
          <StackedList
            items={datasets.map((item) => (
              <DatasetComponent
                key={item.uuid}
                dataset={item}
                onClickDataset={() => props.onClickDataset?.(item)}
              />
            ))}
          />
          <Pagination {...props} />
        </>
      )}
    </div>
  );
}

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
