import Link from "next/link";
import { useMemo } from "react";

import { type AnnotationProject } from "@/api/schemas";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Empty from "@/components/Empty";
import { H4 } from "@/components/Headings";
import { AddIcon, TagsIcon } from "@/components/icons";

function NoTags() {
  return (
    <Empty>
      No tags registered for this project. Add some tags to start annotating.
    </Empty>
  );
}

function NoAnnotationTags() {
  return (
    <div className="text-sm text-stone-500">
      There are no tags in any of the annotations in this project. Consider
      creating more annotations, or adding tags to existing annotations.
    </div>
  );
}

function NoTaskTags() {
  return (
    <div className="text-sm text-stone-500">
      There are no tags in any of the tasks in this project. Start annotating to
      add tags to tasks.
    </div>
  );
}

export default function ProjectTagsSummary({
  project,
}: {
  project: AnnotationProject;
}) {
  const filter = useMemo(
    () => ({
      annotation_project__eq: project.uuid,
    }),
    [project.uuid],
  );
  const tags = project.tags || [];
  // const annotationTags = useAnnotationTags({ filter });
  // const taskTags = useTaskTags({ filter });

  return (
    <Card>
      <div className="flex flex-row justify-between items-center">
        <H4>
          <TagsIcon className="inline-block mr-2 w-5 h-5" />
          Project Tags
        </H4>
        <Link
          href={`/annotation_projects/detail/tags/?annotation_project_uuid=${project.uuid}`}
        >
          <Button mode="text" variant="primary">
            <AddIcon className="inline-block mr-2 w-5 h-5" /> Add Tags
          </Button>
        </Link>
      </div>
      {tags.length === 0 ? (
        <NoTags />
      ) : (
        <div>
          There are{" "}
          <span className="font-bold text-blue-500">{tags.length}</span> tags
          registered for this project.
        </div>
      )}
      {/* {annotationTags.items.length === 0 ? ( */}
      {/*   <NoAnnotationTags /> */}
      {/* ) : ( */}
      {/*   <div> Annotation Tags</div> */}
      {/* )} */}
      {/* {taskTags.items.length === 0 ? <NoTaskTags /> : <div> Task Tags</div>} */}
    </Card>
  );
}
