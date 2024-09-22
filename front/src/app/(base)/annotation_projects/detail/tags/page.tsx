"use client";

import { notFound } from "next/navigation";
import { useContext } from "react";

import ProjectTags from "@/app/components/annotation_projects/AnnotationProjectTags";

import Center from "@/lib/components/layouts/Center";

import AnnotationProjectContext from "../../../../contexts/annotationProject";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  if (project == null) return notFound();

  return (
    <Center>
      <ProjectTags annotationProject={project} />
    </Center>
  );
}
