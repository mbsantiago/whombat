import { useState } from "react";
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
}): PagedList<T> {
  const [page, setPage] = useState(0);
  const [size, setPageSize] = useState(pageSize);

  const { data, isLoading, error } = useQuery<Paginated<T>, Error>(
    [name, page, size, filter],
    () => func({ limit: size, offset: page * size, ...filter }),
    { keepPreviousData: true },
  );

  const numPages = Math.ceil((data?.total ?? 0) / size);
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
          const newNumPages = Math.ceil((data?.total ?? 0) / size);
          const firstElement = Math.min(
            page * prev,
            data?.total ?? 0,
          );
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
    page: data?.items ?? [],
    total: data?.total ?? 0,
    pagination,
    isLoading,
    error,
  };
}
