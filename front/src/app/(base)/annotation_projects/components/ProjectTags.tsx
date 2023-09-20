import useStore from "@/store";
import useAnnotationProject from "@/hooks/api/useAnnotationProject";
import Tag from "@/components/Tag";
import TagSearchBar from "@/components/TagSearchBar";
import SearchMenu from "@/components/SearchMenu";
import { type AnnotationProject } from "@/api/annotation_projects";

export default function AnnotationTags({
  project: projectData,
}: {
  project: AnnotationProject;
}) {
  const getTagColor = useStore((state) => state.getTagColor);

  const project = useAnnotationProject({
    annotation_project_id: projectData.id,
  });

  return (
    <div className="grid grid-cols-2 gap-y-4 gap-x-14">
      <div className="md:col-span-1 col-span-2">
        <small className="text-stone-500">
          Use the search bar below to look for tags that you want to use in the
          project. Select a tag to add it to the project.
        </small>
        <div className="py-2">
          <TagSearchBar
            autoFocus={false}
            onSelect={(tag) => {
              project.addTag.mutate(tag.id);
            }}
          />
        </div>
        <small className="text-stone-500">
          You can create any new tags you do not find, but try to avoid creating
          two tags with the same meaning.
        </small>
        <p className="mb-2 mt-4">You can always add more tags in the future.</p>
      </div>
      <div className="flex flex-col col-span-2 md:col-span-1 gap-2">
        <h3 className="text-lg font-bold">Selected tags</h3>
        <p>
          <span className="text-blue-500 font-bold">
            {(project.query.data?.tags ?? []).length.toLocaleString()}
          </span>{" "}
          tags selected for the project. These tags will be available for
          annotators to use.
        </p>
        <small className="text-stone-500">
          Use the search bar to look for registered tags. Click on a tag to
          remove it.
        </small>
        <div>
          <SearchMenu
            options={project.query.data?.tags ?? []}
            fields={["key", "value"]}
            limit={6}
            onSelect={(tag) => {
              project.removeTag.mutate(tag.id);
            }}
            renderOption={(tag) => (
              <Tag
                key={tag.id}
                tag={tag}
                withClose
                className="hover:ring-2 hover:ring-red-500"
                {...getTagColor(tag)}
                onClick={() => {
                  project.removeTag.mutate(tag.id);
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
