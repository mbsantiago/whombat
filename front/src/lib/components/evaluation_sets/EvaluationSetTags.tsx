import type { ComponentProps } from "react";

import * as icons from "@/lib/components/icons";
import TagList from "@/lib/components/tags/TagList";
import * as ui from "@/lib/components/ui";

import type * as types from "@/lib/types";

export default function EvaluationSetTags({
  tags,
  onDeleteTag,
  TagSearchBar,
  ...props
}: {
  tags: types.Tag[];
  onDeleteTag?: (tag: types.Tag) => void;
  TagSearchBar?: JSX.Element;
} & Omit<ComponentProps<typeof TagList>, "onClick" | "tags">) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <ui.H2>
        <icons.TagsIcon className="inline-block mr-2 w-8 h-8 align-middle" />
        Evaluation Tags
      </ui.H2>
      <p className="text-stone-500">
        When assessing models and annotators using this evaluation set, emphasis
        will be placed solely on{" "}
        <span className="text-emerald-500">these tags</span>. Choose from the
        registered tags, ensuring alignment with the goals of this evaluation
        set to achieve precise and meaningful assessments.
      </p>
      <ui.Info className="mt-4">
        It is recommended to add all tags before starting evaluation. Otherwise,
        adding tags later will make any existing evaluations inconsistent with
        the new tags.
      </ui.Info>
      <div className="grid grid-cols-2 gap-y-4 gap-x-14">
        <div className="col-span-2 md:col-span-1">
          <ui.H3>Add Tags</ui.H3>
          <small className="text-stone-500">
            Use the search bar below to look for tags you want to focus
            evaluation on. Select as many tags as you want.
          </small>
          <div className="py-2 mb-3">{TagSearchBar}</div>
        </div>
        <div className="flex flex-col col-span-2 gap-2 md:col-span-1">
          <ui.H3>Selected tags</ui.H3>
          <p>
            <span className="font-bold text-blue-500">
              {tags.length.toLocaleString()}
            </span>{" "}
            tags to use for evaluation. Each of these tags will be considered a
            separate class when evaluating predictions.
          </p>
          <small className="text-stone-500">
            Use the search bar to look for registered tags. Click on a tag to
            remove it.
          </small>
          <div>
            <TagList tags={tags} onClick={onDeleteTag} {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}
