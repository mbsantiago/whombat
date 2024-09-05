import Card from "@/lib/components/ui/Card";
import DatasetActions from "@/app/(base)/datasets/detail/components/DatasetActions";
import Description from "@/lib/components/ui/Description";
import useDataset from "@/app/hooks/api/useDataset";

import type { Dataset } from "@/lib/types";

export default function DatasetUpdateForm({
  dataset: data,
}: {
  dataset: Dataset;
}) {
  const dataset = useDataset({
    uuid: data.uuid,
    dataset: data,
    enabled: false,
  });

  return (
    <div className="flex flex-col">
      <DatasetActions
        dataset={data}
        downloadLink={dataset.download.json || ""}
      />
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
                value={data.name}
                onChange={(name) => dataset.update.mutate({ name })}
                type="text"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Description"
                value={data.description}
                onChange={(description) =>
                  dataset.update.mutate({ description })
                }
                type="textarea"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Created On"
                value={data.created_on}
                type="date"
              />
            </div>
          </dl>
        </div>
      </Card>
    </div>
  );
}
