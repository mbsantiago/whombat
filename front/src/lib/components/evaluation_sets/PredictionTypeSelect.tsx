import classNames from "classnames";
import type { ComponentProps, InputHTMLAttributes } from "react";

import {
  BACKGROUND_STYLE,
  BORDER_STYLE,
  COMMON_STYLE,
  FOCUS_STYLE,
  TEXT_STYLE,
} from "../inputs/styles";

export default function PredictionTypeSelect(
  props: Omit<
    ComponentProps<typeof PredictionType>,
    "title" | "description" | "value"
  >,
) {
  return (
    <ul className="grid grid-flow-row gap-6 w-full md:grid-cols-2">
      <PredictionType
        title={"Clip Classification"}
        description={
          <>
            Predicts the{" "}
            <span className="font-bold">single most relevant class</span> for an
            audio clip.
          </>
        }
        value={"Clip Classification"}
        {...props}
      />
      <PredictionType
        title={"Clip Tagging"}
        description={
          <>
            Predicts{" "}
            <span className="font-bold">multiple relevant classes or tags</span>{" "}
            present in an audio clip.
          </>
        }
        value={"Clip Tagging"}
        {...props}
      />
      <PredictionType
        title={"Sound Event Detection"}
        description={
          <>
            <ul className="flex flex-col items-center ml-2 list-disc">
              <li>
                <span className="font-bold">Locates</span> relevant sound events
                within an audio clip.
              </li>
              <li>
                <span className="font-bold">Identifies</span> each sound event
                with a class.
              </li>
            </ul>
          </>
        }
        value={"Sound Event Detection"}
        {...props}
      />
      <PredictionType
        title={"Sound Event Tagging"}
        description={
          <>
            <ul className="flex flex-col items-center ml-2 list-disc">
              <li>
                <span className="font-bold">Locates</span> relevant sound events
                within an audio clip.
              </li>
              <li>
                <span className="font-bold">Describes</span> each sound event
                with <span className="font-bold">multiple tags</span>.
              </li>
            </ul>
          </>
        }
        value={"Sound Event Tagging"}
        {...props}
      />
    </ul>
  );
}

function PredictionType({
  title,
  description,
  value,
  ...props
}: {
  title: string;
  description: React.ReactNode;
  value: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "type" | "id" | "className"
>) {
  return (
    <li className="w-full h-full grow">
      <input
        type="radio"
        id={value}
        value={value}
        className="hidden peer"
        {...props}
      />
      <label
        htmlFor={value}
        className={classNames(
          BACKGROUND_STYLE,
          BORDER_STYLE,
          COMMON_STYLE,
          FOCUS_STYLE,
          TEXT_STYLE,
          "inline-flex justify-between items-center p-5 w-full cursor-pointer peer-checked:border-emerald-500 peer-checked:text-emerald-500 dark:hover:text-stone-300 dark:peer-checked:text-emerald-500 dark:hover:bg-stone-700 hover:text-stone-600 hover:bg-stone-100",
        )}
      >
        <div className="flex flex-col gap-2 items-stretch w-full">
          <div className="w-full font-semibold text-center text-md">
            {title}
          </div>
          <div className="w-full text-sm text-center">{description}</div>
        </div>
      </label>
    </li>
  );
}
