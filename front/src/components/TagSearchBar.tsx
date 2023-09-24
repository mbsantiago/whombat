/** @module TagSearchBar.
 *
 * Definition of the TagSearchBar component which displays a search bar that
 * allows the user to search for tags and select them.
 * It provides a dropdown menu with the search results.
 * Additionally, it allows the user to create new tags by typing the tag in the
 * format `key:value` and pressing `Shift`+`Enter`.
 */
import { Float } from "@headlessui-float/react";
import {
  type InputHTMLAttributes,
  type KeyboardEvent,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

import {
  type TagCreate,
  type TagFilter,
  type Tag as TagType,
} from "@/api/tags";
import { Input } from "@/components/inputs";
import Tag from "@/components/Tag";
import Key from "@/components/Key";
import useStore from "@/store";
import useTags from "@/hooks/api/useTags";

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

type TagSearchBarProps = {
  onSelect?: (tag: TagType) => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCreate?: (tag: TagType) => void;
  initialFilter?: TagFilter;
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
      ...props
    },
    ref,
  ) {
    const [query, setQuery] = useState("");

    const tags = useTags({ initialFilter });
    const getTagColor = useStore((state) => state.getTagColor);

    const key = query.split(":")[0];
    const value = query.split(":")[1];

    useEffect(() => {
      let key = query.split(":")[0];
      let value = query.split(":")[1];

      if (value == null || key == null) {
        tags.filter.set("search", query);
        tags.filter.clear("key__eq");
        tags.filter.clear("value__has");
      } else {
        tags.filter.clear("search");
        tags.filter.set("key__eq", key);
        tags.filter.set("value__has", value);
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
          offset={4}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          autoPlacement
          portal={true}
        >
          <div className="relative w-full cursor-default text-left">
            <Combobox.Input
              as={Input}
              ref={ref}
              autoFocus={autoFocus}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.shiftKey) {
                  event.preventDefault();
                  if (key && value) {
                    tags.create.mutate({ key, value }, {
                      onSuccess: (tag) => {
                        onCreate?.(tag);
                      }
                    });
                  }
                }
                onKeyDown?.(event);
              }}
              {...props}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="max-w-sm divide-y divide-stone-200 bg-stone-50 dark:divide-stone-600 dark:bg-stone-700 ring-stone-300 dark:ring-stone-600 rounded-md py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm overflow-y-scroll">
            {tags.items.length === 0 ? (
              <NoTagsFound />
            ) : (
              <ComboBoxSection>
                {tags.items.map((tag) => (
                  <Combobox.Option
                    key={tag.id}
                    className={({ active }) =>
                      `cursor-default py-2 pl-4 ${
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
            <CreateNewTag tag={{ key, value }} />
          </Combobox.Options>
        </Float>
      </Combobox>
    );
  },
);
