import { useMemo } from "react";

import InputGroup from "@/lib/components/inputs/InputGroup";
import Search from "@/lib/components/inputs/Search";
import Select from "@/lib/components/inputs/Select";

const DEFAULT_LIMIT_OPTIONS = [5, 10, 20, 50, 100];

/**
 * ListSearch component allows users to search and select the number of items
 * to display.
 */
export default function ListSearch({
  limit = 10,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  onChangeLimit,
  onChangeSearch,
}: {
  /** The default limit for the number of items to display. */
  limit?: number;
  /** The options for the limit select dropdown. */
  limitOptions?: number[];
  /** Callback function to handle limit change. */
  onChangeLimit?: (value: number) => void;
  /** Callback function to handle search input change. */
  onChangeSearch?: (value: string) => void;
}) {
  const options = useMemo(
    () =>
      limitOptions.map((value) => ({
        id: value,
        label: value,
        value,
      })),
    [limitOptions],
  );
  return (
    <div className="inline-flex gap-2 justify-between items-center w-full">
      <div className="grow">
        <InputGroup name="search" label="Search">
          <Search onChange={(value) => onChangeSearch?.(value as string)} />
        </InputGroup>
      </div>
      <div className="w-24">
        <InputGroup name="limit" label="Show Max">
          <Select
            selected={{ id: limit, label: limit, value: limit }}
            onChange={(value) => onChangeLimit?.(value as number)}
            options={options}
          />
        </InputGroup>
      </div>
    </div>
  );
}
