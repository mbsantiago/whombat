import classNames from "classnames";
import { useMemo } from "react";

import { CloseIcon } from "@/lib/components/icons";
import AddTagButton from "../tags/AddTagButton";
import { getLabelPosition, getTagKey } from "@/lib/utils/tags";
import { isGeometryInWindow } from "@/lib/utils/geometry";
import useElementSize from "@/lib/hooks/utils/useElementSize";

import { getTagColor, type TagElement, type Color } from "@/lib/utils/tags";
import type { ComponentProps, ReactNode, FC } from "react";
import type {
  Dimensions,
  SoundEventAnnotation,
  SpectrogramWindow,
  Tag as TagType,
} from "@/lib/types";

export default function SpectrogramTags({
  children,
  soundEvents,
  viewport,
  SoundEventTags = SoundEventSpectrogramTagsBase,
  ...props
}: {
  children: ReactNode;
  viewport: SpectrogramWindow;
  soundEvents: SoundEventAnnotation[];
  SoundEventTags?: FC<SoundEventSpectrogramTagsProps>;
} & Omit<SoundEventSpectrogramTagsProps, "soundEvent" | "dimensions">) {
  const { size: dimensions, ref } = useElementSize<HTMLDivElement>();

  const soundEventsInWindow = useMemo(() => {
    return soundEvents.filter((soundEvent) => {
      return isGeometryInWindow(soundEvent.sound_event.geometry, viewport);
    });
  }, [soundEvents, viewport]);

  return (
    <div className="relative w-full h-full rounded" ref={ref}>
      {children}
      {soundEventsInWindow.map((soundEvent) => (
        <SoundEventTags
          key={soundEvent.uuid}
          viewport={viewport}
          soundEvent={soundEvent}
          dimensions={dimensions}
          {...props}
        />
      ))}
    </div>
  );
}

export type SoundEventSpectrogramTagsProps = {
  soundEvent: SoundEventAnnotation;
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  active?: boolean;
  disabled?: boolean;
  onAddTag?: (tag: TagType) => void;
  onRemoveTag?: (tag: TagType) => void;
};

export function SoundEventSpectrogramTagsBase({
  soundEvent,
  viewport,
  dimensions,
  active = true,
  disabled = false,
  tagColorFn = getTagColor,
  onRemoveTag,
  onAddTag,
  ...props
}: SoundEventSpectrogramTagsProps & {
  tagColorFn?: (tag: TagType) => Color;
} & Omit<ComponentProps<typeof AddTagButton>, "onSelectTag">) {
  const { x, y } = getLabelPosition(soundEvent, viewport, dimensions);
  return (
    <div
      className={classNames(
        {
          "pointer-events-none": !active,
        },
        "h-5 flex flex-col absolute px-2 text-stone-300 hover:z-50 z-40",
      )}
      style={{
        left: x,
        top: y,
      }}
    >
      <div className="flex relative right-0 flex-col hover:gap-2 -ms-2">
        {soundEvent.tags?.map((tag) => (
          <SpectrogramTag
            key={getTagKey(tag)}
            disabled={disabled}
            tagColorFn={tagColorFn}
            onClick={() => onRemoveTag?.(tag)}
            tag={tag}
          />
        ))}
      </div>
      {!disabled && <AddTagButton onSelectTag={onAddTag} {...props} />}
    </div>
  );
}

export function SpectrogramTag({
  tag,
  onClick,
  tagColorFn = getTagColor,
  disabled = false,
}: TagElement & { disabled?: boolean; tagColorFn: (tag: TagType) => Color }) {
  const color = tagColorFn(tag);
  const className = useMemo(() => {
    return `bg-${color.color}-500`;
  }, [color]);
  return (
    <span className="flex flex-row gap-1 items-center px-2 -my-2 rounded-full transition-all group bg-stone-200/0 dark:bg-stone-800/0 hover:bg-stone-200 hover:dark:bg-stone-800">
      <span
        className={`inline-block my-2 w-2 h-2 rounded-full ${className} ring-1 ring-stone-900 opacity-100`}
      ></span>
      <button
        type="button"
        className="hidden flex-row gap-1 items-center opacity-0 transition-all group-hover:flex group-hover:opacity-100 hover:text-red-500 text-stone-800 dark:text-stone-400"
        onClick={onClick}
      >
        <span className="hidden text-xs font-thin whitespace-nowrap opacity-0 transition-all group-hover:inline-block group-hover:opacity-100">
          {tag.key}
        </span>
        <span className="hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all group-hover:inline-block group-hover:opacity-100">
          {tag.value}
        </span>
        {!disabled && <CloseIcon className="inline-block w-3 h-3 stroke-2" />}
      </button>
    </span>
  );
}
