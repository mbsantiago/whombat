/** @module TagSearchBar.
 *
 * Definition of the TagSearchBar component which displays a search bar that
 * allows the user to search for tags and select them.
 * It provides a dropdown menu with the search results.
 * Additionally, it allows the user to create new tags by typing the tag in the
 * format `key:value` and pressing `Shift`+`Enter`.
 */
import { Combobox } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { forwardRef, useEffect, useState } from "react";

import { Input } from "@/components/inputs/index";
import KeyboardKey from "@/components/KeyboardKey";
import Tag from "@/components/tags/Tag";
import useTags from "@/hooks/api/useTags";
import useStore from "@/app/store";

import type { TagCreate, TagFilter } from "@/lib/api/tags";
import type { Tag as TagType } from "@/types";
import type { InputHTMLAttributes, KeyboardEvent } from "react";

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
        <div className="relative py-2 px-4 cursor-default select-none">
          To create a new tag, type the tag in the format{" "}
          <code className="text-emerald-500">key:value</code> and press{" "}
          <KeyboardKey code="Shift" />+<KeyboardKey code="Enter" />
        </div>
      </ComboBoxSection>
    );
  }

  return (
    <ComboBoxSection>
      <div className="relative py-2 px-4 cursor-default select-none">
        Create the tag{" "}
        <Tag disabled tag={{ key, value }} color="blue" level={3} /> by pressing{" "}
        <KeyboardKey code="Shift" />+<KeyboardKey code="Enter" />
      </div>
    </ComboBoxSection>
  );
}

function NoTagsFound() {
  return (
    <ComboBoxSection>
      <div className="relative py-2 px-4 cursor-default select-none">
        No tags found.{" "}
      </div>
    </ComboBoxSection>
  );
}

type TagSearchBarProps = {
  onSelect?: (tag: TagType) => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCreate?: (tag: TagType) => void;
  initialFilter?: TagFilter;
  canCreate?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onSelect" | "onChange" | "onKeyDown" | "onBlur"
>;

const emptyFilter = {};

export default forwardRef<HTMLInputElement, TagSearchBarProps>(
  function TagSearchBar(
    {
      onSelect,
      initialFilter = emptyFilter,
      onBlur,
      onKeyDown,
      onCreate,
      autoFocus = true,
      canCreate = true,
      ...props
    },
    ref,
  ) {
    const [query, setQuery] = useState("");

    const tags = useTags({ filter: initialFilter });
    const getTagColor = useStore((state) => state.getTagColor);

    const key = query.split(":")[0];
    const value = query.split(":")[1];

    useEffect(() => {
      let key = query.split(":")[0];
      let value = query.split(":")[1];

      if (value == null || key == null) {
        tags.filter.set("search", query);
        tags.filter.clear("key");
        tags.filter.clear("value");
      } else {
        tags.filter.clear("search");
        tags.filter.set("key", key);
        tags.filter.set("value", { has: value });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return (
      <Combobox
        onChange={(tag: TagType) => {
          onSelect?.(tag);
        }}
      >
        <Float
          offset={8}
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          placement="bottom"
          autoPlacement
          portal={true}
        >
          <div className="relative w-full text-left cursor-default">
            <Combobox.Input
              as={Input}
              ref={ref}
              autoFocus={autoFocus}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.shiftKey && canCreate) {
                  event.preventDefault();
                  if (key && value) {
                    tags.create.mutate(
                      { key, value },
                      {
                        onSuccess: (tag) => {
                          onCreate?.(tag);
                          onSelect?.(tag);
                        },
                      },
                    );
                  }
                }
                onKeyDown?.(event);
              }}
              {...props}
            />
            <Combobox.Button className="flex absolute inset-y-0 right-0 items-center pr-2">
              <ChevronUpDownIcon className="w-5 h-5" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="overflow-y-auto py-1 max-w-sm text-base rounded-md divide-y ring-1 ring-opacity-5 shadow-lg sm:text-sm focus:outline-none divide-stone-200 bg-stone-50 ring-stone-300 dark:divide-stone-600 dark:bg-stone-700 dark:ring-stone-600">
            {tags.items.length === 0 ? (
              <NoTagsFound />
            ) : (
              <ComboBoxSection>
                {tags.items.map((tag) => (
                  <Combobox.Option
                    key={`${tag.key}:${tag.value}`}
                    className={({ active }) =>
                      `cursor-default py-2 pl-4 pr-2 ${
                        active ? "bg-stone-200 dark:bg-stone-600" : ""
                      }`
                    }
                    value={tag}
                  >
                    <Tag
                      disabled
                      className="pointer-events-none"
                      tag={tag}
                      {...getTagColor(tag)}
                    />
                  </Combobox.Option>
                ))}
              </ComboBoxSection>
            )}
            {canCreate && <CreateNewTag tag={{ key, value }} />}
          </Combobox.Options>
        </Float>
      </Combobox>
    );
  },
);
