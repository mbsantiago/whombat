import { CloseIcon, FilterIcon } from "@/components/icons";
import { type Filter } from "@/hooks/utils/useFilter";

const OPERATION_MAP: Record<string, string> = {
  eq: "=",
  ne: "≠",
  gt: ">",
  lt: "<",
  ge: "≥",
  le: "≤",
};

export function FilterBadge({
  field,
  value,
  onRemove,
}: {
  field: string;
  value: string | number | boolean;
  onRemove?: () => void;
}) {
  let [fieldName, operation] = field.split("__");

  if (operation in OPERATION_MAP) {
    operation = OPERATION_MAP[operation];
  }

  if (typeof value === "boolean") {
    value = value ? "yes" : "no";
  }

  if (typeof value === "number") {
    value = value.toLocaleString();
  }

  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10">
      <span className="align-middle h-full">
        {fieldName} {operation} {value}
      </span>
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

export default function FilterBar<T extends Object>({
  filter,
  total,
  showIfEmpty = false,
  withLabel = true,
}: {
  filter: Filter<T>;
  total?: number;
  showIfEmpty?: boolean;
  withLabel?: boolean;
}) {
  const activeFilters = Object.keys(filter.filter).filter(
    (key) => !filter.isFixed(key as keyof T),
  ).length;

  if (activeFilters === 0 && !showIfEmpty) {
    return null;
  }

  return (
    <div className="flex flex-row items-center">
      {total != null && (
        <span className="mr-3 text-stone-500">{total} results</span>
      )}
      <div className="flex flex-row items-center space-x-2">
        {withLabel && (
          <span className="mr-2 text-blue-200">
            <FilterIcon className="inline-block h-5 w-5 mr-1" />
            filters:
          </span>
        )}
        {Object.entries(filter.filter)
          .filter(([key, _]) => !filter.isFixed(key as keyof T))
          .map(([key, value]) => {
            return (
              <FilterBadge
                key={key}
                field={key}
                value={value}
                onRemove={() => filter.clear(key as keyof T)}
              />
            );
          })}
      </div>
    </div>
  );
}
