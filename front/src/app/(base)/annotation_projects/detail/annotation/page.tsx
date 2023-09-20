"use client";
import { notFound } from "next/navigation";
import { useContext } from "react";
import { AnnotationProjectContext } from "../context";
import useTasks from "@/hooks/api/useTasks";
import Empty from "@/components/Empty";
import Loading from "@/app/loading";
import AnnotateTask from "../../components/AnnotateTask";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  const tasks = useTasks({
    pageSize: -1,
    filter: {
      project__eq: project?.id ?? -1,
    },
  });

  if (project == null) return notFound();

  if (tasks.query.isLoading) {
    return <Loading />;
  }

  if (tasks.items.length === 0) {
    return (
      <Empty>
        No task available. Please add more tasks to this project to continue
        annotating.
      </Empty>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <AnnotateTask task_id={tasks.items[0].id} />
    </div>
  );
}
