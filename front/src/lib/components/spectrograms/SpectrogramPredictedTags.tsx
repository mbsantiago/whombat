// Purpose: React component for displaying predicted tags on the spectrogram.
import classNames from "classnames";
import { type ReactNode } from "react";
import { useMemo } from "react";

import useStore from "@/app/store";

import { getTagClassNames } from "@/lib/components/tags/Tag";

import type { Interval } from "@/lib/types";
import type { TagElement, TagGroup } from "@/lib/utils/tags";

export default function SpectrogramPredictedTags({
  tags,
  children,
  threshold,
}: {
  tags: TagGroup[];
  children: ReactNode;
  threshold?: Interval;
}) {
  return (
    <div className="overflow-hidden relative w-full h-full rounded">
      {children}
      {tags.map((group) => (
        <TagGroupComponent
          key={group.annotation.uuid}
          group={group}
          threshold={threshold}
        />
      ))}
    </div>
  );
}

function getConfidenceColor(score: number) {
  const level = Math.round(Math.min(Math.max(score, 0), 1) * 8) + 1;
  const background = `bg-emerald-${level}00 dark:bg-emerald-${10 - level}00`;
  const text = `text-emerald-${level}00 dark:text-emerald-${10 - level}00`;
  return {
    background,
    text,
  };
}

const DOT_CLASS = "inline-block my-2 w-2 h-2 rounded-full opacity-100";
const SPAN_CLASS =
  "hidden text-xs font-thin whitespace-nowrap opacity-0 transition-all group-hover:inline-block group-hover:opacity-100";

export function SpectrogramPredictedTag({
  tag,
  onClick,
  score = 1,
}: TagElement) {
  const getTagColor = useStore((state) => state.getTagColor);
  const color = getTagColor(tag);
  const tagClassNames = useMemo(() => {
    return getTagClassNames(color.color, color.level);
  }, [color]);

  const confidenceClassNames = useMemo(() => {
    return getConfidenceColor(score);
  }, [score]);

  return (
    <span className="flex flex-row gap-1 -my-2 items-center px-2 rounded-full transition-all group bg-stone-200/0 dark:bg-stone-800/0 hover:bg-stone-200 hover:dark:bg-stone-800">
      <span className={classNames(DOT_CLASS, tagClassNames.background)}></span>
      <span
        className={classNames(DOT_CLASS, confidenceClassNames.background)}
      ></span>
      <button
        type="button"
        className="hidden flex-row gap-1 items-center opacity-0 transition-all group-hover:flex group-hover:opacity-100 text-stone-800 dark:text-stone-400"
        onClick={onClick}
      >
        <span className={classNames(SPAN_CLASS, confidenceClassNames.text)}>
          {Math.round(score * 100)}%
        </span>
        <span className={SPAN_CLASS}>{tag.key}</span>
        <span className={classNames(SPAN_CLASS, "group-hover:underline")}>
          {tag.value}
        </span>
      </button>
    </span>
  );
}

export function TagGroupComponent({
  group,
  threshold,
}: {
  group: TagGroup;
  threshold?: Interval;
}) {
  const { x, y } = group.position;
  return (
    <div
      className={classNames(
        {
          "pointer-events-none": !group.active,
        },
        "h-5 flex flex-col absolute px-2 text-stone-300 hover:z-50 z-40",
      )}
      style={{
        left: x,
        top: y,
      }}
    >
      <div className="-ms-2 relative flex flex-col right-0 hover:gap-2">
        {group.tags
          .filter(
            ({ score = 1 }) =>
              score >= (threshold?.min ?? 0) && score <= (threshold?.max ?? 1),
          )
          .sort((a, b) => (b.score || 1) - (a.score || 1))
          .map((tagElement) => (
            <SpectrogramPredictedTag
              key={`${tagElement.tag.key}:${tagElement.tag.value}`}
              {...tagElement}
            />
          ))}
      </div>
    </div>
  );
}
