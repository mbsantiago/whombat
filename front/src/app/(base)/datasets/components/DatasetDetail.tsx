import { Input, TextArea } from "@/components/inputs";
import {
  EditableDescriptionData,
  DescriptionData,
  DescriptionTerm,
} from "@/components/Description";
import { type Dataset, type DatasetUpdate } from "@/api/datasets";

export default function DatasetDetail({
  dataset,
  onChange,
}: {
  dataset: Dataset;
  onChange?: (data: DatasetUpdate) => void;
}) {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
          Dataset Information
        </h3>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Name</DescriptionTerm>
            <EditableDescriptionData
              value={dataset.name}
              onChange={(value) => onChange?.({ name: value })}
              Input={Input}
              autoFocus
            >
              {dataset.name}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Description</DescriptionTerm>
            <EditableDescriptionData
              value={dataset.description}
              onChange={(value) => onChange?.({ description: value })}
              Input={TextArea}
              autoFocus
            >
              {dataset.description}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Created On</DescriptionTerm>
            <DescriptionData>
              {dataset.created_at.toLocaleString()}
            </DescriptionData>
          </div>
        </dl>
      </div>
    </div>
  );
}
