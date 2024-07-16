import Description from "@/lib/components/ui/Description";
import { H3 } from "@/lib/components/ui/Headings";
import Loading from "@/lib/components/ui/Loading";
import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import type { AnnotationProject } from "@/lib/types";

export default function ProjectUpdateForm({
  project: data,
  onChange,
}: {
  project: AnnotationProject;
  onChange?: (data: AnnotationProject) => void;
}) {
  const {
    data: project,
    update,
    isLoading,
  } = useAnnotationProject({
    uuid: data.uuid,
    annotationProject: data,
    onUpdate: onChange,
  });

  return (
    <>
      <div className="px-4 sm:px-0">
        <H3>Details</H3>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        {isLoading || project == null ? (
          <Loading />
        ) : (
          <dl className="divide-y divide-stone-500">
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Name"
                value={project.name}
                onChange={(name) => update.mutate({ name })}
                type="text"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Description"
                value={project.description}
                onChange={(description) => update.mutate({ description })}
                type="textarea"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Annotation Instructions"
                value={project.annotation_instructions ?? ""}
                onChange={(annotation_instructions) =>
                  update.mutate({ annotation_instructions })
                }
                type="textarea"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Created On"
                value={project.created_on}
                type="text"
              />
            </div>
          </dl>
        )}
      </div>
    </>
  );
}
