import useEvaluationSets from "@/hooks/api/useEvaluationSets";
import EvaluationSet from "@/components/EvaluationSet";
import StackedList from "@/components/StackedList";
import Link from "@/components/Link";
import Search from "@/components/Search";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Empty from "@/components/Empty";
import { AddIcon, TasksIcon, WarningIcon } from "@/components/icons";

function NoEvaluationSets() {
  return (
    <Empty>
      <WarningIcon className="h-8 w-8 text-stone-500" />
      <p>No evaluation sets found.</p>
      <p>
        To create an evaluation set, click on the
        <span className="text-emerald-500">
          <AddIcon className="h-4 w-4 inline-block ml-2 mr-1" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}

export default function EvaluationSets() {
  const { items, pagination, query, filter } = useEvaluationSets();

  return (
    <div className="flex w-full flex-col space-y-2 p-8">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search evaluation set..."
            value={filter.get("search")}
            onChange={(value) => filter.set("search", value)}
            onSubmit={() => filter.submit()}
            icon={<TasksIcon />}
          />
        </div>
        <div className="h-full">
          <Link mode="text" href="/evaluation/create/">
            <AddIcon className="inline-block h-4 w-4 align-middle" /> Create
          </Link>
        </div>
      </div>
      {query.isLoading ? (
        <Loading />
      ) : (
        <>
          {items.length === 0 && <NoEvaluationSets />}
          <StackedList
            items={items.map((item) => (
              <EvaluationSet key={item.id} {...item} />
            ))}
          />
          {items.length > 0 && <Pagination {...pagination} />}
        </>
      )}
    </div>
  );
}
