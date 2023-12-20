import { useMemo } from "react";
import Link from "next/link";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Empty from "@/components/Empty";
import { AddIcon, TagsIcon } from "@/components/icons";
import { H4 } from "@/components/Headings";
import { type AnnotationProject } from "@/api/schemas";

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
  const {
    tags, id
  } = project;

  const filter = useMemo(
    () => ({
      project__eq: id,
    }),
    [id],
  );
  const annotationTags = useAnnotationTags({ filter });
  const taskTags = useTaskTags({ filter });

  return (
    <Card>
      <div className="flex flex-row items-center justify-between">
        <H4>
          <TagsIcon className="h-5 w-5 inline-block mr-2" />
          Project Tags
        </H4>
        <Link
          href={`/annotation_projects/detail/tags/?annotation_project_id=${id}`}
        >
          <Button mode="text" variant="primary">
            <AddIcon className="h-5 w-5 inline-block mr-2" /> Add Tags
          </Button>
        </Link>
      </div>
      {tags.length === 0 ? (
        <NoTags />
      ) : (
        <div>
          There are{" "}
          <span className="text-blue-500 font-bold">{tags.length}</span>{" "}
          tags registered for this project.
        </div>
      )}
      {annotationTags.items.length === 0 ? (
        <NoAnnotationTags />
      ) : (
        <div> Annotation Tags</div>
      )}
      {taskTags.items.length === 0 ? <NoTaskTags /> : <div> Task Tags</div>}
    </Card>
  );
}
