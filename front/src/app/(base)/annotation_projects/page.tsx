"use client";
import Link from "next/link";

import useAnnotationProjects from "@/hooks/api/useAnnotationProjects";
import Hero from "@/components/Hero";
import AnnotationProject from "@/components/AnnotationProject";
import Button from "@/components/Button";
import StackedList from "@/components/StackedList";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Empty from "@/components/Empty";
import { AddIcon, DatasetIcon, SadIcon } from "@/components/icons";

function NoProjects() {
  return (
    <Empty>
      <SadIcon className="h-8 w-8 text-stone-500" />
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
          <div className="h-full">
            <Link href="/annotation_projects/create/">
              <Button variant="primary">
                <AddIcon className="inline-block h-4 w-4 align-middle" /> Create
              </Button>
            </Link>
          </div>
        </div>
        {query.isLoading ? (
          <Loading />
        ) : items.length === 0 ? (
          <NoProjects />
        ) : (
          <>
            <StackedList
              items={items.map((item) => (
                <AnnotationProject key={item.id} {...item} />
              ))}
            />
            <Pagination {...pagination} />
          </>
        )}
      </div>
    </>
  );
}
