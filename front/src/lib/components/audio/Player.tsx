/**
 * The `Player` module contains components related to the audio player,
 * including the main player controls, the slider, and the speed selection
 * dropdown.
 *
 * @module
 * @exports Player
 */
import { Float } from "@headlessui-float/react";
import { Listbox } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useRef } from "react";
import {
  VisuallyHidden,
  mergeProps,
  useFocusRing,
  useNumberFormatter,
  useSlider,
  useSliderThumb,
} from "react-aria";
import type { AriaSliderProps, AriaSliderThumbOptions } from "react-aria";
import { useSliderState } from "react-stately";
import type { SliderState } from "react-stately";

import {
  ExpandIcon,
  LoopIcon,
  PauseIcon,
  PlayIcon,
  SpeedIcon,
} from "@/lib/components/icons";

import type { SpeedOption } from "@/lib/hooks/settings/useAudioSettings";

const COMMON_BUTTON_CLASSES =
  "focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-full";

/**
 * Player component represents the audio player.
 */
export default function Player({
  currentTime,
  speedOptions,
  endTime,
  startTime = 0,
  isPlaying = false,
  loop = false,
  speed = 1,
  onPlay,
  onPause,
  onSeek,
  onToggleLoop,
  onChangeSpeed,
}: {
  currentTime: number;
  startTime?: number;
  endTime: number;
  isPlaying?: boolean;
  loop?: boolean;
  speed?: number;
  speedOptions: SpeedOption[];
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onToggleLoop?: () => void;
  onChangeSpeed?: (speed: number) => void;
}) {
  return (
    <div className="flex flex-row gap-2 items-center px-2 max-w-max rounded-md border border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-700">
      <button
        type="button"
        className={classNames(
          "text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200",
          COMMON_BUTTON_CLASSES,
        )}
        onClick={() => {
          if (isPlaying) return onPause?.();
          onPlay?.();
        }}
      >
        {isPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>
      <button
        type="button"
        className={classNames(COMMON_BUTTON_CLASSES, {
          "text-emerald-500 dark:hover:text-emerald-300 hover:text-emerald-700":
            loop,
          "dark:text-stone-400 dark:hover:text-stone-200 text-stone-600 hover:text-stone-800":
            !loop,
        })}
        onClick={() => onToggleLoop?.()}
      >
        <LoopIcon className="w-5 h-5" />
      </button>
      <PlayerSlider
        label="audio track"
        value={currentTime}
        minValue={startTime}
        maxValue={endTime}
        step={0.01}
        onChange={(value) => onSeek?.(value as number)}
      />
      <SelectSpeed
        speed={speed}
        onChange={(value) => onChangeSpeed?.(value)}
        options={speedOptions}
      />
    </div>
  );
}

/** Taken from https://stackoverflow.com/a/25279399 */
function secondsToTimeStr(seconds?: number): string {
  if (seconds === undefined) return "00:00.000";
  return new Date(1000 * seconds)
    .toISOString()
    .substring(11, 22)
    .replace(/^00:/, "");
}

/**
 * SelectSpeed component represents the speed selection dropdown in the audio
 * player.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {number} props.speed - The selected playback speed.
 * @param {(value: number) => void} props.onChange - Callback function for
 * speed change.
 * @param {SpeedOption[]} props.options - The available speed options.
 */
function SelectSpeed({
  speed,
  onChange,
  options,
}: {
  speed: number;
  onChange: (value: number) => void;
  options: SpeedOption[];
}) {
  return (
    <Listbox value={speed} onChange={onChange}>
      <Float
        as="div"
        className="relative"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        placement="bottom"
        offset={4}
        flip={true}
        floatingAs={Fragment}
      >
        <Listbox.Button
          className={classNames(
            COMMON_BUTTON_CLASSES,
            "text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200",
            "flex flex-row items-center w-full pr-7",
          )}
        >
          <SpeedIcon className="w-5 h-5" />
          <span className="flex absolute inset-y-0 right-0 items-center pr-1 pointer-events-none">
            <ExpandIcon className="w-5 h-5" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="overflow-auto py-1 w-full max-h-60 text-base rounded-md ring-1 ring-opacity-5 shadow-lg sm:text-sm focus:outline-none bg-stone-50 ring-stone-900 dark:bg-stone-700 dark:ring-stone-600">
          {options.map((option) => (
            <Listbox.Option
              key={option.value.toString()}
              value={option.value}
              className={({ active }) =>
                `relative cursor-default select-none p-1 ${
                  active
                    ? "bg-emerald-100 text-emerald-900"
                    : "text-stone-900 dark:text-stone-300"
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span
                    className={`block truncate ${
                      selected ? "text-emerald-500 font-medium" : "font-normal"
                    }`}
                  >
                    {option.label}
                  </span>
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Float>
    </Listbox>
  );
}

/**
 * PlayerThumb component represents the slider thumb used in the audio player.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {SliderState} props.state - The state of the slider.
 * @param {AriaSliderThumbOptions} props.props - Additional ARIA slider thumb
 * options.
 */
function PlayerThumb({
  state,
  ...props
}: {
  state: SliderState;
} & Omit<AriaSliderThumbOptions, "inputRef">) {
  let { index, name, trackRef } = props;
  let inputRef = useRef(null);
  let { thumbProps, inputProps, isDragging } = useSliderThumb(
    {
      index,
      trackRef,
      inputRef,
      name,
    },
    state,
  );

  let { focusProps, isFocusVisible } = useFocusRing();
  return (
    <div
      {...thumbProps}
      className={classNames("w-3 h-3 rounded-full shadow cursor-pointer", {
        "focus:ring-4 focus:outline-none focus:ring-emerald-500/50":
          isFocusVisible,
        "bg-emerald-700 dark:bg-emerald-300": isDragging,
        "bg-emerald-500": !isDragging,
      })}
    >
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </div>
  );
}

/**
 * PlayerSlider component represents the slider used in the audio player.
 *
 * @component
 * @param {AriaSliderProps} props - Component properties.
 */
function PlayerSlider(props: AriaSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  let numberFormatter = useNumberFormatter({ style: "decimal" });
  const state = useSliderState({ ...props, numberFormatter });
  const { groupProps, trackProps, labelProps, outputProps } = useSlider(
    props,
    state,
    trackRef,
  );
  return (
    <div {...groupProps} className="ml-2 w-36">
      {props.label && (
        <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
          <VisuallyHidden>
            <label {...labelProps}>{props.label}</label>
          </VisuallyHidden>
          <output {...outputProps}>
            {secondsToTimeStr(state.getThumbValue(0))}
          </output>
          <output>{secondsToTimeStr(props.maxValue)}</output>
        </div>
      )}
      <div
        className="py-1 w-full cursor-pointer"
        {...trackProps}
        ref={trackRef}
      >
        <div className="w-full h-1 rounded-full bg-stone-900">
          <span
            className="relative h-1 bg-emerald-600 rounded-full dark:bg-emerald-200"
            style={{
              width: `${Math.min(state.getThumbPercent(0), 100)}%`,
            }}
          />
          <PlayerThumb
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
