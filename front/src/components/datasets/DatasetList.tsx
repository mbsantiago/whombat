import useDatasets from "@/hooks/api/useDatasets";
import Dataset from "@/components/datasets/Dataset";
import StackedList from "@/components/lists/StackedList";
import Search from "@/components/inputs/Search";
import Pagination from "@/components/lists/Pagination";
import Loading from "@/app/loading";
import Link from "@/components/Link";
import Empty from "@/components/Empty";
import {
  AddIcon,
  DatasetIcon,
  WarningIcon,
  UploadIcon,
} from "@/components/icons";

/**
 * Component to display a message when no datasets are found.
 *
 * @returns JSX element providing information and guidance when no datasets are
 * found.
 */
function NoDatasets() {
  return (
    <Empty>
      <WarningIcon className="w-8 h-8 text-stone-500" />
      <p>No datasets found.</p>
      <p>
        To create a dataset, click on the
        <span className="text-emerald-500">
          <AddIcon className="inline-block mr-1 ml-2 w-4 h-4" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}


/**
 * Component to display a list of datasets along with search functionality,
 * create and import links.
 *
 * @returns JSX element displaying a list of datasets with search and
 * navigation options.
 */
export default function DatasetList() {
  const datasets = useDatasets();

  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search dataset..."
            value={datasets.filter.get("search")}
            onChange={(value) => datasets.filter.set("search", value)}
            onSubmit={() => datasets.filter.submit()}
            icon={<DatasetIcon />}
          />
        </div>
        <div className="h-full">
          <Link mode="text" href="/datasets/create">
            <AddIcon className="inline-block w-4 h-4 align-middle" /> Create
          </Link>
        </div>
        <div className="h-full">
          <Link mode="text" href="/datasets/import">
            <UploadIcon className="inline-block w-4 h-4 align-middle" /> Import
          </Link>
        </div>
      </div>
      {datasets.isLoading ? (
        <Loading />
      ) : (
        <>
          {datasets.items.length === 0 && <NoDatasets />}
          <StackedList
            items={datasets.items.map((item) => (
              <Dataset key={item.uuid} dataset={item} />
            ))}
          />
          {datasets.pagination.numPages > 1 && (
            <Pagination {...datasets.pagination} />
          )}
        </>
      )}
    </div>
  );
}
