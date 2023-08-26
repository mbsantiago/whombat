"use client";
import Link from "next/link";
import Hero from "@/components/Hero";
import api from "@/app/api";
import usePagedQuery from "@/hooks/usePagedQuery";
import useFilter from "@/hooks/useFilter";
import Dataset from "@/components/Dataset";
import Button from "@/components/Button";
import { DatasetIcon, AddIcon } from "@/components/icons";
import StackedList from "@/components/StackedList";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import { type DatasetFilter } from "@/api/datasets";

function DatasetList({ filter }: { filter: DatasetFilter }) {
  const { page, isLoading, pagination } = usePagedQuery({
    name: "datasets",
    func: api.datasets.getMany,
    pageSize: 10,
    filter,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <StackedList
        items={page.map((item) => (
          <Dataset key={item.id} {...item} />
        ))}
      />
      <Pagination {...pagination} />
    </>
  );
}

export default function Datasets() {
  const {
    filter,
    set: setFilter,
    get: getFilter,
    submit,
  } = useFilter<DatasetFilter>({ initialState: {} });

  return (
    <>
      <Hero text="Datasets" />
      <div className="flex w-full flex-col space-y-2 p-8">
        <div className="flex flex-row space-x-4">
          <div className="flex-grow">
            <Search
              label="Search"
              placeholder="Search dataset..."
              value={getFilter("search")}
              onChange={(value) => setFilter("search", value)}
              onSubmit={() => submit()}
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
        <DatasetList filter={filter} />
      </div>
    </>
  );
}
