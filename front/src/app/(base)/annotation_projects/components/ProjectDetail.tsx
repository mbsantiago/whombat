import { Input, TextArea } from "@/components/inputs";
import {
  EditableDescriptionData,
  DescriptionData,
  DescriptionTerm,
} from "@/components/Description";
import Button from "@/components/Button";
import Alert from "@/components/Alert";
import { DeleteIcon, WarningIcon, CloseIcon } from "@/components/icons";
import {
  type AnnotationProjectUpdate,
  type AnnotationProject,
} from "@/api/annotation_projects";

export default function ProjectDetail({
  project,
  onChange,
  onDelete,
}: {
  project: AnnotationProject;
  onChange?: (data: AnnotationProjectUpdate) => void;
  onDelete?: () => void;
}) {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
          Annotation Project
        </h3>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
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
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
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
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Annotation Instructions</DescriptionTerm>
            <EditableDescriptionData
              value={project.annotation_instructions}
              onChange={(value) =>
                onChange?.({ annotation_instructions: value })
              }
              rows={6}
              Input={TextArea}
              autoFocus
            >
              {project.annotation_instructions}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Created On</DescriptionTerm>
            <DescriptionData>
              {project.created_at.toLocaleString()}
            </DescriptionData>
          </div>
        </dl>
      </div>
      <div className="flex flex-row justify-center">
        <Alert
          title={
            <>
              <WarningIcon className="inline-block w-8 h-8 mr-2 text-red-500" />
              Are you sure you want to delete this project?
            </>
          }
          button={
            <>
              <DeleteIcon className="inline-block w-5 h-5 mr-2" />
              Delete Project
            </>
          }
          variant="danger"
        >
          {({ close }) => {
            return (
              <>
                <div className="flex flex-col gap-2">
                  <p>
                    This action cannot be undone. All annotations and recordings
                    associated with this project will be deleted.
                  </p>
                  <p>Do you want to proceed?</p>
                </div>
                <div className="flex flex-row justify-end gap-2 mt-4">
                  <Button mode="outline" variant="primary" onClick={close}>
                    <CloseIcon className="h-5 w-5 inline-block mr-2" />
                    Cancel
                  </Button>
                  <Button mode="text" variant="danger" onClick={onDelete}>
                    <DeleteIcon className="h-5 w-5 inline-block mr-2" />
                    Delete
                  </Button>
                </div>
              </>
            );
          }}
        </Alert>
      </div>
    </div>
  );
}
