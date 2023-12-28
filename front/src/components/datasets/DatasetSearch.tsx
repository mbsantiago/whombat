import { useCallback, useMemo } from "react";
import { Item } from "react-stately";

import { type Dataset } from "@/api/schemas";
import Search from "@/components/search/Search";
import useDatasets from "@/hooks/api/useDatasets";

export default function DatasetSearch({
  selected,
  onSelect,
  showMax = 10,
}: {
  selected: Dataset | null;
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
