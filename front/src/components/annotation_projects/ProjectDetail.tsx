import Card from "@/components/Card";
import { type AnnotationProjectUpdate } from "@/api/annotation_projects";
import {
  type AnnotationTask,
  type AnnotationProject,
} from "@/api/schemas";

import ProjectActions from "./ProjectActions";
import ProjectUpdateForm from "./ProjectUpdateForm";
import ProjectProgress from "./ProjectProgress";
import ProjectTagsSummary from "./ProjectTagsSummary";
import ProjectNotesSummary from "./ProjectNotesSummary";
// import ProjectSoundEventsSummary from "./ProjectSoundEventsSummary";

export default function ProjectDetail({
  project,
  tasks,
  isLoading = false,
  onChange,
  onDelete,
}: {
  project: AnnotationProject;
  tasks?: AnnotationTask;
  isLoading?: boolean;
  onChange?: (data: AnnotationProjectUpdate) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-row gap-8 justify-between w-100">
      <div className="grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <ProjectProgress tasks={tasks ?? []} isLoading={isLoading} />
          </div>
          <ProjectTagsSummary project={project} />
          <ProjectNotesSummary project={project} />
        </div>
      </div>
      <div className="flex flex-col flex-none gap-4 max-w-sm">
        <ProjectActions onDelete={onDelete} />
        <div className="sticky top-8">
          <Card>
            <ProjectUpdateForm project={project} onChange={onChange} />
          </Card>
        </div>
      </div>
    </div>
  );
}
