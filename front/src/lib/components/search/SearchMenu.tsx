import { Combobox, ComboboxInput, ComboboxOptions } from "@headlessui/react";
import Fuse from "fuse.js";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import Input from "@/lib/components/inputs/Input";
import Button from "@/lib/components/ui/Button";

/** A search menu.
 * @component
 * Use this component when you have a list of options that you want to filter
 * using a search bar. The component will display a search bar and menu with
 * the search results. The menu is always visible.
 */
export default function SearchMenu<
  T extends {
    [key: string]: any;
  },
>({
  value,
  options,
  onSelect,
  renderOption,
  fields,
  getOptionKey = (_: T, index: number) => index,
  limit: initialLimit = 5,
  autoFocus = false,
  static: isStatic = true,
  displayValue,
  onChange,
  initialQuery = "",
  as = Input,
  empty,
}: {
  options: T[];
  renderOption: (option: T) => ReactNode;
  as?: any;
  value?: T;
  onSelect?: (selected: T) => void;
  getOptionKey?: (option: T, index: number) => string | number;
  limit?: number;
  autoFocus?: boolean;
  fields: string[];
  static?: boolean;
  displayValue?: (value: T) => string;
  onChange?: (value: string) => void;
  initialQuery?: string;
  empty?: ReactNode;
}) {
  const [limit, setLimit] = useState(initialLimit);
  const [query, setQuery] = useState(initialQuery);

  // Call onChange when the query changes.
  useEffect(() => onChange?.(query), [query, onChange]);

  const fuse = useMemo(
    () =>
      new Fuse(options, {
        keys: fields,
        threshold: 0.3,
      }),
    [options, fields],
  );

  const filteredOptions = useMemo(() => {
    if (!query) return options.slice(0, limit);
    return fuse.search(query, { limit }).map((result) => result.item);
  }, [query, fuse, options, limit]);

  const handleSelect = (selected: T | null) => {
    if (selected != null) onSelect?.(selected);
  };

  const optionsClassName =
    "w-(--input-width) rounded-md border bg-stone-50 dark:bg-stone-700 border-stone-200 dark:border-stone-600 py-2 px-1 overflow-auto shadow-lg focus:outline-hidden";

  if (isStatic) {
    return (
      <Combobox value={value} onChange={handleSelect}>
        {({ value, open }) => (
          <div className="relative w-full">
            <ComboboxInput
              as={as}
              autoFocus={autoFocus}
              value={!open && value != null ? displayValue?.(value) : undefined}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxOptions
              static={isStatic}
              className={`absolute mt-1 ${optionsClassName}`}
            >
              <MenuContents
                options={filteredOptions}
                total={options.length}
                limit={limit}
                initialLimit={initialLimit}
                renderOption={renderOption}
                getOptionKey={getOptionKey}
                setLimit={setLimit}
                empty={empty}
              />
            </ComboboxOptions>
          </div>
        )}
      </Combobox>
    );
  }

  return (
    <div className="flex w-full flex-row">
      <Combobox value={value} onChange={handleSelect}>
        <div className="relative w-full">
          <ComboboxInput
            as={as}
            autoFocus={autoFocus}
            value={value != null ? displayValue?.(value) : undefined}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxOptions
            anchor={{ to: "bottom", gap: 8 }}
            transition
            className={`${optionsClassName} transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 empty:invisible`}
          >
            <MenuContents
              options={filteredOptions}
              total={options.length}
              limit={limit}
              initialLimit={initialLimit}
              renderOption={renderOption}
              getOptionKey={getOptionKey}
              setLimit={setLimit}
              empty={empty}
            />
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
}

function MenuOption<T>({
  option,
  renderOption,
}: {
  option: T;
  renderOption: (option: T) => ReactNode;
}) {
  return (
    <Combobox.Option
      className={({ active }) =>
        `relative cursor-default select-none p-2 rounded-md ${
          active
            ? "bg-stone-200 dark:bg-stone-800 text-emerald-600 dark:text-emerald-500"
            : ""
        }`
      }
      value={option}
    >
      {renderOption(option)}
    </Combobox.Option>
  );
}

function MenuContents<T>({
  options,
  total,
  limit,
  initialLimit,
  empty = "No options found",
  renderOption,
  getOptionKey,
  setLimit,
}: {
  options: T[];
  total: number;
  limit: number;
  initialLimit: number;
  empty?: ReactNode;
  renderOption: (option: T) => ReactNode;
  getOptionKey: (option: T, index: number) => string | number;
  setLimit: (limit: number) => void;
}) {
  return (
    <>
      {/* Render the options, up to the limit */}
      {options.map((option, index) => (
        <MenuOption
          key={getOptionKey(option, index)}
          option={option}
          renderOption={renderOption}
        />
      ))}
      {/* If there are more options than the limit, show a Show All button */}
      {options.length == limit && total > options.length ? (
        <Button
          mode="text"
          className="w-full cursor-default"
          onClick={() => setLimit(total)}
        >
          <div className="flex w-full flex-row items-center justify-between text-stone-500">
            <span className="grow text-left">Show all</span>
            <span>{total - options.length} more</span>
          </div>
        </Button>
      ) : options.length > initialLimit ? (
        <Button
          mode="text"
          className="w-full cursor-default"
          onClick={() => setLimit(initialLimit)}
        >
          <div className="flex w-full flex-row items-center justify-between text-stone-500">
            <span className="grow text-left">Show less</span>
          </div>
        </Button>
      ) : null}
      {total == 0 && (empty || null)}
    </>
  );
}
