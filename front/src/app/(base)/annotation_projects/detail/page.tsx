"use client";
import { useContext } from "react";
import { notFound } from "next/navigation";

import useTasks from "@/hooks/api/useTasks";
import useAnnotationProject from "@/hooks/api/useAnnotationProject";
import Loading from "@/app/loading";
import ProjectDetail from "@/components/annotation_projects/ProjectDetail";
import { AnnotationProjectContext } from "@/app/contexts";

export default function AnnotationProjectHome() {
  const context = useContext(AnnotationProjectContext);

  const project = useAnnotationProject({
    annotation_project_id: context?.id ?? -1,
  });

  const tasks = useTasks({
    pageSize: -1,
    filter: {
      project__eq: context?.id ?? -1,
    },
  });

  if (project == null) return notFound();
  if (project.query.data == null) return <Loading />;

  return (
    <ProjectDetail
      tasks={tasks.items}
      project={project.query.data}
      onChange={project.update.mutate}
      onDelete={project.delete.mutate}
      isLoading={project.query.isLoading || tasks.query.isLoading}
    />
  );
}
