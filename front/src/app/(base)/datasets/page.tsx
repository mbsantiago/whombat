"use client";
import Link from "next/link";
import Hero from "@/components/Hero";
import useDatasets from "@/hooks/useDatasets";
import Dataset from "@/components/Dataset";
import Button from "@/components/Button";
import { DatasetIcon, AddIcon, WarningIcon } from "@/components/icons";
import StackedList from "@/components/StackedList";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";

function NoDatasets() {
  return (
    <div className="p-8 w-full">
      <div className="w-full border border-dashed rounded-md border-stone-500 p-4 flex flex-col items-center justify-center text-stone-500">
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
      </div>
    </div>
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
            <Link href="/datasets/create">
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
            {items.length === 0 && <NoDatasets />}
            <StackedList
              items={items.map((item) => (
                <Dataset key={item.id} {...item} />
              ))}
            />
            <Pagination {...pagination} />
          </>
        )}
      </div>
    </>
  );
}
