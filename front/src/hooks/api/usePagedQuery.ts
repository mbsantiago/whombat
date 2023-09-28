import { useEffect, useState, useMemo } from "react";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";

import { type GetManyQuery, type Paginated } from "@/api/common";

export type Pagination = {
  page: number;
  numPages: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
};

export type PagedList<T> = {
  items: T[];
  total: number;
  pagination: Pagination;
  query: UseQueryResult<Paginated<T>, Error>;
  queryKey: any[];
};

export default function usePagedQuery<T, S extends Object>({
  name,
  func,
  pageSize,
  filter,
  enabled = true,
}: {
  name: string;
  func: (query: GetManyQuery) => Promise<Paginated<T>>;
  pageSize: number;
  filter: S;
  enabled?: boolean;
}): PagedList<T> {
  const [page, setPage] = useState(0);
  const [size, setPageSize] = useState(pageSize);
  const queryKey = [name, page, size, filter];

  const query = useQuery<Paginated<T>, Error>(
    queryKey,
    () => func({ limit: size, offset: page * size, ...filter }),
    {
      keepPreviousData: true,
      enabled,
      refetchOnWindowFocus: false,
    },
  );

  const numPages = Math.ceil((query.data?.total ?? 0) / size);

  useEffect(() => {
    setPage((page) => {
      if (page >= numPages && numPages > 0) {
        return numPages - 1;
      }
      return page;
    });
  }, [numPages]);

  const pagination: Pagination = {
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
  };

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
