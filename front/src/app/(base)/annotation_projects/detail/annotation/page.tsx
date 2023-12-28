"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import UserContext from "@/app/(base)/context";
import AnnotateProject from "@/components/annotation/AnnotateProject";
import Loading from "@/components/Loading";
import useAnnotationTask from "@/hooks/api/useAnnotationTask";
import useStore from "@/store";
import { changeURLParam } from "@/utils/url";

import AnnotationProjectContext from "../context";

import type { AnnotationTask, SpectrogramParameters } from "@/types";

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

  // Get spectrogram settings
  const parameters = useStore((state) => state.spectrogramSettings);
  const setParameters = useStore((state) => state.setSpectrogramSettings);

  const onParameterSave = useCallback(
    (parameters: SpectrogramParameters) => {
      toast.success("Spectrogram settings saved.");
      setParameters(parameters);
    },
    [setParameters],
  );

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

  if (user == null) {
    toast.error("You must be logged in to annotate.");
    return null;
  }

  if (annotationTask.isLoading && !annotationTask.data) {
    return <Loading />;
  }

  return (
    <AnnotateProject
      annotationTask={annotationTask.data}
      annotationProject={project}
      parameters={parameters}
      onChangeTask={onChangeTask}
      currentUser={user}
      onParameterSave={onParameterSave}
    />
  );
}
