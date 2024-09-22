import { ScoreIcon } from "@/lib/components/icons";
import MetricBadge from "@/lib/components/ui/MetricBadge";

import type { Evaluation } from "@/lib/types";

export default function Evaluation(props: { evaluation: Evaluation }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center gap-8">
        <MetricBadge
          icon={
            <ScoreIcon className="h-5 w-5 inline-block text-stone-500 mr-1 align-middle" />
          }
          title="Overall Score"
          value={(100 * props.evaluation.score).toFixed(2)}
        />
        <div className="flex grow flex-col gap-2 items-end">
          <span className="text-md font-bold text-stone-500">Metrics</span>
          <div className="flex flex-row flex-wrap gap-8">
            {props.evaluation.metrics?.map((metric) => (
              <div
                key={metric.name}
                className="flex flex-row items-center gap-2"
              >
                <span className="text-sm text-stone-500">{metric.name}</span>
                <span className="text-lg">
                  {(100 * metric.value).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end">
        <span className="text-sm text-stone-500 ">
          Evaluated on {props.evaluation.created_on.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
