import Button from "@/lib/components/ui/Button";
import { DeleteIcon, TagIcon } from "@/lib/components/icons";
import Popover from "@/lib/components/ui/Popover";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";

import type { Tag } from "@/lib/types";

export default function SelectedMenu({
  selected,
  onDelete,
  onTag,
}: {
  selected: number;
  onDelete?: () => void;
  onTag?: (tag: Tag) => void;
}) {
  if (selected === 0) {
    return null;
  }

  return (
    <ul className="flex flex-row items-center space-x-2">
      <li className="px-2">
        <span className="mr-1 font-bold text-blue-500">{selected}</span>
        selected
      </li>
      <li>
        <Button mode="text" variant="danger" onClick={onDelete}>
          <DeleteIcon className="inline-block mr-1 w-5 h-5 align-middle" />
          delete selected
        </Button>
      </li>
      <li>
        <Popover
          button={
            <Button mode="text" variant="primary">
              <TagIcon className="inline-block mr-1 w-5 h-5 align-middle" />
              tag selected
            </Button>
          }
        >
          {() => <TagSearchBar onSelectTag={onTag} />}
        </Popover>
      </li>
    </ul>
  );
}
