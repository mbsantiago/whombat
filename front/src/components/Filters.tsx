import { useState } from "react";
import Checkbox from "@/components/TableCheckbox";

export type SetFilter = ({
  name,
  value,
}: {
  name: string;
  value: unknown;
}) => void;

function FloatField({
  operation,
  onChangeOperation,
  value,
  name,
  onChangeValue,
  onSubmit,
}: {
  name: string;
  value: number;
  onChangeValue: (value: number) => void;
  onSubmit: () => void;
  operation: string;
  onChangeOperation: (operation: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-700 dark:text-stone-300 mb-2"
      >
        {name}
      </label>
      <div className="relative rounded-md">
        <div className="absolute inset-y-0 left-0 flex items-center">
          <label htmlFor={`${name}-operation`} className="sr-only">
            Operation
          </label>
          <select
            className="h-full rounded-l-md border-0 bg-transparent pl-2 pr-3 text-stone-500 focus:ring-2 focus:ring-inset focus:ring-emerald-600"
            id={`${name}-operation`}
            name={`${name}-operation`}
            value={operation}
            onChange={(e) => onChangeOperation(e.target.value)}
          >
            <option value="gt">&gt;</option>
            <option value="lt">&lt;</option>
            <option value="ge">&ge;</option>
            <option value="le">&le;</option>
          </select>
        </div>
        <input
          type="number"
          id={name}
          name={name}
          className="block w-full bg-stone-50 dark:bg-stone-900 rounded-md outline-none border-0 pl-14 pr-14 py-1 text-stone-900 dark:text-stone-300 ring-1 ring-inset ring-stone-300 dark:ring-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
          value={value}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
          onChange={(e) => onChangeValue(parseFloat(e.target.value))}
        />
        <button
          onClick={onSubmit}
          className="absolute inline-block px-2 inset-y-0 right-0 rounded-r-md bg-emerald-300 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-700 dark:hover:bg-emerald-800 dark:hover:text-emerald-400"
        >
          set
        </button>
      </div>
    </div>
  );
}

function IsNullField({
  name,
  value,
  onChange,
  onSubmit,
}: {
  name: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-row items-center space-x-2">
      <label
        htmlFor={`${name}-isnull`}
        className="text-sm font-medium text-stone-700 dark:text-stone-300"
      >
        Is null?
      </label>
      <Checkbox
        id={`${name}-isnull`}
        className="form-checkbox rounded text-emerald-500 dark:text-emerald-500 shadow-sm focus:ring focus:ring-offset-0 focus:ring-emerald-300 focus:ring-opacity-50"
        checked={value === true}
        indeterminate={value === false}
        onChange={() => {
          if (value === null) {
            onChange(false);
          } else if (value === false) {
            onChange(true);
          } else {
            onChange(null);
          }
        }}
      />
      <span className="text-stone-500">
        {value === null ? "not set" : value ? "is null" : "is not null"}
      </span>
      <button
        onClick={onSubmit}
        disabled={value === null}
        className="absolute px-2 py-1 right-0 rounded-md bg-emerald-300 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-700 dark:hover:bg-emerald-800 dark:hover:text-emerald-400 disabled:bg-emerald-300 dark:disabled:bg-emerald-900 dark:disabled:text-emerald-600 disabled:text-emerald-600"
      >
        set
      </button>
    </div>
  );
}

export function FloatFilter({
  setFilter,
  prefix = "",
  name = "field",
}: {
  setFilter: SetFilter;
  prefix?: string;
  name?: string;
}) {
  const [value, setValue] = useState(0);
  const [operation, setOperation] = useState("gt");

  const submit = () => {
    setFilter({ name: `${prefix}__${operation}`, value });
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <FloatField
        name={name}
        value={value}
        onChangeValue={setValue}
        operation={operation}
        onChangeOperation={setOperation}
        onSubmit={submit}
      />
    </div>
  );
}

export function NullableFloatFilter({
  setFilter,
  prefix = "",
  name = "field",
}: {
  setFilter: SetFilter;
  prefix?: string;
  name?: string;
}) {
  const [value, setValue] = useState(0);
  const [operation, setOperation] = useState("gt");
  const [isNull, setIsNull] = useState<boolean | null>(null);

  return (
    <div className="relative flex flex-col w-full gap-4">
      <FloatField
        name={name}
        value={value}
        onChangeValue={setValue}
        operation={operation}
        onChangeOperation={setOperation}
        onSubmit={() => {
          setFilter({ name: `${prefix}__${operation}`, value });
        }}
      />
      <IsNullField
        name="is_null"
        value={isNull}
        onChange={setIsNull}
        onSubmit={() => {
          setFilter({ name: `${prefix}__is_null`, value: isNull });
        }}
      />
    </div>
  );
}
