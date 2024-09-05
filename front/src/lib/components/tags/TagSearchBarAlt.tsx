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
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  type ChangeEvent,
} from "react";
import { useButton, useComboBox, useFilter } from "react-aria";
import { Combobox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Float } from "@headlessui-float/react";

import Loading from "@/lib/components/ui/Loading";
import { Input } from "@/lib/components/inputs/index";
import InputLabel from "@/lib/components/inputs/InputLabel";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";
import Tag from "@/lib/components/tags/Tag";
import {
  getTagColor as getTagColorDefault,
  type Color,
} from "@/lib/utils/tags";

import type { TagFilter } from "@/lib/api/tags";
import type { Tag as TagType } from "@/lib/types";
import type { InputHTMLAttributes, KeyboardEvent } from "react";

const _emptyFilter = {};

type Query = {
  query: string;
  key: string | null;
  value: string | null;
};

function useTagQuery({
  onQueryChange,
}: {
  onQueryChange?: (query: Query) => void;
}) {
  const [query, setQuery] = useState<Query>({
    query: "",
    value: null,
    key: null,
  });

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      const fragments = value.split(":");

      const newQuery =
        fragments.length === 1
          ? { query: value, value: null, key: null }
          : { query: value, value: fragments[1], key: fragments[0] };

      setQuery(newQuery);
      onQueryChange?.(newQuery);
    },
    [onQueryChange],
  );

  const clear = useCallback(
    () => setQuery({ query: "", key: null, value: null }),
    [],
  );

  const setKey = useCallback(
    (key: string) => setQuery((query) => ({ ...query, key })),
    [],
  );

  return {
    query,
    clear,
    setKey,
    handleQueryChange,
  };
}

export default function TagSearchBar({
  options,
  onQueryChange,
  label = "tags",
  getTagColor = getTagColorDefault,
}: {
  options: TagType[];
  label: string;
  onQueryChange?: (query: Query) => void;
  getTagColor: (tag: TagType) => Color;
}) {
  const { query, handleQueryChange } = useTagQuery({ onQueryChange });

  let inputRef = useRef(null);
  let listBoxRef = useRef(null);
  let popoverRef = useRef(null);

  let { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state,
  );

  return (
    <div>
      <InputLabel {...labelProps}>{label}</InputLabel>
      <div>
        <Input
          {...inputProps}
          value={query.query}
          onChange={handleQueryChange}
        />
      </div>
    </div>
  );
}
