import Link from "next/link";

import { Atom } from "@/lib/components/datasets/Dataset";
import { CalendarIcon, TasksIcon } from "@/lib/components/icons";

import type { EvaluationSet as EvaluationSetType } from "@/lib/types";

export default function EvaluationSet({
  evaluationSet,
}: {
  evaluationSet: EvaluationSetType;
}) {
  return (
    <div className="w-full">
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-100">
          <span className="inline-block w-6 h-6 align-middle text-stone-500">
            <TasksIcon />
          </span>{" "}
          <Link
            className="hover:font-bold hover:text-emerald-500"
            href={{
              pathname: "/evaluation/detail/",
              query: { evaluation_set_uuid: evaluationSet.uuid },
            }}
          >
            {evaluationSet.name}
          </Link>
          <span className="ms-4 text-sm text-stone-500">
            {evaluationSet.task}
          </span>
        </h3>
        <p className="mt-1 w-full text-sm leading-5 text-stone-600 dark:text-stone-400">
          {evaluationSet.description}
        </p>
      </div>
      <div className="flex flex-row py-4">
        <Atom
          label={<CalendarIcon className="w-4 h-4 align-middle" />}
          value={evaluationSet.created_on.toDateString()}
        />
      </div>
    </div>
  );
}
