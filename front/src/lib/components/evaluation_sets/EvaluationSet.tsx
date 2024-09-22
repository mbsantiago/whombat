import { Atom } from "@/lib/components/datasets/Dataset";
import { CalendarIcon, TagsIcon, TasksIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";

import type { EvaluationSet, Tag } from "@/lib/types";
import { type Color, getTagColor, getTagKey } from "@/lib/utils/tags";

import TagComponent from "../tags/Tag";

export default function EvaluationSetComponent({
  evaluationSet,
  onClickEvaluationSet,
  onClickEvaluationSetTag,
  tagColorFn = getTagColor,
}: {
  evaluationSet: EvaluationSet;
  onClickEvaluationSetTag?: (tag: Tag) => void;
  onClickEvaluationSet?: () => void;
  tagColorFn?: (tag: Tag) => Color;
}) {
  return (
    <div className="w-full">
      <div className="px-4 sm:px-0">
        <h3 className="inline-flex items-center text-base font-semibold leading-7 text-stone-900 dark:text-stone-100">
          <span className="inline-block w-6 h-6 align-middle text-stone-500">
            <TasksIcon />
          </span>{" "}
          <Button
            className="inline-block"
            mode="text"
            onClick={onClickEvaluationSet}
          >
            {evaluationSet.name}
          </Button>
          <span className="text-sm ms-4 text-stone-500">
            {evaluationSet.task}
          </span>
        </h3>
        <p className="mt-1 w-full text-sm leading-5 text-stone-600 dark:text-stone-400">
          {evaluationSet.description}
        </p>
      </div>
      <div className="flex flex-row py-4">
        <Atom
          label={<CalendarIcon className="w-4 h-4 align-middle" />}
          value={evaluationSet.created_on.toDateString()}
        />
        <Atom
          label={
            <span className="inline-flex items-center">
              <TagsIcon className="mr-2 w-4 h-4" />
              Targets
            </span>
          }
          value={
            <span>
              {evaluationSet.tags
                ?.slice(0, 10)
                .map((tag) => (
                  <TagComponent
                    key={getTagKey(tag)}
                    tag={tag}
                    onClick={() => onClickEvaluationSetTag?.(tag)}
                    {...tagColorFn(tag)}
                  />
                ))}
            </span>
          }
        />
      </div>
    </div>
  );
}
