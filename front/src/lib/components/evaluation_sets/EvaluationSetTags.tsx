import { useMemo } from "react";

import { H2, H3 } from "@/lib/components/ui/Headings";
import { TagsIcon } from "@/lib/components/icons";
import Info from "@/lib/components/ui/Info";
import TagList from "@/lib/components/tags/TagList";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";
import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetTags({
  evaluationSet: initialData,
  onAddTag,
  onRemoveTag,
}: {
  evaluationSet: EvaluationSet;
  onAddTag?: (data: EvaluationSet) => void;
  onRemoveTag?: (data: EvaluationSet) => void;
}) {
  const project = useEvaluationSet({
    uuid: initialData.uuid,
    evaluationSet: initialData,
    onAddTag,
    onRemoveTag,
  });

  const tags = useMemo(() => {
    return project.data?.tags ?? [];
  }, [project.data?.tags]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <H2>
        <TagsIcon className="inline-block mr-2 w-8 h-8 align-middle" />
        Evaluation Tags
      </H2>
      <p className="text-stone-500">
        When assessing models and annotators using this evaluation set, emphasis
        will be placed solely on{" "}
        <span className="text-emerald-500">these tags</span>. Choose from the
        registered tags, ensuring alignment with the goals of this evaluation
        set to achieve precise and meaningful assessments.
      </p>
      <Info className="mt-4">
        It is recommended to add all tags before starting evaluation. Otherwise,
        adding tags later will make any existing evaluations inconsistent with
        the new tags.
      </Info>
      <div className="grid grid-cols-2 gap-y-4 gap-x-14">
        <div className="md:col-span-1 col-span-2">
          <H3>Add Tags</H3>
          <small className="text-stone-500">
            Use the search bar below to look for tags you want to focus
            evaluation on. Select as many tags as you want.
          </small>
          <div className="py-2 mb-3">
            <TagSearchBar autoFocus={false} onSelect={project.addTag.mutate} />
          </div>
        </div>
        <div className="flex flex-col col-span-2 md:col-span-1 gap-2">
          <H3>Selected tags</H3>
          <p>
            <span className="text-blue-500 font-bold">
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
            <TagList tags={tags} onClick={project.removeTag.mutate} />
          </div>
        </div>
      </div>
    </div>
  );
}
