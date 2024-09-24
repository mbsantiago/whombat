import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type GetMany = z.infer<typeof schemas.GetManySchema>;

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

/**
 * Represents a pagination state with various utility functions.
 */
export type PaginationController = {
  /** The current page number. */
  page: number;
  /** The total number of pages. */
  numPages: number;
  /** The number of items per page. */
  pageSize: number;
  /** Sets the current page number. */
  setPage: (page: number) => void;
  /** Sets the number of items per page. */
  setPageSize: (pageSize: number) => void;
  /** Checks if there is a next page. */
  hasNextPage: boolean;
  /** Checks if there is a previous page. */
  hasPrevPage: boolean;
  /** Moves to the next page. */
  nextPage: () => void;
  /** Moves to the previous page. */
  prevPage: () => void;
};
