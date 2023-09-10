import { type ComponentProps } from "react";
import classNames from "classnames";
import * as Slider from "@radix-ui/react-slider";

export default function RangeSlider({
  value,
  defaultValue,
  name = "range-slider",
  inverted,
  minLabel,
  maxLabel,
  ...rest
}: ComponentProps<typeof Slider.Root> & {
  minLabel?: string;
  maxLabel?: string;
}) {
  const thumbs = value ?? defaultValue ?? [];

  return (
    <Slider.Root
      className="relative flex items-center w-64 h-2 mb-6"
      defaultValue={defaultValue}
      value={value}
      {...rest}
    >
      <Slider.Track
        className={classNames("relative grow h-2 rounded-full", {
          "bg-emerald-500": inverted,
          "bg-stone-300 dark:bg-stone-800": !inverted,
        })}
      >
        <Slider.Range
          className={classNames("absolute h-full rounded-full", {
            "bg-emerald-500": !inverted,
            "bg-stone-300 dark:bg-stone-800": inverted,
          })}
        />
      </Slider.Track>
      {thumbs.map((_, i) => (
        <Slider.Thumb
          key={`${name}-${i}`}
          className="block w-4 h-4 bg-stone-200 rounded-full hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
        />
      ))}
      {minLabel != null && (
        <div className="absolute text-sm text-stone-800 dark:text-stone-500 -ml-1 bottom-0 left-0 -mb-6">
          {minLabel}
        </div>
      )}
      {maxLabel != null && (
        <div className="absolute text-sm text-stone-800 dark:text-stone-500 -mr-1 bottom-0 right-0 -mb-6">
          {maxLabel}
        </div>
      )}
    </Slider.Root>
  );
}
