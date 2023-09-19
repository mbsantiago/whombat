import { Fragment, useRef, useCallback, useMemo } from "react";
import { Float } from "@headlessui-float/react";
import { ExpandIcon } from "@/components/icons";
import { Listbox } from "@headlessui/react";
import classNames from "classnames";
import { useSlider } from "react-use";
import { PlayIcon, PauseIcon, SpeedIcon, LoopIcon } from "@/components/icons";

const SPEED_OPTIONS = [
  { id: "0.1", label: "0.1x", value: 0.1 },
  { id: "0.2", label: "0.2x", value: 0.2 },
  { id: "0.5", label: "0.5x", value: 0.5 },
  { id: "0.8", label: "0.8x", value: 0.8 },
  { id: "1", label: "1x", value: 1.0 },
  { id: "1.25", label: "1.25x", value: 1.25 },
  { id: "1.5", label: "1.5x", value: 1.5 },
  { id: "2", label: "2x", value: 2 },
  { id: "5", label: "5x", value: 5 },
  { id: "10", label: "10x", value: 10 },
];

const COMMON_BUTTON_CLASSES =
  "focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-full";

export default function Player({
  samplerate,
  currentTime,
  startTime,
  endTime,
  speed,
  playing,
  paused,
  loop,
  play,
  pause,
  seek,
  setSpeed,
  toggleLoop,
}: {
  samplerate: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  speed: number;
  playing: boolean;
  paused: boolean;
  loop: boolean;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  toggleLoop: () => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const onScrub = useCallback(
    (value: number) => {
      const length = endTime - startTime;
      const goTo = startTime + value * length;
      seek(goTo);
    },
    [startTime, endTime, seek],
  );

  useSlider(sliderRef, {
    onScrub,
  });

  const barPosition = useMemo(() => {
    const length = endTime - startTime;
    const value = (currentTime - startTime) / length;
    return value * 100;
  }, [currentTime, startTime, endTime]);

  const speedOptions = useMemo(() => {
    return SPEED_OPTIONS.filter((option) => option.value * samplerate <= 48000);
  }, [samplerate]);

  return (
    <div className="flex flex-row items-center gap-2 border rounded-md border-stone-300 bg-stone-100 dark:border-stone-600 dark:bg-stone-700 px-2">
      <button
        type="button"
        className={classNames(
          "text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200",
          COMMON_BUTTON_CLASSES,
        )}
        onClick={() => {
          if (playing && !paused) return pause();
          play();
        }}
      >
        {playing && !paused ? (
          <PauseIcon className="h-5 w-5" />
        ) : (
          <PlayIcon className="h-5 w-5" />
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
        onClick={() => toggleLoop()}
      >
        <LoopIcon className="h-5 w-5" />
      </button>
      <div className="w-36 ml-2">
        <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
          <p>{secondsToTimeStr(currentTime)}</p>
          <p>{secondsToTimeStr(endTime)}</p>
        </div>
        <div ref={sliderRef} className="py-1 w-full cursor-pointer">
          <div className="relative h-1 bg-stone-900 rounded-full w-full">
            <div
              className="h-1 bg-emerald-600 dark:bg-emerald-200 rounded-full relative"
              style={{
                width: `${Math.min(barPosition, 100)}%`,
              }}
            >
              <span
                tabIndex={0}
                className="w-3 h-3 bg-emerald-500 absolute right-0 -mt-1 rounded-full shadow cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
              ></span>
            </div>
          </div>
        </div>
      </div>
      <SelectSpeed
        speed={speed}
        onChange={(value) => setSpeed(value)}
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

function SelectSpeed({
  speed,
  onChange,
  options,
}: {
  speed: number;
  onChange: (value: number) => void;
  options: { id: string | number; label: string; value: number }[];
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
          <SpeedIcon className="h-5 w-5" />
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <ExpandIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="max-h-60 w-full overflow-auto rounded-md bg-stone-50 dark:bg-stone-700 py-1 text-base shadow-lg ring-1 ring-stone-900 dark:ring-stone-600 ring-opacity-5 focus:outline-none sm:text-sm">
          {options.map((option) => (
            <Listbox.Option
              key={option.id}
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
