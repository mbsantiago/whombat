import DatasetComponent from "@/lib/components/datasets/Dataset";
import { AddIcon, UploadIcon, WarningIcon } from "@/lib/components/icons";
import Dialog from "@/lib/components/ui/Dialog";
import Empty from "@/lib/components/ui/Empty";

import type { Dataset } from "@/lib/types";

import ListLayout from "../layouts/List";

/**
 * Component to display a list of datasets along with search functionality,
 * create and import links.
 */
export default function DatasetList({
  datasets,
  isLoading = false,
  onClickDataset,
  DatasetSearch,
  DatasetCreate,
  DatasetImport,
  Pagination,
}: {
  datasets: Dataset[];
  isLoading?: boolean;
  onClickDataset?: (dataset: Dataset) => void;
  DatasetSearch: JSX.Element;
  DatasetCreate: JSX.Element;
  DatasetImport: JSX.Element;
  Pagination: JSX.Element;
}) {
  return (
    <ListLayout
      isLoading={isLoading}
      isEmpty={datasets.length === 0}
      Search={DatasetSearch}
      Empty={<NoDatasets />}
      Actions={[
        <Dialog
          key="create"
          mode="text"
          title="Create Dataset"
          label={
            <>
              <AddIcon className="inline-block w-4 h-4 align-middle" /> Create
            </>
          }
        >
          {() => DatasetCreate}
        </Dialog>,
        <Dialog
          key="import"
          mode="text"
          title="Import a Dataset"
          label={
            <>
              <UploadIcon className="inline-block w-4 h-4 align-middle" />{" "}
              Import
            </>
          }
        >
          {() => DatasetImport}
        </Dialog>,
      ]}
      Pagination={Pagination}
      items={datasets.map((item) => (
        <DatasetComponent
          key={item.uuid}
          dataset={item}
          onClickDataset={() => onClickDataset?.(item)}
        />
      ))}
    />
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
