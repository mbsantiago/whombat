import Card from "@/components/Card";
import Button from "@/components/Button";
import { AddIcon, TagsIcon } from "@/components/icons";
import { type AnnotationProject } from "@/api/annotation_projects";
import { H4 } from "@/components/Headings";
import Empty from "@/components/Empty";
import useAnnotationTags from "@/hooks/useAnnotationTags";
import useTaskTags from "@/hooks/useTaskTags";

function NoTags() {
  return (
    <Empty>
      No tags registered for this project. Add some tags to start annotating.
    </Empty>
  );
}

export default function ProjectTagsSummary({
  project,
}: {
  project: AnnotationProject;
}) {
  const annotationTags = useAnnotationTags({
    filter: {
      project__eq: project.id,
    },
  });

  const taskTags = useTaskTags({
    filter: {
      project__eq: project.id,
    },
  });

  const projectTags = project.tags;

  return (
    <Card>
      <div className="flex flex-row items-center justify-between">
        <H4>
          <TagsIcon className="h-5 w-5 inline-block mr-2" />
          Project Tags
        </H4>
        <Button mode="text" variant="primary">
          <AddIcon className="h-5 w-5 inline-block mr-2" /> Add Tags
        </Button>
      </div>
      {projectTags.length === 0 ? <NoTags /> : <div>Tags</div>}
    </Card>
  );
}
