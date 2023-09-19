import Card from "@/components/Card";
import {
  type AnnotationProjectUpdate,
  type AnnotationProject,
} from "@/api/annotation_projects";
import { type Task } from "@/api/tasks";
import ProjectActions from "./ProjectActions";
import ProjectUpdateForm from "./ProjectUpdateForm";
import ProjectProgress from "./ProjectProgress";
import ProjectTagsSummary from "./ProjectTagsSummary";
import ProjectNotesSummary from "./ProjectNotesSummary";
// import ProjectSoundEventsSummary from "./ProjectSoundEventsSummary";

export default function ProjectDetail({
  project,
  tasks,
  onChange,
  onDelete,
}: {
  project: AnnotationProject;
  tasks?: Task[];
  onChange?: (data: AnnotationProjectUpdate) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="w-100 flex flex-row gap-8 justify-between">
      <div className="grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <ProjectProgress tasks={tasks ?? []} />
          </div>
          <ProjectTagsSummary project={project} />
          <ProjectNotesSummary project={project}/>
        </div>
      </div>
      <div className="flex flex-col flex-none max-w-sm gap-4">
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
