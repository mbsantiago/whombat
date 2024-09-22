import { type FC } from "react";

import { DeleteIcon, TagIcon } from "@/lib/components/icons";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import Button from "@/lib/components/ui/Button";
import Popover from "@/lib/components/ui/Popover";

import { type Tag } from "@/lib/types";

/**
 * SelectedMenu Component
 *
 * This component renders a menu for actions that can be performed on selected
 * items in a table. It displays the number of selected items and provides
 * buttons for deleting or tagging the selected items.
 *
 * Example usage:
 *
 * ```tsx
 * <SelectedMenu
 *   numSelected={5}
 *   onDeleteSelected={() => console.log('Delete selected')}
 *   onTagSelected={(tag) => console.log('Tag selected', tag)}
 * />
 * ```
 */
export default function SelectedMenu({
  numSelected,
  onDeleteSelected,
  onTagSelected,
  TagSearchBar = TagSearchBarBase,
  canCreateTag = true,
  ...props
}: {
  /** The number of selected items. */
  numSelected: number;
  /** Callback function to handle deleting the selected items. */
  onDeleteSelected?: () => void;
  /** Callback function to handle tagging the selected items. */
  onTagSelected?: (tag: Tag) => void;
  /** If true, allows the creation of new tags in the tag search bar. Default is true. */
  canCreateTag?: boolean;
  /** The tag search bar component to render inside the tag button popover. Default is `TagSearchBarBase`. */
  TagSearchBar?: FC<TagSearchBarProps>;
} & Omit<TagSearchBarProps, "canCreate" | "onTagSelected">) {
  if (numSelected === 0) {
    return null;
  }

  return (
    <ul className="flex flex-row items-center space-x-2">
      <li className="px-2">
        <span className="mr-1 font-bold text-blue-500">{numSelected}</span>
        selected
      </li>
      <li>
        <Button mode="text" variant="danger" onClick={onDeleteSelected}>
          <DeleteIcon className="inline-block mr-1 w-5 h-5 align-middle" />
          delete selected
        </Button>
      </li>
      <li>
        <Popover
          placement="bottom-end"
          button={
            <Button mode="text" variant="primary">
              <TagIcon className="inline-block mr-1 w-5 h-5 align-middle" />
              tag selected
            </Button>
          }
        >
          {() => (
            <TagSearchBar
              canCreate={canCreateTag}
              onSelectTag={onTagSelected}
              placement="bottom-end"
              {...props}
            />
          )}
        </Popover>
      </li>
    </ul>
  );
}
