"use client";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import { useContext } from "react";

import useTasks from "@/hooks/api/useTasks";
import { H3 } from "@/components/Headings";
import { TasksIcon } from "@/components/icons";
import { type Task } from "@/api/tasks";
import ProjectClips from "@/components/annotation_projects/ProjectClips";
import { AnnotationProjectContext } from "@/app/contexts";

function TasksSummary({ tasks }: { tasks: Task[] }) {
  const recordings = useMemo(() => {
    const recordings = new Set();

    for (const task of tasks) {
      recordings.add(task.clip.recording.id);
    }

    return recordings.size;
  }, [tasks]);

  return (
    <ul className="list-disc list-inside">
      <li>
        Currently, there are{" "}
        <span className="text-blue-500 font-bold">{tasks.length}</span> tasks in
        this project.
      </li>
      <li>
        Sourced from{" "}
        <span className="text-blue-500 font-bold">{recordings}</span>{" "}
        recordings.
      </li>
    </ul>
  );
}

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  const filter = useMemo(
    () => ({ project__eq: project?.id ?? -1 }),
    [project?.id],
  );
  const tasks = useTasks({ pageSize: -1, filter });

  if (project == null) return notFound();

  return (
    <div className="p-4 flex flex-col gap-4">
      <H3>
        <TasksIcon className="h-5 w-5 align-middle inline-block mr-2" />
        Project Tasks
      </H3>
      <TasksSummary tasks={tasks.items} />
      <p>Add more tasks?</p>
      <ProjectClips project={project} />
    </div>
  );
}
