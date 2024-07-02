"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import UserContext from "@/app/(base)/context";
import AnnotateTasks from "@/lib/components/annotation/AnnotateTasks";
import Loading from "@/lib/components/Loading";
import useAnnotationTask from "@/lib/hooks/api/useAnnotationTask";
import useStore from "@/app/store";
import { changeURLParam } from "@/lib/utils/url";

import AnnotationProjectContext from "../context";

import api from "@/app/api";
import type { AnnotationTask, SpectrogramParameters, Tag } from "@/lib/types";

export default function Page() {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const project = useContext(AnnotationProjectContext);
  const user = useContext(UserContext);

  const annotationTaskUUID = search.get("annotation_task_uuid");

  const annotationTask = useAnnotationTask({
    uuid: annotationTaskUUID || "",
    enabled: !!annotationTaskUUID,
  });

  const parameters = useStore((state) => state.spectrogramSettings);
  const setParameters = useStore((state) => state.setSpectrogramSettings);

  const onParameterSave = useCallback(
    (parameters: SpectrogramParameters) => {
      toast.success("Spectrogram settings saved.");
      setParameters(parameters);
    },
    [setParameters],
  );

  const { mutate: handleTagCreate } = useMutation({
    mutationFn: async (tag: Tag) => {
      return await api.annotationProjects.addTag(project, tag);
    },
  });

  const onChangeTask = useCallback(
    (task: AnnotationTask) => {
      const url = changeURLParam({
        pathname,
        search,
        param: "annotation_task_uuid",
        value: task.uuid,
      });
      router.push(url);
    },
    [router, pathname, search],
  );

  const handleCompleteTask = useCallback(() => {
    toast.success("Task marked as complete.");
  }, []);

  const handleRejectTask = useCallback(() => {
    toast.error("Task marked for review.");
  }, []);

  const handleVerifyTask = useCallback(() => {
    toast.success("Task verified.");
  }, []);

  const filter = useMemo(
    () => ({
      annotation_project: project,
    }),
    [project],
  );

  if (annotationTask.isLoading && !annotationTask.data) {
    return <Loading />;
  }

  return (
    <AnnotateTasks
      instructions={project.annotation_instructions || ""}
      taskFilter={filter}
      tagFilter={filter}
      annotationTask={annotationTask.data}
      parameters={parameters}
      onChangeTask={onChangeTask}
      currentUser={user}
      onParameterSave={onParameterSave}
      onCompleteTask={handleCompleteTask}
      onRejectTask={handleRejectTask}
      onVerifyTask={handleVerifyTask}
      onCreateTag={handleTagCreate}
    />
  );
}
