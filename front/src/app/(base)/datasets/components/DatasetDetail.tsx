import { type Dataset, type DatasetUpdate } from "@/api/datasets";
import DatasetOverview from "./DatasetOverview";
import DatasetTagsSummary from "./DatasetTagsSummary";
import DatasetNotesSummary from "./DatasetNotesSummary";
import DatasetActions from "./DatasetActions";
import DatasetUpdateForm from "./DatasetUpdateForm";

import useRecordingTags from "@/hooks/api/useRecordingTags";
import useRecordingNotes from "@/hooks/api/useRecordingNotes";

export default function DatasetDetail({
  dataset,
  onChange,
  downloadLink,
}: {
  dataset: Dataset;
  onChange?: (data: DatasetUpdate) => void;
  downloadLink?: string;
}) {
  const tags = useRecordingTags({
    pageSize: -1,
    filter: {
      dataset__eq: dataset.id,
    },
  });

  const notes = useRecordingNotes({
    pageSize: -1,
    filter: {
      dataset__eq: dataset.id,
    },
  });

  return (
    <div className="w-100 flex flex-row flex-wrap lg:flex-nowrap gap-8 justify-between">
      <div className="grow">
        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2">
            <DatasetOverview dataset={dataset} notes={notes.items} />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <DatasetTagsSummary
              tags={tags.items}
              isLoading={tags.query.isLoading}
            />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <DatasetNotesSummary
              notes={notes.items}
              isLoading={notes.query.isLoading}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-none max-w-sm gap-4">
        <DatasetActions downloadLink={downloadLink} />
        <div className="sticky top-8">
          <DatasetUpdateForm dataset={dataset} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
