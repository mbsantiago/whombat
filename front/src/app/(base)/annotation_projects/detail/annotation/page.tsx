"use client";
import { useContext, useState, useCallback } from "react";

import useAnnotationTasks from "@/hooks/annotation/useAnnotationTasks";
import useStateParams from "@/hooks/useStateParams";
import AnnotationProgress from "@/components/annotation/AnnotationProgress";
import Empty from "@/components/Empty";
import Loading from "@/app/loading";
import AnnotateTask from "@/components/annotation/AnnotateTask";
import { AnnotationProjectContext } from "@/app/contexts";
import { CompleteIcon } from "@/components/icons";
import { type Tag } from "@/api/tags";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  // Current tags
  const [tags, setTags] = useState<Tag[]>([]);

  // Load annotation tasks for this project
  const { isLoading, filter, total, complete, pending, refresh, current } =
    useAnnotationTasks({
      project,
    });

  // Get task_id from URL
  const [task_id] = useStateParams(
    current?.id,
    "task_id",
    (value: number) => value.toString(),
    (value: string) => parseInt(value, 10),
  );

  const onAddTag = useCallback(
    (tag: Tag) => {
      setTags((tags) => {
        if (tags.includes(tag)) {
          return tags;
        }
        return [...tags, tag];
      });
    },
    [setTags],
  );

  const onRemoveTag = useCallback(
    (tag: Tag) => {
      setTags((tags) => tags.filter((t) => t.id !== tag.id));
    },
    [setTags],
  );

  const onClearTags = useCallback(() => {
    setTags([]);
  }, [setTags]);

  if (isLoading || task_id == null) {
    return <Loading />;
  }

  if (total === 0) {
    return (
      <Empty>
        No task available. Please add more tasks to this project to continue
        annotating.
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnnotationProgress
        complete={complete}
        filter={filter}
        pending={pending}
      />
      {current == null ? (
        <Empty>
          <div>
            <CompleteIcon className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-lg font-medium">Congratulations!</p>
          <p>
            You have completed all tasks in this project. Add additional tasks
            to continue annotating.
          </p>
        </Empty>
      ) : (
        <AnnotateTask
          task_id={task_id}
          project={project}
          refresh={refresh}
          tags={tags}
          addTag={onAddTag}
          removeTag={onRemoveTag}
          clearTags={onClearTags}
        />
      )}
    </div>
  );
}
