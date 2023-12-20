import Card from "@/components/Card";
import { type Dataset } from "@/api/schemas";
import {
  DescriptionData,
  DescriptionTerm,
  EditableDescriptionData,
} from "@/components/Description";
import { Input, TextArea } from "@/components/inputs";
import useDataset from "@/hooks/api/useDataset";
import DatasetActions from "@/components/datasets/DatasetActions";

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
      <DatasetActions dataset={data} downloadLink={dataset.downloadLink} />
      <Card>
        <div className="px-4 sm:px-0">
          <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
            Dataset Information
          </h3>
        </div>
        <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
          <dl className="divide-y divide-stone-500">
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Name</DescriptionTerm>
              <EditableDescriptionData
                value={data.name}
                onChange={(value) => dataset.update.mutate({ name: value })}
                Input={Input}
                autoFocus
              >
                {data.name}
              </EditableDescriptionData>
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Description</DescriptionTerm>
              <EditableDescriptionData
                value={data.description}
                onChange={(value) =>
                  dataset.update.mutate({ description: value })
                }
                Input={TextArea}
                autoFocus
              >
                {data.description}
              </EditableDescriptionData>
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Created On</DescriptionTerm>
              <DescriptionData>
                {data.created_on.toLocaleString()}
              </DescriptionData>
            </div>
          </dl>
        </div>
      </Card>
    </div>
  );
}
