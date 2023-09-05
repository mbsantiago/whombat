"use client";
import { useContext } from "react";
import { notFound } from "next/navigation";
import Loading from "@/app/loading";
import { AnnotationProjectContext } from "./context";
import ProjectDetail from "../components/ProjectDetail";

export default function AnnotationProjectHome() {
  const project = useContext(AnnotationProjectContext);

  if (project == null) return notFound();
  if (project.query.data == null) return <Loading />;

  return (
    <div className="container grid grid-cols-2 gap-4">
      <ProjectDetail
        project={project.query.data}
        onChange={project.update.mutate}
        onDelete={project.delete.mutate}
      />
    </div>
  );
}
