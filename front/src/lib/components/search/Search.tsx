import type { CollectionElement, Node } from "@react-types/shared";
import classNames from "classnames";
import type { FuseOptionKey } from "fuse.js";
import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  DismissButton,
  Overlay,
  VisuallyHidden,
  useComboBox,
  useListBox,
  useOption,
  usePopover,
} from "react-aria";
import type { AriaListBoxOptions, AriaPopoverProps } from "react-aria";
import { type ComboBoxState, useComboBoxState } from "react-stately";

import { SearchIcon } from "@/lib/components/icons";
import { Input } from "@/lib/components/inputs";
import Loading from "@/lib/components/ui/Loading";

import useListWithSearch from "@/lib/hooks/lists/useListWithSearch";

function EmptyMessage({}: { state: ComboBoxState<any> }) {
  return <div className="p-2">No results</div>;
}

export default function Search<T extends object>({
  label,
  value,
  options,
  fields,
  isLoading = false,
  getOptionKey,
  displayValue,
  showMax = 10,
  delay = 300,
  emptyMessage = EmptyMessage,
  onSelect,
  onChangeSearch,
  children,
}: {
  label: string;
  value?: T | null;
  options: T[];
  fields: FuseOptionKey<T>[];
  showMax?: number;
  isLoading?: boolean;
  emptyMessage?: ({ state }: { state: ComboBoxState<T> }) => ReactElement;
  onSelect?: (value: T) => void;
  onChangeSearch?: (value: string) => void;
  getOptionKey: (value: T) => string;
  displayValue: (value: T) => string;
  delay?: number;
  children: (option: T) => CollectionElement<T>;
}) {
  const { search, items, setSearch } = useListWithSearch({
    options,
    fields: fields,
    limit: showMax,
  });

  const onSelectionChange = useCallback(
    (key: string | number | null) => {
      const option = options.find((option) => getOptionKey(option) === key);
      if (option) {
        onSelect?.(option);
        setSearch(displayValue(option));
      }
    },
    [options, getOptionKey, onSelect, setSearch, displayValue],
  );

  const props = useMemo(
    () => ({
      label,
      shouldCloseOnBlur: true,
      allowsEmptyCollection: true,
      items: items,
      inputValue: search,
      selectedKey: value ? getOptionKey(value) : null,
      onInputChange: (value: string) => setSearch(value),
      onSelectionChange,
      children,
    }),
    [
      label,
      items,
      search,
      setSearch,
      value,
      getOptionKey,
      onSelectionChange,
      children,
    ],
  );

  const state = useComboBoxState(props);

  // Setup refs and get props for child elements.
  const inputRef = useRef(null);
  const listBoxRef = useRef(null);
  const popoverRef = useRef(null);

  const { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state,
  );

  useEffect(() => {
    const timeout = setTimeout(() => onChangeSearch?.(search), delay);
    return () => clearTimeout(timeout);
  }, [search, delay, onChangeSearch]);

  return (
    <div className="flex items-center w-full">
      <VisuallyHidden>
        <label {...labelProps}>{label}</label>
      </VisuallyHidden>
      <div className="relative w-full">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 w-8 pointer-events-none">
          {isLoading ? <Loading /> : <SearchIcon />}
        </div>
        <Input {...inputProps} className="pl-10 text-sm 5" ref={inputRef} />
      </div>
      {state.isOpen && (
        <Popover
          state={state}
          triggerRef={inputRef}
          popoverRef={popoverRef}
          isNonModal
          placement="bottom start"
          offset={8}
        >
          <ListBox
            {...listBoxProps}
            listBoxRef={listBoxRef}
            state={state}
            emptyMessage={emptyMessage}
          />
        </Popover>
      )}
    </div>
  );
}

function ListBox<T>({
  state,
  listBoxRef,
  emptyMessage = EmptyMessage,
  ...props
}: AriaListBoxOptions<T> & {
  state: ComboBoxState<T>;
  emptyMessage?: ({ state }: { state: ComboBoxState<T> }) => ReactElement;
  listBoxRef: RefObject<HTMLUListElement>;
}) {
  let { listBoxProps } = useListBox(props, state, listBoxRef);

  return (
    <div className="w-full bg-stone-300 dark:bg-stone-700 rounded-md p-1">
      <ul {...listBoxProps} ref={listBoxRef} className="flex flex-col gap-1">
        {state.collection.size === 0
          ? emptyMessage({ state })
          : Array.from(state.collection).map((item) => (
              <Option key={item.key} item={item} state={state} />
            ))}
      </ul>
    </div>
  );
}

function Option<T>({
  item,
  state,
}: {
  item: Node<T>;
  state: ComboBoxState<T>;
}) {
  let ref = useRef(null);
  let { optionProps, isSelected, isFocused, isDisabled } = useOption(
    { key: item.key },
    state,
    ref,
  );

  return (
    <li
      {...optionProps}
      className={classNames("rounded-md p-2 cursor-pointer text-sm", {
        "bg-stone-400 dark:bg-stone-600": isSelected,
        "bg-stone-200 dark:bg-stone-800": isFocused,
        "text-gray-500": isDisabled,
      })}
      ref={ref}
    >
      {item.rendered}
    </li>
  );
}

function Popover({
  children,
  state,
  ...props
}: {
  children: ReactNode;
  state: ComboBoxState<any>;
  placement: string;
} & AriaPopoverProps) {
  let { popoverProps } = usePopover(props, state);
  const { triggerRef } = props;

  return (
    <Overlay>
      <div
        {...popoverProps}
        style={{
          width: triggerRef.current?.clientWidth,
          ...popoverProps.style,
        }}
        ref={props.popoverRef as React.RefObject<HTMLDivElement>}
      >
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}
