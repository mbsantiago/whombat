import DetailLayout from "@/lib/components/layouts/Detail";

import DatasetNotesSummary from "./DatasetNotesSummary";
import DatasetOverview from "./DatasetOverview";
import DatasetTagsSummary from "./DatasetTagsSummary";
import DatasetUpdate from "./DatasetUpdateForm";

import type { Dataset, Tag } from "@/lib/types";

/**
 * Component to display detailed information about a dataset, including overview,
 * tags summary, notes summary, and an update section.
 *
 * @param dataset - The dataset for which to display detailed information.
 * @returns JSX element displaying the dataset details.
 */
export default function DatasetDetail({
  dataset,
  onTagClick,
}: {
  dataset: Dataset;
  onTagClick?: (tag: Tag) => void;
}) {
  return (
    <DetailLayout sideBar={<DatasetUpdate dataset={dataset} />}>
      <div className="grid grid-cols-2 gap-8">
        <div className="col-span-2">
          <DatasetOverview dataset={dataset} />
        </div>
        <div className="col-span-2 xl:col-span-1">
          <DatasetTagsSummary dataset={dataset} onTagClick={onTagClick} />
        </div>
        <div className="col-span-2 xl:col-span-1">
          <DatasetNotesSummary dataset={dataset} />
        </div>
      </div>
    </DetailLayout>
  );
}
