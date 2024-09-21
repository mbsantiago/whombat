import type { DatasetUpdate } from "@/lib/api/datasets";
import Card from "@/lib/components/ui/Card";
import Description from "@/lib/components/ui/Description";
import type { Dataset } from "@/lib/types";

export default function DatasetUpdateComponent({
  dataset,
  onChangeDataset,
}: {
  dataset: Dataset;
  onChangeDataset?: (dataset: DatasetUpdate) => void;
}) {
  return (
    <Card>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
          Dataset Information
        </h3>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Description
              name="Name"
              value={dataset.name}
              onChange={(name) => onChangeDataset?.({ name })}
              type="text"
              editable
            />
          </div>
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Description
              name="Description"
              value={dataset.description}
              onChange={(description) => onChangeDataset?.({ description })}
              type="textarea"
              editable
            />
          </div>
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <Description
              name="Created On"
              value={dataset.created_on}
              type="date"
            />
          </div>
        </dl>
      </div>
    </Card>
  );
}
