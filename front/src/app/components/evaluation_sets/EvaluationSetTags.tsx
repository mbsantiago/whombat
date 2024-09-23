import { useMemo } from "react";

import TagSearchBar from "@/app/components/tags/TagSearchBar";

import useEvaluationSet from "@/app/hooks/api/useEvaluationSet";

import useStore from "@/app/store";

import EvaluationSetTagsBase from "@/lib/components/evaluation_sets/EvaluationSetTags";

import type { EvaluationSet } from "@/lib/types";

export default function EvaluationSetTags({
  evaluationSet,
}: {
  evaluationSet: EvaluationSet;
}) {
  const tagColorFn = useStore((state) => state.getTagColor);

  const {
    data = evaluationSet,
    addTag,
    removeTag,
  } = useEvaluationSet({
    uuid: evaluationSet.uuid,
    evaluationSet,
  });

  const tags = useMemo(() => data.tags || [], [data.tags]);

  return (
    <EvaluationSetTagsBase
      tags={tags}
      onDeleteTag={removeTag.mutate}
      TagSearchBar={<TagSearchBar onSelectTag={addTag.mutate} />}
      tagColorFn={tagColorFn}
    />
  );
}
