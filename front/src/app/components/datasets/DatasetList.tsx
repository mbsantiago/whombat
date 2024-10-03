import Pagination from "@/app/components/Pagination";
import DatasetCreate from "@/app/components/datasets/DatasetCreate";
import DatasetImport from "@/app/components/datasets/DatasetImport";

import useDatasets from "@/app/hooks/api/useDatasets";

import DatasetListBase from "@/lib/components/datasets/DatasetList";
import { AnnotationProjectIcon } from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";

import type { Dataset } from "@/lib/types";

/**
 * Component to display a list of datasets along with search functionality,
 * create and import links.
 */
export default function DatasetList({
  onCreateDataset,
  onClickDataset,
}: {
  onCreateDataset?: (dataset: Dataset) => void;
  onClickDataset?: (dataset: Dataset) => void;
}) {
  const { items, pagination, isLoading, filter } = useDatasets({
    onCreateDataset,
  });
  return (
    <DatasetListBase
      datasets={items}
      isLoading={isLoading}
      onClickDataset={onClickDataset}
      DatasetImport={<DatasetImport onImportDataset={onCreateDataset} />}
      DatasetSearch={
        <Search
          label="Search"
          placeholder="Search project..."
          value={filter.get("search")}
          onChange={(value) => filter.set("search", value as string)}
          onSubmit={filter.submit}
          icon={<AnnotationProjectIcon />}
        />
      }
      DatasetCreate={<DatasetCreate onCreateDataset={onCreateDataset} />}
      Pagination={<Pagination pagination={pagination} />}
    />
  );
}
