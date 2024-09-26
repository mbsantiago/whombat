import * as icons from "@/lib/components/icons";
import Select from "@/lib/components/inputs/Select";
import { Input } from "@/lib/components/inputs/index";
import Button from "@/lib/components/ui/Button";

const defaultPageSizeOptions = [1, 5, 10, 25, 50, 100];

/**
 * Pagination component allows users to navigate through pages of items.
 */
export default function Pagination({
  page = 0,
  numPages = 1,
  pageSize = 10,
  hasNextPage = false,
  hasPrevPage = false,
  onNextPage: nextPage,
  onPrevPage: prevPage,
  onSetPage: setPage,
  onSetPageSize: setPageSize,
  pageSizeOptions = defaultPageSizeOptions,
}: {
  /** The current page number. */
  page?: number;
  /** The total number of pages. */
  numPages?: number;
  /** The number of items per page. */
  pageSize?: number;
  /** Indicates if there is a next page. */
  hasNextPage?: boolean;
  /** Indicates if there is a previous page. */
  hasPrevPage?: boolean;
  /** Callback function to handle next page action. */
  onNextPage?: () => void;
  /** Callback function to handle previous page action. */
  onPrevPage?: () => void;
  /** Callback function to set the current page. */
  onSetPage?: (page: number) => void;
  /** Callback function to set the page size. */
  onSetPageSize?: (pageSize: number) => void;
  /** The page size options. */
  pageSizeOptions?: number[];
}) {
  return (
    <div className="flex flex-row space-x-2">
      <Button
        disabled={page === 0}
        onClick={() => setPage?.(0)}
        variant="secondary"
        mode="text"
      >
        <icons.FirstIcon className="w-5 h-5 fill-transparent stroke-inherit" />
      </Button>
      <Button
        onClick={prevPage}
        disabled={!hasPrevPage}
        variant="secondary"
        mode="text"
      >
        <icons.PreviousIcon className="w-5 h-5 fill-transparent stroke-inherit" />
      </Button>
      <div className="w-14">
        <Input
          disabled={numPages === 1}
          type="number"
          className="remove-arrow"
          value={page + 1}
          onChange={(e) => setPage?.(parseInt(e.target.value) - 1)}
        />
      </div>
      <Button disabled variant="secondary" mode="text">
        / {numPages}
      </Button>
      <Button
        onClick={nextPage}
        disabled={!hasNextPage}
        variant="secondary"
        mode="text"
      >
        <icons.NextIcon className="w-5 h-5 fill-transparent stroke-inherit" />
      </Button>
      <Button
        disabled={page === numPages - 1}
        onClick={() => setPage?.(numPages - 1)}
        variant="secondary"
        mode="text"
      >
        <icons.LastIcon className="w-5 h-5 fill-transparent stroke-inherit" />
      </Button>
      <SetPageSize
        pageSize={pageSize}
        onSetPageSize={setPageSize}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}

function SetPageSize({
  pageSize = 10,
  onSetPageSize,
  pageSizeOptions = defaultPageSizeOptions,
}: {
  pageSize?: number;
  onSetPageSize?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}) {
  return (
    <Select
      label="Page Size:"
      selected={{ label: pageSize.toString(), value: pageSize, id: pageSize }}
      onChange={(value) => onSetPageSize?.(value)}
      options={pageSizeOptions.map((value) => ({
        label: value.toString(),
        value,
        id: value,
      }))}
    />
  );
}
