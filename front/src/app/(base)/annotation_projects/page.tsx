"use client";
import useAnnotationProjects from "@/hooks/api/useAnnotationProjects";
import Hero from "@/components/Hero";
import AnnotationProject from "@/components/AnnotationProject";
import Link from "@/components/Link";
import StackedList from "@/components/StackedList";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Empty from "@/components/Empty";
import {
  AddIcon,
  DatasetIcon,
  WarningIcon,
  UploadIcon,
} from "@/components/icons";

function NoProjects() {
  return (
    <Empty>
      <WarningIcon className="h-16 w-16 text-stone-500" />
      <p>No annotation project exist yet!</p>
      <p>
        To create a new project, click on the
        <span className="text-emerald-500">
          <AddIcon className="h-4 w-4 inline-block ml-2 mr-1" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}

export default function AnnotationProjects() {
  const { items, pagination, query, filter } = useAnnotationProjects();

  return (
    <>
      <Hero text="Annotation Projects" />
      <div className="flex w-full flex-col space-y-2 p-8">
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
          <div className="h-full inline-flex gap-4">
            <Link mode="text" href="/annotation_projects/create/">
              <AddIcon className="inline-block h-4 w-4 align-middle" /> Create
            </Link>
            <Link mode="text" href="/annotation_projects/import/">
              <UploadIcon className="inline-block h-4 w-4 align-middle" />{" "}
              Import
            </Link>
          </div>
        </div>
        {query.isLoading ? (
          <Empty>
            <div className="p-8">
              <Loading />
            </div>
          </Empty>
        ) : items.length === 0 ? (
          <NoProjects />
        ) : (
          <>
            <StackedList
              items={items.map((item) => (
                <AnnotationProject key={item.id} {...item} />
              ))}
            />
          </>
        )}
        {pagination.numPages > 1 && <Pagination {...pagination} />}
      </div>
    </>
  );
}
