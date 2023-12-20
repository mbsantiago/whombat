import { useMemo } from "react";

import Card from "@/components/Card";
import Empty from "@/components/Empty";
import { H4 } from "@/components/Headings";
import { CheckIcon, IssuesIcon } from "@/components/icons";
import { type AnnotationProject } from "@/api/schemas";
import WithLoading from "@/components/WithLoading";

function NoNotes() {
  return (
    <Empty>
      <CheckIcon className="h-8 w-8 text-emerald-500" />
      Currently, there are no issues in this project.
    </Empty>
  );
}

export default function ProjectNotesSummary({
  project,
}: {
  project: AnnotationProject;
}) {
  const filter = useMemo(
    () => ({
      project__eq: project.id,
    }),
    [project.id],
  );

  const annotationNotes = useAnnotationNotes({ filter });
  const taskNotes = useTaskNotes({ filter });

  const isLoading =
    annotationNotes.query.isLoading || taskNotes.query.isLoading;

  return (
    <Card>
      <div className="flex flex-row items-center justify-between">
        <H4>
          <IssuesIcon className="h-5 w-5 inline-block mr-2" />
          Project Issues
        </H4>
      </div>
      <WithLoading show={false} isLoading={isLoading}>
        {annotationNotes.items.length === 0 && taskNotes.items.length === 0 ? (
          <NoNotes />
        ) : (
          <div>Notes</div>
        )}
      </WithLoading>
    </Card>
  );
}
