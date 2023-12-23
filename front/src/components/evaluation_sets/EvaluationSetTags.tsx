import useStore from "@/store";
import Tag from "@/components/tags/Tag";
import TagSearchBar from "@/components/tags/TagSearchBar";
import SearchMenu from "@/components/search/SearchMenu";
import Info from "@/components/Info";
import { type EvaluationSet } from "@/api/evaluation_sets";
import { type Tag as TagType } from "@/api/tags";

export default function EvaluationSetTags({
  evaluationSet,
  onAddTag,
  onRemoveTag,
}: {
  evaluationSet: EvaluationSet;
  onAddTag?: (tag: TagType) => void;
  onRemoveTag?: (tag: TagType) => void;
}) {
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <div className="grid grid-cols-2 gap-y-4 gap-x-14">
      <div className="md:col-span-1 col-span-2">
        <small className="text-stone-500">
          Use the search bar below to look for tags you want to focus evaluation
          on. Select as many tags as you want.
        </small>
        <div className="py-2 mb-3">
          <TagSearchBar
            autoFocus={false}
            canCreate={false}
            onSelect={(tag) => onAddTag?.(tag)}
          />
        </div>
        <Info>
          You can add more tags later. However, doing so will make any existing
          evaluations inconsistent with the new tags, so it is recommended to
          add all tags before starting evaluation.
        </Info>
      </div>
      <div className="flex flex-col col-span-2 md:col-span-1 gap-2">
        <h3 className="text-lg font-bold">Selected tags</h3>
        <p>
          <span className="text-blue-500 font-bold">
            {evaluationSet.tags.length.toLocaleString()}
          </span>{" "}
          tags to use for evaluation. Each of these tags will be considered a
          separate class when evaluating predictions.
        </p>
        <small className="text-stone-500">
          Use the search bar to look for registered tags. Click on a tag to
          remove it.
        </small>
        <div>
          <SearchMenu
            options={evaluationSet.tags}
            fields={["key", "value"]}
            limit={6}
            static={false}
            renderOption={(tag) => (
              <Tag
                key={tag.id}
                tag={tag}
                onClose={() => onRemoveTag?.(tag)}
                {...getTagColor(tag)}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
