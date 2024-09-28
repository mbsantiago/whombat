import { useMemo } from "react";

import useStore from "@/app/store";

import { TagsIcon } from "@/lib/components/icons";
import TagComponent from "@/lib/components/tags/Tag";
import Empty from "@/lib/components/ui/Empty";
import { H4 } from "@/lib/components/ui/Headings";

import type { ClipPrediction, Interval, Tag } from "@/lib/types";

const DEFAULT_THRESHOLD: Interval = { min: 0.5, max: 1 };

export default function ClipPredictionTags(props: {
  clipPrediction: ClipPrediction;
  onTagClick?: (tag: Tag) => void;
  threshold?: Interval;
}) {
  const getTagColor = useStore((state) => state.getTagColor);
  const { clipPrediction, onTagClick, threshold = DEFAULT_THRESHOLD } = props;

  const tags = useMemo(() => {
    const tags = clipPrediction.tags || [];
    return tags.filter(
      (tag) => tag.score >= threshold.min && tag.score <= threshold.max,
    );
  }, [clipPrediction.tags, threshold]);

  return (
    <div className="p-2">
      <H4 className="text-center">
        <TagsIcon className="inline-block w-4 h-4 mr-1" />
        Predicted Tags
      </H4>
      <div className="flex flex-col gap-1">
        {tags.map(({ tag }) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            onClick={() => onTagClick?.(tag)}
            {...getTagColor(tag)}
          />
        ))}
        {tags.length === 0 && (
          <Empty outerClassName="p-2">No tags predicted for this clip</Empty>
        )}
      </div>
    </div>
  );
}
