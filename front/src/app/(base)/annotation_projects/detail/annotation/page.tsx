"use client";
import { useContext } from "react";

import AnnotateTasks from "@/app/components/annotation/AnnotationTasks";
import AnnotationProjectContext from "../../../../contexts/annotationProject";

export default function Page() {
  const project = useContext(AnnotationProjectContext);
  return <AnnotateTasks annotationProject={project} />;
}

// const search = useSearchParams();
// const pathname = usePathname();
// const router = useRouter();
//
// const project = useContext(AnnotationProjectContext);
// const user = useContext(UserContext);
//
// const annotationTaskUUID = search.get("annotation_task_uuid");
//
// const annotationTask = useAnnotationTask({
//   uuid: annotationTaskUUID || "",
//   enabled: !!annotationTaskUUID,
// });
//
// const spectrogramSettings = useStore((state) => state.spectrogramSettings);
// const setParameters = useStore((state) => state.setSpectrogramSettings);
//
// const onSpectrogramSettingsChange = useCallback(
//   (parameters: SpectrogramSettings) => {
//     toast.success("Spectrogram settings saved.");
//     setParameters(parameters);
//   },
//   [setParameters],
// );
//
// const { mutate: handleTagCreate } = useMutation({
//   mutationFn: async (tag: Tag) => {
//     return await api.annotationProjects.addTag(project, tag);
//   },
// });
//
// const onChangeTask = useCallback(
//   (task: AnnotationTask) => {
//     const url = changeURLParam({
//       pathname,
//       search,
//       param: "annotation_task_uuid",
//       value: task.uuid,
//     });
//     router.push(url);
//   },
//   [router, pathname, search],
// );
//
// const handleCompleteTask = useCallback(() => {
//   toast.success("Task marked as complete.");
// }, []);
//
// const handleRejectTask = useCallback(() => {
//   toast.error("Task marked for review.");
// }, []);
//
// const handleVerifyTask = useCallback(() => {
//   toast.success("Task verified.");
// }, []);
//
// const filter = useMemo(
//   () => ({
//     annotation_project: project,
//   }),
//   [project],
// );
//
// if (annotationTask.isLoading && !annotationTask.data) {
//   return <Loading />;
// }
//
