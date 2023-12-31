import Link from "next/link";
import { type ReactNode } from "react";

import { AnnotationProjectIcon, CalendarIcon } from "@/components/icons";
import { type AnnotationProject as AnnotationProjectType } from "@/api/annotation_projects";

function Atom({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="mx-4 flex flex-row space-x-1">
      <div className="text-sm font-medium text-stone-500">{label}</div>
      <div className="text-sm text-stone-700 dark:text-stone-300">{value}</div>
    </div>
  );
}

export default function AnnotationProject({
  id,
  name,
  description,
  created_at,
}: AnnotationProjectType) {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-100">
          <span className="inline-block h-6 w-6 align-middle text-stone-500">
            <AnnotationProjectIcon />
          </span>{" "}
          <Link
            className="hover:font-bold hover:text-emerald-500"
            href={{
              pathname: "/annotation_projects/detail/",
              query: { annotation_project_id: id },
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
          value={created_at.toDateString()}
        />
      </div>
    </div>
  );
}
