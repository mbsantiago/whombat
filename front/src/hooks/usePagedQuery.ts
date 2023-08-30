import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  page: T[];
  total: number;
  pagination: Pagination;
  isLoading: boolean;
  error: Error | null;
};

export default function usePagedQuery<T, S extends Object>({
  name,
  func,
  pageSize,
  filter,
}: {
  name: string;
  func: (query: GetManyQuery) => Promise<Paginated<T>>;
  pageSize: number;
  filter: S;
}) {
  const [page, setPage] = useState(0);
  const [size, setPageSize] = useState(pageSize);

  const query = useQuery<Paginated<T>, Error>(
    [name, page, size, filter],
    () => func({ limit: size, offset: page * size, ...filter }),
    { keepPreviousData: true },
  );

  const numPages = Math.ceil((query.data?.total ?? 0) / size);

  useEffect(() => {
    if (page >= numPages && numPages > 0) {
      setPage(numPages - 1);
    }
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

  return {
    page: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    pagination,
    ...query,
  };
}
