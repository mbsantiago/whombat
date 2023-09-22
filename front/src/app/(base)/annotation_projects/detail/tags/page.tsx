"use client";
import { notFound } from "next/navigation";
import { useContext } from "react";

import { H3 } from "@/components/Headings";
import { TagsIcon } from "@/components/icons";
import ProjectTags from "@/components/annotation_projects/ProjectTags";
import { AnnotationProjectContext } from "@/app/contexts";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  if (project == null) return notFound();

  return (
    <div className="p-4 flex flex-col gap-4">
      <H3>
        <TagsIcon className="h-5 w-5 align-middle inline-block mr-2" />
        Project Tags
      </H3>
      <p className="text-stone-500">
        <span className="text-emerald-500 font-bold">Tags</span> are used to
        provide meaning to the annotations. Here you can see which tags are
        available for this project, or add more if needed.
      </p>
      <ProjectTags project={project} />
    </div>
  );
}
