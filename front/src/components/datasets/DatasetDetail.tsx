import DatasetNotesSummary from "./DatasetNotesSummary";
import DatasetOverview from "./DatasetOverview";
import DatasetTagsSummary from "./DatasetTagsSummary";
import DatasetUpdate from "./DatasetUpdateForm";

import type { Dataset } from "@/types";

/**
 * Component to display detailed information about a dataset, including overview,
 * tags summary, notes summary, and an update section.
 *
 * @param dataset - The dataset for which to display detailed information.
 * @returns JSX element displaying the dataset details.
 */
export default function DatasetDetail({ dataset }: { dataset: Dataset }) {
  return (
    <div className="flex flex-row flex-wrap gap-8 justify-between lg:flex-nowrap w-100">
      <div className="grow">
        <div className="grid grid-cols-2 gap-8">
          <div className="col-span-2">
            <DatasetOverview dataset={dataset} />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <DatasetTagsSummary dataset={dataset} />
          </div>
          <div className="col-span-2 xl:col-span-1">
            <DatasetNotesSummary dataset={dataset} />
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-none gap-4 max-w-sm">
        <div className="sticky top-8">
          <DatasetUpdate dataset={dataset} />
        </div>
      </div>
    </div>
  );
}
