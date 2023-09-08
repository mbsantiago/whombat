"use client";
import { useContext } from "react";
import { notFound } from "next/navigation";
import useTasks from "@/hooks/useTasks";
import Loading from "@/app/loading";
import { AnnotationProjectContext } from "./context";
import ProjectDetail from "../components/ProjectDetail";

export default function AnnotationProjectHome() {
  const project = useContext(AnnotationProjectContext);
  const tasks = useTasks({
    pageSize: -1,
    filter: {
      project__eq: project?.query.data?.id ?? -1,
    }
  });

  if (project == null) return notFound();
  if (project.query.data == null) return <Loading />;

  return (
    <ProjectDetail
      tasks={tasks.items}
      project={project.query.data}
      onChange={project.update.mutate}
      onDelete={project.delete.mutate}
    />
  );
}
