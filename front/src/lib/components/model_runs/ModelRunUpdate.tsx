import Card from "@/lib/components/ui/Card";
import Description from "@/lib/components/ui/Description";

import type { ModelRun, ModelRunUpdate } from "@/lib/types";

export default function ModelRunUpdateForm(props: {
  modelRun: ModelRun;
  onUpdate?: (data: ModelRunUpdate) => void;
}) {
  return (
    <Card>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
          {props.modelRun.name}
        </h3>
        <p className="text-xs text-stone-500">{props.modelRun.version}</p>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="py-6 px-4 sm:px-0">
            <Description
              name="Description"
              value={props.modelRun.description ?? ""}
              onChange={(description) => props.onUpdate?.({ description })}
              type="textarea"
              editable
            />
          </div>
          <div className="py-6 px-4 sm:px-0">
            <Description
              name="Imported On"
              value={props.modelRun.created_on}
              type="date"
            />
          </div>
        </dl>
      </div>
    </Card>
  );
}
