import { Fragment } from "react";
import { ExpandIcon, CheckIcon } from "@/components/icons";
import Button from "@/components/Button";
import { Listbox, Transition } from "@headlessui/react";

type Option<T> = {
  id: string | number;
  label: string;
  value: T;
  disabled?: boolean;
};

export default function Select<T>({
  label,
  selected,
  onChange,
  options,
}: {
  label?: string;
  selected: Option<T>;
  onChange: (value: T) => void;
  options: Option<T>[];
}) {
  return (
    <Listbox value={selected.value} onChange={onChange}>
      <div className="relative mt-1 flex space-x-2">
        {label ? (
          <div className="my-auto inline-block">
            <Listbox.Label className="text-sm text-stone-500">{label}</Listbox.Label>
          </div>
        ) : null}
        <Listbox.Button as="div" className="relative">
          <Button
            variant="secondary"
            mode="outline"
            className="w-full cursor-default pl-3 pr-10 text-left shadow-md"
          >
            <span className="block truncate">{selected.label}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ExpandIcon
                className="h-5 w-5 text-stone-400"
                aria-hidden="true"
              />
            </span>
          </Button>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option.value}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                  }`
                }
              >
                {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
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
        </Transition>
      </div>
    </Listbox>
  );
}
