import Description from "@/lib/components/ui/Description";
import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";
import Loading from "@/lib/components/ui/Loading";

import type { AnnotationProject } from "@/lib/types";
import type { AnnotationProjectUpdate } from "@/lib/api/annotation_projects";

export default function AnnotationProjectUpdateComponent({
  annotationProject: data,
  isLoading = false,
  onChangeAnnotationProject,
}: {
  annotationProject: AnnotationProject;
  isLoading: boolean;
  onChangeAnnotationProject?: (data: AnnotationProjectUpdate) => void;
}) {
  return (
    <Card>
      <div className="px-4 sm:px-0">
        <H3>Project Details</H3>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        {isLoading ? (
          <Loading />
        ) : (
          <dl className="divide-y divide-stone-500">
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Name"
                value={data.name}
                onChange={(name) => onChangeAnnotationProject?.({ name })}
                type="text"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Description"
                value={data.description}
                onChange={(description) =>
                  onChangeAnnotationProject?.({ description })
                }
                type="textarea"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Annotation Instructions"
                value={data.annotation_instructions ?? ""}
                onChange={(annotation_instructions) =>
                  onChangeAnnotationProject?.({ annotation_instructions })
                }
                type="textarea"
                editable
              />
            </div>
            <div className="py-6 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <Description
                name="Created On"
                value={data.created_on}
                type="text"
              />
            </div>
          </dl>
        )}
      </div>
    </Card>
  );
}
