"use client";
import Link from "next/link";
import Hero from "@/components/Hero";
import useAnnotationProjects from "@/hooks/useAnnotationProjects";
import AnnotationProject from "@/components/AnnotationProject";
import Button from "@/components/Button";
import { DatasetIcon, AddIcon } from "@/components/icons";
import StackedList from "@/components/StackedList";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";

export default function Datasets() {
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
