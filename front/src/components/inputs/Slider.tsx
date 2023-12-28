import classNames from "classnames";
import { useRef } from "react";
import {
  type AriaSliderProps,
  type AriaSliderThumbOptions,
  VisuallyHidden,
  mergeProps,
  useFocusRing,
  useNumberFormatter,
  useSlider,
  useSliderThumb,
} from "react-aria";
import { type SliderState, useSliderState } from "react-stately";

export function Thumb({
  state,
  ...props
}: {
  state: SliderState;
} & Omit<AriaSliderThumbOptions, "inputRef">) {
  const { index, name, trackRef } = props;
  const inputRef = useRef(null);

  const { thumbProps, inputProps, isDragging } = useSliderThumb(
    {
      index,
      trackRef,
      inputRef,
      name,
    },
    state,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <div
      {...thumbProps}
      className={classNames(
        "w-4 h-4 mt-0.5 rounded-full shadow cursor-pointer",
        {
          "ring-4 outline-none ring-emerald-500/50": isFocusVisible,
          "bg-emerald-700 dark:bg-emerald-300": isDragging,
          "bg-emerald-500": !isDragging,
        },
      )}
    >
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </div>
  );
}

export default function Slider({
  formatter,
  ...props
}: AriaSliderProps & {
  formatter?: (value: number) => string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const numberFormatter = useNumberFormatter({ style: "decimal" });
  const state = useSliderState({ ...props, numberFormatter });
  const { groupProps, trackProps, labelProps, outputProps } = useSlider(
    props,
    state,
    trackRef,
  );
  return (
    <div {...groupProps} className="ml-2 w-full pe-2">
      {props.label && (
        <div className="flex justify-end text-xs text-stone-600 dark:text-stone-400">
          <VisuallyHidden>
            <label {...labelProps}>{props.label}</label>
          </VisuallyHidden>
          <output {...outputProps}>
            {formatter
              ? formatter(state.getThumbValue(0))
              : state.getThumbValueLabel(0)}
          </output>
        </div>
      )}
      <div
        className="py-1 w-full cursor-pointer"
        {...trackProps}
        ref={trackRef}
      >
        <div className="w-full h-1 rounded-full bg-stone-900">
          <span
            className="absolute h-1 bg-emerald-600 rounded-full dark:bg-emerald-200"
            style={{
              left: 0,
              right: `${(1 - state.getThumbPercent(0)) * 100}%`,
            }}
          ></span>
          <Thumb
            index={0}
            state={state}
            trackRef={trackRef}
            name={"currentTime"}
          />
        </div>
      </div>
    </div>
  );
}
