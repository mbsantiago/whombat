"use client";
import Hero from "@/components/Hero";
import Empty from "@/components/Empty";
import { AddIcon, WarningIcon } from "@/components/icons";
import AnnotationProjectList from "@/components/annotation_projects/AnnotationProjectList";

function NoProjects() {
  return (
    <Empty>
      <WarningIcon className="w-16 h-16 text-stone-500" />
      <p>No annotation project exist yet!</p>
      <p>
        To create a new project, click on the
        <span className="text-emerald-500">
          <AddIcon className="inline-block mr-1 ml-2 w-4 h-4" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}

export default function AnnotationProjects() {
  return (
    <>
      <Hero text="Annotation Projects" />
      <AnnotationProjectList empty={<NoProjects />} />
    </>
  );
}
