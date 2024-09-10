/** @module TagSearchBar.
 *
 * Definition of the TagSearchBar component which displays a search bar that
 * allows the user to search for tags and select them.
 * It provides a dropdown menu with the search results.
 * Additionally, it allows the user to create new tags by typing the tag in the
 * format `key:value` and pressing `Shift`+`Enter`.
 */
import {
  forwardRef,
  useState,
  useCallback,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  ComponentProps,
} from "react";
import { Combobox } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

import { Input } from "@/lib/components/inputs/index";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";
import Tag from "@/lib/components/tags/Tag";
import { getTagColor, type Color } from "@/lib/utils/tags";

import type { Tag as TagType } from "@/lib/types";

/**
 * ComboBoxSection component wraps its children with a div that has specific
 * styling.
 */
function ComboBoxSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-1 text-stone-700 dark:text-stone-300" role="none">
      {children}
    </div>
  );
}

/**
 * CreateNewTag component displays instructions or a preview for creating a new
 * tag.
 */
function CreateNewTag({
  tag,
}: {
  tag: { key: string | null; value: string | null };
}) {
  if (tag.key == null || tag.value == null) {
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
        <Tag
          disabled
          tag={{
            key: tag.key,
            value: tag.value,
          }}
          color="emerald"
          level={3}
        />{" "}
        by pressing <KeyboardKey keys={["Shift", "Enter"]} />
      </div>
    </ComboBoxSection>
  );
}

/**
 * NoTagsFound component displays a message indicating that no tags were found.
 */
function NoTagsFound() {
  return (
    <ComboBoxSection>
      <div className="relative py-2 px-4 cursor-default select-none">
        No tags found.{" "}
      </div>
    </ComboBoxSection>
  );
}

/**
 * Represents a query object used in the TagSearchBar component.
 */
type Query = {
  /** The search query string. */
  q: string;
  /** The key to search for, can be null. */
  key: string | null;
  /** The value to search for, can be null. */
  value: string | null;
};

type TagSearchBarProps = {
  /** List of tags to display in the dropdown menu. */
  tags?: TagType[];
  /** Flag indicating if new tags can be created. */
  canCreate?: boolean;
  /** Function to get the color of a tag. */
  tagColorFn?: (tag: TagType) => Color;
  /** Callback function for blur event. */
  onBlur?: () => void;
  /** Callback function for key down event. */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /** Callback function for creating a new tag. */
  onCreateTag?: (tag: TagType) => void;
  /** Callback function for selecting a tag. */
  onSelectTag?: (tag: TagType) => void;
  /** Callback function for change event. */
  onChangeQuery?: (query: Query) => void;
  placement?: ComponentProps<typeof Float>["placement"];
  autoPlacement?: ComponentProps<typeof Float>["autoPlacement"];
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onSelect" | "onChange" | "onKeyDown" | "onBlur"
>;

const _empty: TagType[] = [];

/**
 * TagSearchBar component allows users to search and select tags, and
 * optionally create new tags.
 */
const TagSearchBar = forwardRef<HTMLInputElement, TagSearchBarProps>(
  function TagSearchBar(
    {
      tags = _empty,
      tagColorFn = getTagColor,
      canCreate = true,
      onSelectTag,
      onChangeQuery,
      onKeyDown,
      onCreateTag,
      placement = "bottom",
      ...props
    },
    ref,
  ) {
    const [query, setQuery] = useState<Query>({
      q: "",
      key: null,
      value: null,
    });

    const handleQueryChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const q = event.target.value;
        const [key, value] = q.split(":", 2);
        const newQuery =
          value == null ? { q, key, value: null } : { q, key, value };
        setQuery(newQuery);
        onChangeQuery?.(newQuery);
      },
      [onChangeQuery],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && event.shiftKey && canCreate) {
          event.preventDefault();

          if (query.key && query.value) {
            onCreateTag?.({
              key: query.key,
              value: query.value,
            });
          }
        }

        onKeyDown?.(event);
      },
      [onKeyDown, canCreate, onCreateTag, query.key, query.value],
    );

    return (
      <Combobox onChange={(tag: TagType) => onSelectTag?.(tag)}>
        <Float
          offset={8}
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          placement={placement}
          autoPlacement={props.autoPlacement}
          portal={true}
        >
          <div className="relative w-full text-left cursor-default">
            <Combobox.Input
              as={Input}
              ref={ref}
              autoFocus={props.autoFocus}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              {...props}
            />
            <Combobox.Button className="flex absolute inset-y-0 right-0 items-center pr-2">
              <ChevronUpDownIcon className="w-5 h-5" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="overflow-y-auto py-1 max-w-sm text-base rounded-md divide-y ring-1 ring-opacity-5 shadow-lg sm:text-sm focus:outline-none divide-stone-200 bg-stone-50 ring-stone-300 dark:divide-stone-600 dark:bg-stone-700 dark:ring-stone-600">
            {tags.length === 0 ? (
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
                      {...tagColorFn(tag)}
                    />
                  </Combobox.Option>
                ))}
              </ComboBoxSection>
            )}
            {canCreate && (
              <CreateNewTag tag={{ key: query.key, value: query.value }} />
            )}
          </Combobox.Options>
        </Float>
      </Combobox>
    );
  },
);

export default TagSearchBar;
