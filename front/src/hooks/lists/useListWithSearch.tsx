import { useState, useMemo } from "react";
import Fuse, { type FuseOptionKey } from "fuse.js";

export default function useListWithSearch<T extends Object>({
  options,
  fields,
  limit: initialLimit = 20,
}: {
  options: T[];
  fields: FuseOptionKey<T>[];
  limit?: number;
}) {
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(options, {
        keys: fields,
        threshold: 0.3,
        shouldSort: true,
        includeMatches: false,
        includeScore: false,
      }),
    [options, fields],
  );

  const filteredOptions = useMemo(() => {
    if (search === "") return options.slice(0, limit);
    return fuse.search(search, { limit }).map((result) => result.item);
  }, [search, fuse, options, limit]);

  return {
    items: filteredOptions,
    search,
    setSearch,
    setLimit,
    hasMore: limit < options.length,
  };
}
