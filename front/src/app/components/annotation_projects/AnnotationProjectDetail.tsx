import AnnotationProjectDetailBase from "@/lib/components/annotation_projects/AnnotationProjectDetail";
import AnnotationProjectNotesSummary from "./AnnotationProjectNotesSummary";
import AnnotationProjectTagsSummary from "./AnnotationProjectTagsSummary";
import AnnotationProjectProgress from "./AnnotationProjectProgress";
import AnnotationProjectUpdate from "./AnnotationProjectUpdate";
import AnnotationProjectActions from "./AnnotationProjectActions";

import type { AnnotationProject } from "@/lib/types";

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
