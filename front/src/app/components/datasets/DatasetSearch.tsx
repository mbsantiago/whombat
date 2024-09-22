import { useCallback, useMemo } from "react";
import { Item } from "react-stately";

import useDatasets from "@/app/hooks/api/useDatasets";

import Search from "@/lib/components/search/Search";

import type { Dataset } from "@/lib/types";

export default function DatasetSearch({
  selected,
  onSelect,
  showMax = 10,
}: {
  selected?: Dataset | null;
  onSelect?: (dataset: Dataset) => void;
  emptyMessage?: string;
  showMax?: number;
}) {
  const filter = useMemo(() => ({ search: "" }), []);

  const {
    isLoading,
    items,
    filter: { set: setFilter },
  } = useDatasets({
    pageSize: showMax * 4,
    filter,
  });

  const onChangeSearch = useCallback(
    (search: string) => setFilter("search", search),
    [setFilter],
  );

  return (
    <Search
      label="search-datasets"
      value={selected}
      options={items}
      fields={["name", "description"]}
      displayValue={(dataset) => dataset.name}
      getOptionKey={(dataset) => dataset.uuid}
      onChangeSearch={onChangeSearch}
      onSelect={onSelect}
      showMax={showMax}
      isLoading={isLoading}
    >
      {(dataset) => <Item key={dataset.uuid}>{dataset.name}</Item>}
    </Search>
  );
}
