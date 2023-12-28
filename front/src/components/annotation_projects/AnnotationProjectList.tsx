import { type ReactNode } from "react";

import Loading from "@/app/loading";
import AnnotationProject from "@/components/annotation_projects/AnnotationProject";
import Empty from "@/components/Empty";
import { AddIcon, DatasetIcon, UploadIcon } from "@/components/icons";
import Search from "@/components/inputs/Search";
import Link from "@/components/Link";
import Pagination from "@/components/lists/Pagination";
import StackedList from "@/components/lists/StackedList";
import useAnnotationProjects from "@/hooks/api/useAnnotationProjects";

export default function AnnotationProjectList({
  empty,
}: {
  empty?: ReactNode;
}) {
  const { items, pagination, isLoading, filter } = useAnnotationProjects();

  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search project..."
            value={filter.get("search")}
            onChange={(value) => filter.set("search", value)}
            onSubmit={() => filter.submit()}
            icon={<DatasetIcon />}
          />
        </div>
        <div className="inline-flex gap-4 h-full">
          <Link mode="text" href="/annotation_projects/create/">
            <AddIcon className="inline-block w-4 h-4 align-middle" /> Create
          </Link>
          <Link mode="text" href="/annotation_projects/import/">
            <UploadIcon className="inline-block w-4 h-4 align-middle" /> Import
          </Link>
        </div>
      </div>
      {isLoading ? (
        <Empty>
          <div className="p-8">
            <Loading />
          </div>
        </Empty>
      ) : items.length === 0 ? (
        empty
      ) : (
        <>
          <StackedList
            items={items.map((item) => (
              <AnnotationProject key={item.uuid} annotationProject={item} />
            ))}
          />
        </>
      )}
      {pagination.numPages > 1 && <Pagination {...pagination} />}
    </div>
  );
}
