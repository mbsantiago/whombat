"use client";
import { useContext, useState, useCallback } from "react";

import useStore from "@/store";
import useTaskAnnotations from "@/hooks/annotation/useAnnotationTasks";
import useStateParams from "@/hooks/useStateParams";
import AnnotationProgress from "@/components/annotation/AnnotationProgress";
import Empty from "@/components/Empty";
import Loading from "@/app/loading";
import AnnotateTask from "@/components/annotation/AnnotateTask";
import { AnnotationProjectContext } from "@/app/contexts";
import { CompleteIcon } from "@/components/icons";
import { type Tag } from "@/api/schemas";
import api from "@/app/api";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  // Get spectrogram settings
  const parameters = useStore((state) => state.spectrogramSettings);

  // Current tags
  const [tags, setTags] = useState<Tag[]>([]);

  // Load annotation tasks for this project
  const {
    isLoading,
    filter,
    total,
    complete,
    pending,
    refresh,
    current,
    next,
    previous,
  } = useTaskAnnotations({
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
      if (!project.tags.includes(tag)) {
        api.annotationProjects.addTag(project.id, tag.id);
      }

      setTags((tags) => {
        if (tags.includes(tag)) {
          return tags;
        }
        return [...tags, tag];
      });
    },
    [setTags, project.id, project.tags],
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
        next={next}
        previous={previous}
      />
      {current == null ? (
        <Empty>
          <div>
            <CompleteIcon className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-lg font-medium">Congratulations!</p>
          <p>
            You have completed all tasks in this project{" "}
            {filter.size > 0 ? "with the current filter settings. " : ""}
            Add additional tasks
            {filter.size > 0 ? ", or change the filter settings, " : ""}to
            continue annotating.
          </p>
        </Empty>
      ) : (
        <AnnotateTask
          parameters={parameters}
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
