import Fuse, { type FuseOptionKey, type IFuseOptions } from "fuse.js";
import { useMemo, useState } from "react";

export default function useListWithSearch<T extends Object>({
  options,
  fields,
  limit: initialLimit = 20,
  ...props
}: {
  options: T[];
  fields: FuseOptionKey<T>[];
  limit?: number;
} & IFuseOptions<T>) {
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(options, {
        keys: fields,
        threshold: 0.3,
        includeMatches: false,
        includeScore: false,
        ...props,
      }),
    [options, fields, props],
  );

  const filteredOptions = useMemo(() => {
    if (search === "") return options.slice(0, limit);
    return fuse.search(search, { limit }).map((result) => result.item);
  }, [search, fuse, options, limit]);

  return {
    items: filteredOptions,
    limit,
    search,
    setSearch,
    setLimit,
    hasMore: limit < options.length,
  };
}
