import Loading from "@/lib/components/ui/Loading";

export default function ExplorationLayout(props: {
  isLoading?: boolean;
  description?: string;
  children?: React.ReactNode;
  Filtering?: JSX.Element;
  Counts?: JSX.Element;
  Pagination?: JSX.Element;
}) {
  return (
    <div className="flex flex-col gap-4 p-2">
      {props.Filtering != null && (
        <div className="flex top-0 z-50 flex-row justify-between items-center dark:bg-stone-900">
          {props.Filtering}
        </div>
      )}
      <div className="flex sticky top-0 z-50 flex-row justify-between items-center dark:bg-stone-900">
        {props.Counts}
        {props.Pagination}
      </div>
      <div className="p-4">
        {props.isLoading ? <Loading /> : props.children}
      </div>
    </div>
  );
}
