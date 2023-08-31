import {
  type Tag as TagType,
  type TagCreate,
  type TagFilter,
} from "@/api/tags";
import { Fragment, useState, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Input } from "@/components/inputs";
import Tag from "@/components/Tag";
import Key from "@/components/Key";
import useStore from "@/store";
import useTags from "@/hooks/useTags";

function ComboBoxSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-1" role="none">
      {children}
    </div>
  );
}

function CreateNewTag({ tag: { key, value } }: { tag: TagCreate }) {
  if (key == null || value == null) {
    return (
      <ComboBoxSection>
        <div className="relative cursor-default select-none py-2 px-4">
          To create a new tag, type the tag in the format{" "}
          <code className="text-emerald-500">key:value</code> and press{" "}
          <Key code="Shift" />+<Key code="Enter" />
        </div>
      </ComboBoxSection>
    );
  }

  return (
    <ComboBoxSection>
      <div className="relative cursor-default select-none py-2 px-4">
        Create the tag{" "}
        <Tag disabled tag={{ id: 0, key, value }} color="blue" level={3} /> by
        pressing <Key code="Shift" />+<Key code="Enter" />
      </div>
    </ComboBoxSection>
  );
}

function NoTagsFound() {
  return (
    <ComboBoxSection>
      <div className="relative cursor-default select-none py-2 px-4">
        No tags found.{" "}
      </div>
    </ComboBoxSection>
  );
}

export default function TagSearchBar({
  onSelect,
  initialFilter = {},
}: {
  onSelect?: (tag: TagType) => void;
  initialFilter?: TagFilter;
}) {
  const tags = useTags({
    initialFilter,
  });
  const [query, setQuery] = useState("");

  const getTagColor = useStore((state) => state.getTagColor);

  const key = query.split(":")[0];
  const value = query.split(":")[1];

  const reset = () => {
    setQuery("");
    tags.filter.reset();
  };

  useEffect(() => {
    if (value == null || key == null) {
      tags.filter.set("search", query);
      tags.filter.clear("key__eq");
      tags.filter.clear("value__has");
    } else {
      tags.filter.clear("search");
      tags.filter.set("key__eq", key);
      tags.filter.set("value__has", value);
    }
  }, [query]);

  return (
    <Combobox onChange={(tag: TagType) => onSelect?.(tag)}>
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden text-left">
          <Combobox.Input
            as={Input}
            displayValue={() => ""}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.shiftKey) {
                event.preventDefault();
                if (key && value) {
                  tags.mutation.mutate({ key, value });
                }
              }
            }}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={reset}
        >
          <Combobox.Options className="absolute divide-y divide-stone-200 bg-stone-50 dark:divide-stone-600 dark:bg-stone-700 ring-stone-300 dark:ring-stone-600 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm">
            {tags.results.length === 0 ? (
              <NoTagsFound />
            ) : (
              <ComboBoxSection>
                {tags.results.map((tag) => (
                  <Combobox.Option
                    key={tag.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-4 ${
                        active ? "bg-stone-200 dark:bg-stone-600" : ""
                      }`
                    }
                    value={tag}
                  >
                    <Tag tag={tag} {...getTagColor(tag)} />
                  </Combobox.Option>
                ))}
              </ComboBoxSection>
            )}
            <CreateNewTag tag={{ key, value }} />
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
