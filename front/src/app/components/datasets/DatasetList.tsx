import DatasetListBase from "@/lib/components/datasets/DatasetList";
import useDatasets from "@/app/hooks/api/useDatasets";

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
  const datasets = useDatasets({ onCreateDataset });

  // TODO: Add import functionality

  return (
    <DatasetListBase
      datasets={datasets.items}
      isLoading={datasets.isLoading}
      onChangeQuery={(query) => datasets.filter.set("search", query)}
      onSumbitQuery={datasets.filter.submit}
      onClickDataset={onClickDataset}
      page={datasets.pagination.page}
      numPages={datasets.pagination.numPages}
      pageSize={datasets.pagination.pageSize}
      hasNextPage={datasets.pagination.hasNextPage}
      hasPrevPage={datasets.pagination.hasPrevPage}
      onNextPage={datasets.pagination.nextPage}
      onPrevPage={datasets.pagination.prevPage}
      onSetPage={datasets.pagination.setPage}
      onSetPageSize={datasets.pagination.setPageSize}
    />
  );
}
