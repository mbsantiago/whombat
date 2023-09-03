import { type Dataset } from "@/api/datasets";
import {
  RecordingsIcon,
  AddRecordingIcon,
  UploadIcon,
  DownloadIcon,
  DeleteIcon,
  TagIcon,
} from "@/components/icons";
import Button from "@/components/Button";

export function RecordingsNav({ dataset }: { dataset?: Dataset }) {
  return (
    <div className="flex flex-row items-center justify-between space-x-4 mb-3">
      <div>
        <RecordingsIcon className="h-5 w-5 align-middle inline-block text-stone-500 mr-1" />
        <span className="text-stone-500 font-semibold mr-1">
          {dataset?.recording_count}
        </span>
        <span className="font-thin">Recordings</span>
      </div>
      <ul className="flex flex-row space-x-3">
        <li>
          <Button mode="text" variant="secondary">
            <AddRecordingIcon className="h-5 w-5 align-middle inline-block text-emerald-500 mr-1" />
            add recordings
          </Button>
        </li>
        <li>
          <Button mode="text" variant="secondary">
            <UploadIcon className="h-5 w-5 align-middle inline-block text-emerald-500 mr-1" />
            import
          </Button>
        </li>
        <li>
          <Button mode="text" variant="secondary">
            <DownloadIcon className="h-5 w-5 align-middle inline-block text-emerald-500 mr-1" />
            export
          </Button>
        </li>
      </ul>
    </div>
  );
}

export function SelectedMenu({
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
        <span className="font-bold text-blue-500 mr-1">{selected}</span>
        selected
      </li>
      <li>
        <Button mode="text" variant="danger" onClick={onDelete}>
          <DeleteIcon className="h-5 w-5 align-middle inline-block mr-1" />
          delete selected
        </Button>
      </li>
      <li>
        <Button mode="text" variant="primary" onClick={onTag}>
          <TagIcon className="h-5 w-5 align-middle inline-block mr-1" />
          tag selected
        </Button>
      </li>
    </ul>
  );
}
