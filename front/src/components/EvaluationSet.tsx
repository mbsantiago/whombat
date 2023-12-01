import Link from "next/link";

import { CalendarIcon, TasksIcon } from "@/components/icons";
import { type EvaluationSet as EvaluationSetType } from "@/api/evaluation_sets";
import { Atom } from "@/components/Dataset"


export default function EvaluationSet({
  id,
  name,
  description,
  created_on,
}: EvaluationSetType) {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-100">
          <span className="inline-block h-6 w-6 align-middle text-stone-500">
            <TasksIcon />
          </span>{" "}
          <Link
            className="hover:font-bold hover:text-emerald-500"
            href={{
              pathname: "/evaluation/detail/",
              query: { evaluation_set_id: id },
            }}
          >
            {name}
          </Link>
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-stone-600 dark:text-stone-400">
          {description}
        </p>
      </div>
      <div className="flex flex-row py-4">
        <Atom
          label={<CalendarIcon className="h-4 w-4 align-middle" />}
          value={created_on.toDateString()}
        />
      </div>
    </div>
  );
}
