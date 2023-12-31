import { H2, H3 } from "@/components/Headings";
import { TagsIcon } from "@/components/icons";
import Info from "@/components/Info";
import TagList from "@/components/tags/TagList";
import TagSearchBar from "@/components/tags/TagSearchBar";
import useAnnotationProject from "@/hooks/api/useAnnotationProject";

import type { AnnotationProject } from "@/types";

export default function AnnotationProjectTags({
  annotationProject: data,
  onAddTag,
  onRemoveTag,
}: {
  annotationProject: AnnotationProject;
  onAddTag?: (project: AnnotationProject) => void;
  onRemoveTag?: (project: AnnotationProject) => void;
}) {
  const project = useAnnotationProject({
    uuid: data.uuid,
    annotationProject: data,
    onAddTag,
    onRemoveTag,
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <H2>
        <TagsIcon className="inline-block mr-2 w-8 h-8 align-middle" />
        Project Tags
      </H2>
      <p className="text-stone-500">
        <span className="font-bold text-emerald-500">Tags</span> provide meaning
        to annotations. View available tags for this project or add more as
        needed.
      </p>
      <Info className="mt-4">
        You can always come back and add more tags in the future.
      </Info>
      <div className="grid grid-cols-2 gap-y-4 gap-x-14">
        <div className="col-span-2 md:col-span-1">
          <H3>Add Tags</H3>
          <small className="text-stone-500">
            Use the search bar below to find tags for the project. Select a tag
            to add.
          </small>
          <div className="py-2">
            <TagSearchBar autoFocus={false} onSelect={project.addTag.mutate} />
          </div>
          <small className="text-stone-500">
            Create new tags if needed, but avoid duplicating meanings.
          </small>
        </div>
        <div className="flex flex-col col-span-2 gap-2 md:col-span-1">
          <H3>Selected tags</H3>
          <p>
            <span className="font-bold text-blue-500">
              {(project.data?.tags ?? []).length.toLocaleString()}
            </span>{" "}
            tags selected. These are available for annotators.
          </p>
          <small className="text-stone-500">
            Use the search bar to find registered tags. Click a tag to remove
            it.
          </small>
          <div>
            <TagList
              tags={project.data?.tags ?? []}
              onClick={project.removeTag.mutate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
