import { type AnnotationProjectUpdate } from "@/api/annotation_projects";
import {
  DescriptionData,
  DescriptionTerm,
  EditableDescriptionData,
} from "@/components/Description";
import { H3 } from "@/components/Headings";
import { Input, TextArea } from "@/components/inputs";
import { type AnnotationProject } from "@/api/schemas";

export default function ProjectUpdateForm({
  project,
  onChange,
}: {
  project: AnnotationProject;
  onChange?: (data: AnnotationProjectUpdate) => void;
}) {
  return (
    <>
      <div className="px-4 sm:px-0">
        <H3>Details</H3>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Name</DescriptionTerm>
            <EditableDescriptionData
              value={project.name}
              onChange={(value) => onChange?.({ name: value })}
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
              onChange={(value) => onChange?.({ description: value })}
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
              onChange={(value) =>
                onChange?.({ annotation_instructions: value ?? "" })
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
      </div>
    </>
  );
}
