import { type ReactNode, useMemo, useState } from "react";
import { Combobox } from "@headlessui/react";
import Fuse from "fuse.js";

import Button from "@/components/Button";
import Search from "@/components/Search";

/** A search menu.
 * @component
 * Use this component when you have a list of options that you want to filter
 * using a search bar. The component will display a search bar and menu with
 * the search results. The menu is always visible.
 * @param options The list of options to filter.
 * @param onSelect A callback that is called when an option is selected.
 * @param fields The fields of the options that should be searched.
 * @param getOptionKey A function that returns a unique key for an option.
 * @param limit The maximum number of options to display in the menu.
 * @param static Whether the menu should be static or not. If the menu is
 * static, it will not be hidden when the user clicks outside of it.
 * @param autoFocus Whether the search bar should be focused when the component
 * is mounted.
 * @param renderOption A function that renders an option. Use this to customize
 * the appearance of the options.
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
  as = Search,
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
}) {
  const [limit, setLimit] = useState(initialLimit);
  const [query, setQuery] = useState("");

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

  const optionsClassName = isStatic
    ? "pt-4"
    : "absolute w-full mt-1 rounded-md bg-stone-50 dark:bg-stone-700 py-2 overflow-auto shadow-lg ring-1 ring-stone-900 ring-opacity-5 focus:outline-none";

  return (
    <Combobox value={value} onChange={onSelect}>
      {({ value, open }) => (
        <>
          <Combobox.Input
            as={as}
            autoFocus={autoFocus}
            withButton={false}
            value={!open && value != null ? displayValue?.(value) : undefined}
            // @ts-ignore
            onChange={(value) => setQuery(value)}
          />
          <Combobox.Options static={isStatic} className={optionsClassName}>
            {filteredOptions.map((option, index) => (
              <Combobox.Option
                className={({ active }) =>
                  `relative cursor-default select-none p-2 rounded-md ${
                    active
                      ? "bg-stone-200 dark:bg-stone-800 text-emerald-600 dark:text-emerald-500"
                      : ""
                  }`
                }
                key={getOptionKey(option, index)}
                value={option}
              >
                {renderOption(option)}
              </Combobox.Option>
            ))}
            {filteredOptions.length == limit &&
            options.length > filteredOptions.length ? (
              <Button
                mode="text"
                className="w-full cursor-default"
                onClick={() => setLimit(options.length)}
              >
                <div className="flex flex-row w-full justify-between items-center text-stone-500">
                  <span className="flex-grow text-left">Show all</span>
                  <span>{options.length - filteredOptions.length} more</span>
                </div>
              </Button>
            ) : options.length > initialLimit ? (
              <Button
                mode="text"
                className="w-full cursor-default"
                onClick={() => setLimit(initialLimit)}
              >
                <div className="flex flex-row w-full justify-between items-center text-stone-500">
                  <span className="flex-grow text-left">Show less</span>
                </div>
              </Button>
            ) : null}
          </Combobox.Options>
        </>
      )}
    </Combobox>
  );
}
