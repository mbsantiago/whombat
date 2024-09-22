import { Float } from "@headlessui-float/react";
import { Listbox } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

import { CheckIcon, ExpandIcon } from "@/lib/components/icons";
import { Submit } from "@/lib/components/inputs/index";

export type Option<T> = {
  id: string | number;
  label: ReactNode;
  value: T;
  disabled?: boolean;
};

export default function Select<T>({
  label,
  selected,
  onChange,
  options,
  placement = "top-end",
}: {
  label?: string;
  selected: Option<T>;
  onChange: (value: T) => void;
  options: Option<T>[];
  placement?:
    | "top-end"
    | "top-start"
    | "bottom-end"
    | "bottom-start"
    | "bottom";
}) {
  return (
    <Listbox value={selected.value} onChange={onChange}>
      <Float
        as="div"
        className="relative"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        placement={placement}
        offset={4}
        flip={true}
        floatingAs={Fragment}
      >
        <Listbox.Button as="div" className="inline-flex gap-2 w-full">
          {label ? (
            <div className="my-auto inline-block">
              <Listbox.Label className="text-sm text-stone-500 dark:text-stone-400 whitespace-nowrap">
                {label}
              </Listbox.Label>
            </div>
          ) : null}
          <Submit className="w-full cursor-default border pl-3 pr-10 text-left">
            <span className="block truncate">{selected.label}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ExpandIcon
                className="h-5 w-5 text-stone-400"
                aria-hidden="true"
              />
            </span>
          </Submit>
        </Listbox.Button>
        <Listbox.Options className="max-h-60 w-full overflow-auto rounded-lg bg-stone-50 dark:bg-stone-700 py-1 text-base shadow-lg ring-1 ring-stone-900 dark:ring-stone-600 ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <Listbox.Option
              key={option.id}
              value={option.value}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active
                    ? "bg-amber-100 text-amber-900"
                    : "text-stone-900 dark:text-stone-400"
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span
                    className={`block truncate ${
                      selected ? "font-medium" : "font-normal"
                    }`}
                  >
                    {option.label}
                  </span>
                  {selected ? (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : null}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Float>
    </Listbox>
  );
}
