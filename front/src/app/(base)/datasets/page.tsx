"use client";

import useDatasets from "@/hooks/api/useDatasets";
import Hero from "@/components/Hero";
import Dataset from "@/components/Dataset";
import StackedList from "@/components/StackedList";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Link from "@/components/Link";
import Empty from "@/components/Empty";
import {
  AddIcon,
  DatasetIcon,
  WarningIcon,
  UploadIcon,
} from "@/components/icons";

function NoDatasets() {
  return (
    <Empty>
      <WarningIcon className="h-8 w-8 text-stone-500" />
      <p>No datasets found.</p>
      <p>
        To create a dataset, click on the
        <span className="text-emerald-500">
          <AddIcon className="h-4 w-4 inline-block ml-2 mr-1" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}

export default function Datasets() {
  const { items, pagination, query, filter } = useDatasets();

  return (
    <>
      <Hero text="Datasets" />
      <div className="flex w-full flex-col space-y-2 p-8">
        <div className="flex flex-row space-x-4">
          <div className="flex-grow">
            <Search
              label="Search"
              placeholder="Search dataset..."
              value={filter.get("search")}
              onChange={(value) => filter.set("search", value)}
              onSubmit={() => filter.submit()}
              icon={<DatasetIcon />}
            />
          </div>
          <div className="h-full">
            <Link mode="text" href="/datasets/create">
              <AddIcon className="inline-block h-4 w-4 align-middle" /> Create
            </Link>
          </div>
          <div className="h-full">
            <Link mode="text" href="/datasets/import">
              <UploadIcon className="inline-block h-4 w-4 align-middle" />{" "}
              Import
            </Link>
          </div>
        </div>
        {query.isLoading ? (
          <Loading />
        ) : (
          <>
            {items.length === 0 && <NoDatasets />}
            <StackedList
              items={items.map((item) => (
                <Dataset key={item.id} {...item} />
              ))}
            />
            {pagination.numPages > 1 && <Pagination {...pagination} />}
          </>
        )}
      </div>
    </>
  );
}
