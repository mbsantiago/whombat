import {
  CloseIcon,
  DeleteIcon,
  DownloadIcon,
  WarningIcon,
} from "@/lib/components/icons";
import Alert from "@/lib/components/ui/Alert";
import Button from "@/lib/components/ui/Button";

import type { AnnotationProject } from "@/lib/types";

export default function ProjectActions({
  annotationProject,
  onDeleteAnnotationProject,
  onDownloadAnnotationProject,
}: {
  annotationProject: AnnotationProject;
  onDeleteAnnotationProject?: () => void;
  onDownloadAnnotationProject?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 justify-center">
      <Button
        mode="text"
        variant="primary"
        onClick={onDownloadAnnotationProject}
      >
        <DownloadIcon className="inline-block mr-2 w-5 h-5" /> Download
      </Button>
      <DeleteProject
        annotationProject={annotationProject}
        onDelete={onDeleteAnnotationProject}
      />
    </div>
  );
}

function DeleteProject({
  annotationProject,
  onDelete,
}: {
  annotationProject: AnnotationProject;
  onDelete?: () => void;
}) {
  return (
    <Alert
      title={
        <>
          <WarningIcon className="inline-block mr-2 w-8 h-8 text-red-500" />
          Are you sure you want to delete this project?
        </>
      }
      button={
        <>
          <DeleteIcon className="inline-block mr-2 w-5 h-5" />
          Delete Project
        </>
      }
      mode="text"
      variant="danger"
    >
      {({ close }) => {
        return (
          <>
            <h2 className="p-4 font-extrabold text-center">
              {annotationProject.name}
            </h2>
            <div className="flex flex-col gap-2">
              <p>
                This action cannot be undone. All annotations and recordings
                associated with this project will be deleted.
              </p>
              <p>Do you want to proceed?</p>
            </div>
            <div className="flex flex-row gap-2 justify-end mt-4">
              <Button mode="outline" variant="primary" onClick={close}>
                <CloseIcon className="inline-block mr-2 w-5 h-5" />
                Cancel
              </Button>
              <Button mode="text" variant="danger" onClick={onDelete}>
                <DeleteIcon className="inline-block mr-2 w-5 h-5" />
                Delete
              </Button>
            </div>
          </>
        );
      }}
    </Alert>
  );
}
