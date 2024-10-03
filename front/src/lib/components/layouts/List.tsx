import type { ComponentProps } from "react";

import StackedList from "@/lib/components/lists/StackedList";
import EmptyComponent from "@/lib/components/ui/Empty";
import Loading from "@/lib/components/ui/Loading";

export default function ListLayout({
  isLoading = false,
  isEmpty = false,
  Search,
  Actions,
  Empty,
  Pagination,
  items,
}: {
  isLoading?: boolean;
  isEmpty?: boolean;
  Search: JSX.Element;
  Actions?: JSX.Element[];
  Empty: JSX.Element;
  Pagination: JSX.Element;
} & ComponentProps<typeof StackedList>) {
  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">{Search}</div>
        {Actions?.map((action, index) => (
          <div className="h-full" key={index}>
            {action}
          </div>
        ))}
      </div>
      {isLoading ? (
        <EmptyComponent>
          <div className="p-8">
            <Loading />
          </div>
        </EmptyComponent>
      ) : isEmpty ? (
        Empty
      ) : (
        <StackedList items={items} />
      )}
      {Pagination}
    </div>
  );
}
