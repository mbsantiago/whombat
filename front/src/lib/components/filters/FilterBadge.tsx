import { CloseIcon } from "@/lib/components/icons";

import type { NumberFilter } from "@/lib/types";

export default function FilterBadge({
  field,
  operation,
  value,
  onRemove,
}: {
  field: string;
  value: string | number | boolean;
  operation?: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10 gap-1">
      <span className="align-middle h-full font-bold">{field}</span>
      <span>{operation}</span>
      <span>{value}</span>
      <button
        className="ml-1 hover:bg-blue-200 rounded p-1"
        onClick={() => {
          onRemove?.();
        }}
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    </span>
  );
}

export function NumberFilterBadge(props: {
  field: string;
  value: NumberFilter;
  onRemove: () => void;
}) {
  const { field, value, onRemove } = props;
  const { lt, gt } = value;
  let operation = "";
  let val = "";
  if (lt) {
    operation = "<";
    val = lt.toString();
  } else if (gt) {
    operation = ">";
    val = gt.toString();
  }
  return (
    <FilterBadge
      field={field}
      operation={operation}
      value={val}
      onRemove={onRemove}
    />
  );
}
