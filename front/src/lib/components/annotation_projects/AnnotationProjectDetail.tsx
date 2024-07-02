import Card from "@/lib/components/Card";

import AnnotationProjectActions from "./AnnotationProjectActions";
import AnnotationProjectNotesSummary from "./AnnotationProjectNotesSummary";
import AnnotationProjectProgress from "./AnnotationProjectProgress";
import AnnotationProjectTagsSummary from "./AnnotationProjectTagsSummary";
import AnnotationProjectUpdate from "./AnnotationProjectUpdate";

import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectDetail({
  annotationProject,
  onChange,
  onDelete,
}: {
  annotationProject: AnnotationProject;
  onChange?: (data: AnnotationProject) => void;
  onDelete?: (data: Promise<AnnotationProject>) => void;
}) {
  return (
    <div className="flex flex-row gap-8 justify-between w-100">
      <div className="grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <AnnotationProjectProgress annotationProject={annotationProject} />
          </div>
          <AnnotationProjectTagsSummary project={annotationProject} />
          <AnnotationProjectNotesSummary project={annotationProject} />
        </div>
      </div>
      <div className="flex flex-col flex-none gap-4 max-w-sm">
        <AnnotationProjectActions
          annotationProject={annotationProject}
          onDelete={onDelete}
        />
        <div className="sticky top-8">
          <Card>
            <AnnotationProjectUpdate
              project={annotationProject}
              onChange={onChange}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
