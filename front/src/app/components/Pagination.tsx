import PaginationBase from "@/lib/components/lists/Pagination";

import type { PaginationController } from "@/lib/types";

export default function Pagination({
  pagination,
  pageSizeOptions,
}: {
  pagination: PaginationController;
  pageSizeOptions?: number[];
}) {
  return (
    <PaginationBase
      page={pagination.page}
      numPages={pagination.numPages}
      pageSize={pagination.pageSize}
      hasNextPage={pagination.hasNextPage}
      hasPrevPage={pagination.hasPrevPage}
      onNextPage={pagination.nextPage}
      onPrevPage={pagination.prevPage}
      onSetPage={pagination.setPage}
      onSetPageSize={pagination.setPageSize}
      pageSizeOptions={pageSizeOptions}
    />
  );
}
