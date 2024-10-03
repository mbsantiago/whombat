import AnnotationProjectDetailBase from "@/lib/components/annotation_projects/AnnotationProjectDetail";

import type { AnnotationProject } from "@/lib/types";

import AnnotationProjectActions from "./AnnotationProjectActions";
import AnnotationProjectNotesSummary from "./AnnotationProjectNotesSummary";
import AnnotationProjectProgress from "./AnnotationProjectProgress";
import AnnotationProjectTagsSummary from "./AnnotationProjectTagsSummary";
import AnnotationProjectUpdate from "./AnnotationProjectUpdate";

export default function AnnotationProjectDetail({
  annotationProject,
  onDeleteAnnotationProject,
}: {
  annotationProject: AnnotationProject;
  onDeleteAnnotationProject?: () => void;
}) {
  return (
    <AnnotationProjectDetailBase
      AnnotationProjectActions={
        <AnnotationProjectActions
          annotationProject={annotationProject}
          onDeleteAnnotationProject={onDeleteAnnotationProject}
        />
      }
      AnnotationProjectNotesSummary={
        <AnnotationProjectNotesSummary annotationProject={annotationProject} />
      }
      AnnotationProjectTagsSummary={
        <AnnotationProjectTagsSummary annotationProject={annotationProject} />
      }
      AnnotationProjectUpdate={
        <AnnotationProjectUpdate annotationProject={annotationProject} />
      }
      AnnotationProjectProgress={
        <AnnotationProjectProgress annotationProject={annotationProject} />
      }
    />
  );
}
