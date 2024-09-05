/** @module TagSearchBar.
 *
 * Definition of the TagSearchBar component which displays a search bar that
 * allows the user to search for tags and select them.
 * It provides a dropdown menu with the search results.
 * Additionally, it allows the user to create new tags by typing the tag in the
 * format `key:value` and pressing `Shift`+`Enter`.
 */
import { forwardRef, useEffect, useState, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Float } from "@headlessui-float/react";

import Loading from "@/lib/components/ui/Loading";
import { Input } from "@/lib/components/inputs/index";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";
import Tag from "@/lib/components/tags/Tag";
import {
  getTagColor as getTagColorDefault,
  type Color,
} from "@/lib/utils/tags";

// TODO: Remove this
import useTags from "@/app/hooks/api/useTags";

import type { TagFilter } from "@/lib/api/tags";
import type { Tag as TagType } from "@/lib/types";
import type { InputHTMLAttributes, KeyboardEvent } from "react";

function ComboBoxSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-1" role="none">
      {children}
    </div>
  );
}

function CreateNewTag({ key, value }: { key?: string; value?: string }) {
  if (key == null || value == null) {
    return (
      <ComboBoxSection>
        <div className="relative py-2 px-4 cursor-default select-none">
          To create a new tag, type the tag in the format{" "}
          <code className="text-emerald-500">key:value</code> and press{" "}
          <KeyboardKey keys={["Shift", "Enter"]} />
        </div>
      </ComboBoxSection>
    );
  }

  return (
    <ComboBoxSection>
      <div className="relative py-2 px-4 cursor-default select-none">
        Create the tag{" "}
        <Tag disabled tag={{ key, value }} color="blue" level={3} /> by pressing{" "}
        <KeyboardKey keys={["Shift", "Enter"]} />
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
  getTagColor?: (tag: TagType) => Color;
  initialFilter?: TagFilter;
  canCreate?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onSelect" | "onChange" | "onKeyDown" | "onBlur"
>;

const emptyFilter = {};
const noTags: TagType[] = [];

function SearchBarResults({
  tags,
  getColorFn,
  isLoading = false,
  canCreate = false,
  key,
  value,
}: {
  tags: TagType[];
  getColorFn: (tag: TagType) => { color: string; level: number };
  isLoading?: boolean;
  canCreate?: boolean;
  key?: string;
  value?: string;
}) {
  return (
    <>
      {isLoading && <Loading text="Loading tags, please wait" />}
      {tags.length === 0 && !isLoading ? (
        <NoTagsFound />
      ) : (
        <ComboBoxSection>
          {tags.map((tag) => (
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
                {...getColorFn(tag)}
              />
            </Combobox.Option>
          ))}
        </ComboBoxSection>
      )}
      {canCreate && !isLoading && <CreateNewTag key={key} value={value} />}
    </>
  );
}

export function TagSearchBarComponent({
  autoFocus,
  canCreate,
  tags = noTags,
  isLoading = false,
  onSelect,
  onCreate,
  onChange,
  getTagColor = getTagColorDefault,
}: {
  autoFocus?: boolean;
  canCreate?: boolean;
  tags?: TagType[];
  isLoading?: boolean;
  disabled?: boolean;
  onSelect?: (tag: TagType) => void;
  onCreate?: (tag: TagType) => void;
  onChange?: (query: { s: string; key?: string; value?: string }) => void;
  getTagColor?: (tag: TagType) => { color: string; level: number };
}) {
  const [query, setQuery] = useState("");

  const { key, value } = useMemo(() => {
    const split = query.split(":");
    return { key: split[0], value: split[1] };
  }, [query]);

  useEffect(
    () =>
      onChange?.({
        s: query,
        key,
        value,
      }),
    [key, value, query, onChange],
  );

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
            autoFocus={autoFocus}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.shiftKey && canCreate) {
                event.preventDefault();
                if (key && value) {
                  onCreate?.({ key, value });
                }
              }
            }}
          />
          <Combobox.Button className="flex absolute inset-y-0 right-0 items-center pr-2">
            <ChevronUpDownIcon className="w-5 h-5" aria-hidden="true" />
          </Combobox.Button>
        </div>
        <Combobox.Options className="overflow-y-auto py-1 max-w-sm text-base rounded-md divide-y ring-1 ring-opacity-5 shadow-lg sm:text-sm focus:outline-none divide-stone-200 bg-stone-50 ring-stone-300 dark:divide-stone-600 dark:bg-stone-700 dark:ring-stone-600">
          <SearchBarResults
            isLoading={isLoading}
            tags={tags}
            getColorFn={getTagColor}
            canCreate={canCreate}
            key={key}
            value={value}
          />
        </Combobox.Options>
      </Float>
    </Combobox>
  );
}

const TagSearchBar = forwardRef<HTMLInputElement, TagSearchBarProps>(
  function TagSearchBar(
    {
      onSelect,
      initialFilter = emptyFilter,
      onBlur,
      onKeyDown,
      onCreate,
      autoFocus = true,
      canCreate = true,
      getTagColor = getTagColorDefault,
      ...props
    },
    ref,
  ) {
    const [query, setQuery] = useState("");

    const tags = useTags({ filter: initialFilter });

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
            {canCreate && <CreateNewTag key={key} value={value} />}
          </Combobox.Options>
        </Float>
      </Combobox>
    );
  },
);

export default TagSearchBar;
