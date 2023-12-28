import Button from "@/components/Button";
import { DeleteIcon, TagIcon } from "@/components/icons";

export default function SelectedMenu({
  selected,
  onDelete,
  onTag,
}: {
  selected: number;
  onDelete?: () => void;
  onTag?: () => void;
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
        <Button mode="text" variant="primary" onClick={onTag}>
          <TagIcon className="inline-block mr-1 w-5 h-5 align-middle" />
          tag selected
        </Button>
      </li>
    </ul>
  );
}
