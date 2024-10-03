import type { CollectionChildren } from "@react-types/shared";
import classNames from "classnames";
import { type RefObject, useRef } from "react";
import {
  type AriaListBoxProps,
  useListBox,
  useListBoxSection,
  useOption,
} from "react-aria";
import { type ListState, type Node, useListState } from "react-stately";

export default function ListBox<T extends object>(
  props: {
    listState?: ListState<T>;
    listBoxRef?: RefObject<HTMLUListElement>;
    children?: CollectionChildren<T>;
    renderEmptyState?: () => JSX.Element;
  } & Omit<AriaListBoxProps<T>, "children">,
) {
  let ref = useRef(null);
  let state = useListState(props);
  let { listBoxRef = ref, listState = state } = props;
  let { listBoxProps } = useListBox(props, listState, listBoxRef);

  return (
    <ul
      {...listBoxProps}
      className="overflow-y-auto py-1 max-w-sm text-base rounded-md divide-y ring-1 ring-opacity-5 shadow-lg sm:text-sm focus:outline-none text-stone-800 divide-stone-200 bg-stone-50 ring-stone-300 dark:text-stone-200 dark:divide-stone-600 dark:bg-stone-700 dark:ring-stone-600"
      ref={listBoxRef}
    >
      {Array.from(listState.collection, (item) =>
        item.type === "section" ? (
          <ListBoxSection key={item.key} section={item} state={listState} />
        ) : (
          <Option key={item.key} item={item} state={listState} />
        ),
      )}
      {listState.collection.size === 0 ? props.renderEmptyState?.() : null}
    </ul>
  );
}

export function Option<T>({
  item,
  state,
}: {
  item: Node<T>;
  state: ListState<T>;
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
      ref={ref}
      className={classNames(
        "cursor-pointer text-stone-800 dark:text-stone-200 py-2 pl-4 pr-2 outline-none",
        {
          "outline-2 outline-emerald-500 outline-offset-0": isFocused,
          "bg-stone-300 dark:bg-stone-800 text-stone-500 dark:text-stone-500":
            isDisabled,
          "bg-emerald-600": isSelected,
          "bg-stone-200 dark:bg-stone-600 text-stone-900 dark:text-stone-100":
            isFocused && !isSelected,
        },
      )}
    >
      {item.rendered}
    </li>
  );
}

function ListBoxSection<T>({
  section,
  state,
}: {
  section: Node<T>;
  state: ListState<T>;
}) {
  let { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    "aria-label": section["aria-label"],
  });

  return (
    <>
      <li {...itemProps} className="py-2">
        {section.rendered && (
          <span {...headingProps} className="py-4 px-1 text-base font-bold">
            {section.rendered}
          </span>
        )}
        <ul {...groupProps} className="p-0 list-none">
          {Array.from(
            state.collection.getChildren?.(section.key) ?? [],
            (node) => (
              <Option key={node.key} item={node} state={state} />
            ),
          )}
        </ul>
      </li>
    </>
  );
}

ListBox.Option = Option;
ListBox.Section = ListBoxSection;
