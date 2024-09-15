import { H2, H3 } from "@/lib/components/ui/Headings";
import { TagsIcon } from "@/lib/components/icons";
import Info from "@/lib/components/ui/Info";
import TagList from "@/lib/components/tags/TagList";

import type { AnnotationProject, Tag } from "@/lib/types";

export default function AnnotationProjectTags({
  annotationProject,
  onDeleteTag,
  TagSearchBar,
}: {
  annotationProject: AnnotationProject;
  onDeleteTag?: (tag: Tag) => void;
  TagSearchBar?: JSX.Element;
}) {
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
          <div className="py-2">{TagSearchBar}</div>
          <small className="text-stone-500">
            Create new tags if needed, but avoid duplicating meanings.
          </small>
        </div>
        <div className="flex flex-col col-span-2 gap-2 md:col-span-1">
          <H3>Selected tags</H3>
          <p>
            <span className="font-bold text-blue-500">
              {(annotationProject.tags ?? []).length.toLocaleString()}
            </span>{" "}
            tags selected. These are available for annotators.
          </p>
          <small className="text-stone-500">
            Use the search bar to find registered tags. Click a tag to remove
            it.
          </small>
          <div>
            <TagList
              tags={annotationProject.tags ?? []}
              onClick={onDeleteTag}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
