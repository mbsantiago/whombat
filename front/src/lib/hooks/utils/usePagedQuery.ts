import {
  type UseQueryResult,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import type { GetMany, Page, PaginationController } from "@/lib/types";

/**
 * Represents a paged list with items, total count, and pagination information.
 */
export type PagedList<T> = {
  /** The list of items. */
  items: T[];
  /** The total count of items. */
  total: number;
  /** The pagination information. */
  pagination: PaginationController;
  /** The result of the query. */
  query: UseQueryResult<Page<T>, Error>;
  /** The key used for the query. */
  queryKey: any[];
};

/**
 * A hook for managing a paged query with pagination state.
 *
 * @param name - The name of the query.
 * @param func - The function to fetch paginated data.
 * @param pageSize - The number of items per page.
 * @param filter - The filter to apply to the query.
 * @param enabled - Whether the query should be enabled.
 * @returns A paged list object with items, total count, pagination, query
 * result, and query key.
 */
export default function usePagedQuery<T, S extends Object>({
  name,
  queryFn,
  pageSize,
  filter,
  enabled = true,
}: {
  name: string;
  queryFn: (query: GetMany) => Promise<Page<T>>;
  pageSize: number;
  filter: S;
  enabled?: boolean;
}): PagedList<T> {
  const [page, setPage] = useState(0);
  const [size, setPageSize] = useState(pageSize);
  const queryKey = [name, page, size, JSON.stringify(filter)];

  const query = useQuery<Page<T>, Error>({
    queryKey,
    queryFn: () => queryFn({ limit: size, offset: page * size, ...filter }),
    enabled,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const numPages = Math.ceil((query.data?.total ?? 0) / size);

  useEffect(() => {
    setPage((page) => {
      if (page >= numPages && numPages > 0) {
        return numPages - 1;
      }
      return page;
    });
  }, [numPages]);

  const pagination: PaginationController = useMemo(
    () => ({
      page,
      numPages,
      pageSize: size,
      setPage: (page) => {
        if (page >= 0 && page < numPages) {
          setPage(page);
        }
      },
      setPageSize: (size) => {
        if (size > 0) {
          setPageSize((prev) => {
            const newNumPages = Math.ceil((query.data?.total ?? 0) / size);
            const firstElement = Math.min(page * prev, query.data?.total ?? 0);
            const newPage = Math.floor(firstElement / size);
            setPage(Math.max(0, Math.min(newPage, newNumPages - 1)));
            return size;
          });
        }
      },
      nextPage: () => {
        if (page < numPages - 1) {
          setPage(page + 1);
        }
      },
      prevPage: () => {
        if (page > 0) {
          setPage(page - 1);
        }
      },
      hasNextPage: page < numPages - 1,
      hasPrevPage: page > 0,
    }),
    [page, numPages, size, query.data?.total],
  );

  const { items, total } = useMemo(() => {
    if (query.data == null || query.isLoading) {
      return { items: [], total: 0 };
    }
    return { items: query.data.items, total: query.data.total };
  }, [query.data, query.isLoading]);

  return {
    items,
    total,
    pagination,
    query,
    queryKey,
  };
}
