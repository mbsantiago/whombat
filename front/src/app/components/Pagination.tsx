import PaginationBase from "@/lib/components/lists/Pagination";
import type { Pagination } from "@/lib/hooks/utils/usePagedQuery";

export default function Pagination({ pagination }: { pagination: Pagination }) {
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
    />
  );
}
