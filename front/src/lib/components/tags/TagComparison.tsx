import { useMemo } from "react";

import TagComponent from "@/lib/components/tags/Tag";
import Empty from "@/lib/components/ui/Empty";

import type { PredictionTag, Tag } from "@/lib/types";
import { Color, getTagColor, getTagKey } from "@/lib/utils/tags";

export default function TagComparison(props: {
  tags?: Tag[];
  predictedTags?: PredictionTag[];
  threshold?: number;
  onClickPredictedTag?: (tag: PredictionTag) => void;
  onClickTrueTag?: (tag: Tag) => void;
  tagColorFn?: (tag: Tag) => Color;
}) {
  const { threshold = 0.5, tagColorFn = getTagColor } = props;

  const predictedMapping = useMemo(() => {
    return new Map<string, number>(
      props.predictedTags
        ?.filter((tag) => tag.score >= threshold)
        .map((tag) => [getTagKey(tag.tag), tag.score]),
    );
  }, [props.predictedTags, threshold]);

  const trueKeys = useMemo(() => {
    return new Set(props.tags?.map(getTagKey));
  }, [props.tags]);

  const trueTags = useMemo(() => {
    return props.tags
      ?.map((tag) => {
        const key = getTagKey(tag);
        const score = predictedMapping.get(key) ?? 0;
        const correct = score >= threshold;
        return {
          key,
          tag,
          correct,
          score,
        };
      })
      .sort((a, b) => {
        return b.score - a.score;
      });
  }, [props.tags, predictedMapping, threshold]);

  const predictedTags = useMemo(() => {
    return props.predictedTags
      ?.filter((tag) => tag.score > threshold)
      .map((predictedTag) => {
        const key = getTagKey(predictedTag.tag);
        const score = predictedTag.score;
        const correct = trueKeys.has(key);
        return {
          key,
          predictedTag,
          correct,
          score,
        };
      })
      .sort((a, b) => {
        return b.score - a.score;
      });
  }, [props.predictedTags, trueKeys, threshold]);

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <h5 className="font-bold text-stone-500">Predicted</h5>
        {predictedTags?.map(({ predictedTag, key, score, correct }) => (
          <div className="inline-flex gap-4 items-center" key={key}>
            <ScoreBullet score={score} correct={correct} />
            <TagComponent
              tag={predictedTag.tag}
              onClick={() => props.onClickPredictedTag?.(predictedTag)}
              {...tagColorFn(predictedTag.tag)}
            />
          </div>
        ))}
        {predictedTags?.length === 0 && (
          <Empty outerClassName="p-0">No predicted tags.</Empty>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h5 className="font-bold text-stone-500">True</h5>
        {trueTags?.map(({ key, tag, score, correct }) => (
          <div className="inline-flex gap-4 items-center" key={key}>
            <ScoreBullet
              score={score}
              correct={correct}
              inverted={score == 0}
            />
            <TagComponent
              tag={tag}
              onClick={() => props.onClickTrueTag?.(tag)}
              {...getTagColor(tag)}
            />
          </div>
        ))}
        {props.tags?.length === 0 && (
          <Empty outerClassName="p-0">No tags.</Empty>
        )}
      </div>
    </div>
  );
}

function ScoreBullet({
  score,
  correct,
  inverted = false,
}: {
  score: number;
  correct: boolean;
  inverted?: boolean;
}) {
  const classes = getClasses({ score, correct, inverted });
  return (
    <div className="inline-flex gap-2 items-center">
      <div
        className={`inline-block w-3 h-3 rounded-full ${classes.bullet}`}
      ></div>
      {score != null && (
        <span className={classes.text}>{score.toFixed(2)}</span>
      )}
    </div>
  );
}

function getClasses({
  score,
  correct,
  inverted = false,
}: {
  score: number;
  correct: boolean;
  inverted: boolean;
}) {
  const status = correct ? "correct" : "incorrect";
  const level = getColorLevel(inverted ? 1 - score : score);
  return CLASS_NAMES[status][level];
}

type Status = "correct" | "incorrect";
type Level = "high" | "medium" | "low" | "very-low" | "none";

function getColorLevel(score: number) {
  switch (true) {
    case score >= 0.8:
      return "high";
    case score >= 0.6:
      return "medium";
    case score >= 0.4:
      return "low";
    case score >= 0.2:
      return "very-low";
    case score >= 0:
      return "none";
    default:
      return "none";
  }
}

const CLASS_NAMES: Record<
  Status,
  Record<Level, { text: string; bullet: string }>
> = {
  correct: {
    high: {
      text: "text-emerald-500 font-bold",
      bullet: "bg-emerald-500",
    },
    medium: {
      text: "text-emerald-400 dark:text-emerald-600",
      bullet: "bg-emerald-400 dark:bg-emerald-600",
    },
    low: {
      text: "text-emerald-300 dark:text-emerald-700",
      bullet: "bg-emerald-300 dark:bg-emerald-700",
    },
    "very-low": {
      text: "text-emerald-200 dark:text-emerald-800",
      bullet: "bg-emerald-200 dark:bg-emerald-800",
    },
    none: {
      text: "text-emerald-100 dark:text-emerald-900 font-thin",
      bullet: "bg-emerald-100 dark:bg-emerald-900",
    },
  },
  incorrect: {
    high: {
      text: "text-rose-500 font-bold",
      bullet: "bg-rose-500",
    },
    medium: {
      text: "text-rose-400 dark:text-rose-600",
      bullet: "bg-rose-400 dark:bg-rose-600",
    },
    low: {
      text: "text-rose-300 dark:text-rose-700",
      bullet: "bg-rose-300 dark:bg-rose-700",
    },
    "very-low": {
      text: "text-rose-200 dark:text-rose-800",
      bullet: "bg-rose-200 dark:bg-rose-800",
    },
    none: {
      text: "text-rose-100 dark:text-rose-900 font-thin",
      bullet: "bg-rose-100 dark:bg-rose-900",
    },
  },
};
