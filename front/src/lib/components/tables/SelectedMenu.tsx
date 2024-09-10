import { type ComponentProps } from "react";

import Button from "@/lib/components/ui/Button";
import { DeleteIcon, TagIcon } from "@/lib/components/icons";
import Popover from "@/lib/components/ui/Popover";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";

import type { Tag } from "@/lib/types";

export default function SelectedMenu({
  numSelected,
  tags,
  canCreateTag,
  tagColorFn,
  onDeleteSelected,
  onTagSelected,
  onChangeTagQuery,
  onCreateTag,
}: {
  numSelected: number;
  tags?: Tag[];
  canCreateTag?: boolean;
  tagColorFn?: ComponentProps<typeof TagSearchBar>["tagColorFn"];
  onChangeTagQuery?: ComponentProps<typeof TagSearchBar>["onChangeQuery"];
  onCreateTag?: ComponentProps<typeof TagSearchBar>["onCreateTag"];
  onDeleteSelected?: () => void;
  onTagSelected?: (tag: Tag) => void;
}) {
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
              tags={tags}
              placement="bottom-end"
              canCreate={canCreateTag}
              tagColorFn={tagColorFn}
              onCreateTag={onCreateTag}
              onSelectTag={onTagSelected}
              onChangeQuery={onChangeTagQuery}
            />
          )}
        </Popover>
      </li>
    </ul>
  );
}
