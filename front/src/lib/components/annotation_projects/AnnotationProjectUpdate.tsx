import {
  DescriptionData,
  DescriptionTerm,
  EditableDescriptionData,
} from "@/lib/components/Description";
import { H3 } from "@/lib/components/Headings";
import { Input, TextArea } from "@/lib/components/inputs/index";
import Loading from "@/lib/components/Loading";
import useAnnotationProject from "@/lib/hooks/api/useAnnotationProject";

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
              <DescriptionTerm>Name</DescriptionTerm>
              <EditableDescriptionData
                value={project.name}
                onChange={(name) => update.mutate({ name })}
                Input={Input}
                autoFocus
              >
                {project.name}
              </EditableDescriptionData>
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Description</DescriptionTerm>
              <EditableDescriptionData
                value={project.description}
                onChange={(description) => update.mutate({ description })}
                rows={6}
                Input={TextArea}
                autoFocus
              >
                {project.description}
              </EditableDescriptionData>
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Annotation Instructions</DescriptionTerm>
              <EditableDescriptionData
                value={project.annotation_instructions}
                onChange={(annotation_instructions) =>
                  update.mutate({
                    annotation_instructions: annotation_instructions || "",
                  })
                }
                rows={6}
                Input={TextArea}
                autoFocus
              >
                {project.annotation_instructions}
              </EditableDescriptionData>
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <DescriptionTerm>Created On</DescriptionTerm>
              <DescriptionData>
                {project.created_on.toLocaleString()}
              </DescriptionData>
            </div>
          </dl>
        )}
      </div>
    </>
  );
}
