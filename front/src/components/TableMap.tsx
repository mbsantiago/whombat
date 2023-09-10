import dynamic from "next/dynamic";
import {
  useState,
  useMemo,
  useEffect,
  useRef,
  Fragment,
  type HTMLProps,
} from "react";
import { Popover, Transition } from "@headlessui/react";
import { EditIcon } from "@/components/icons";

// NOTE: The use of dynamic imports is necessary to avoid
// importing the leaflet library on the server side as it
// uses the `window` object which is not available on the server.
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
const DraggableMarker = dynamic(() => import("@/components/DraggableMarker"), {
  ssr: false,
});

/* Parse a string into a position object.
 * @param {string} value - The string to parse.
 * @returns {object}
 * @returns {object.position} - The position associated with the string.
 * @returns {number} position.lat - The latitude.
 * @returns {number} position.lng - The longitude.
 * @returns {boolean} isComplete - If the string is a valid position.
 */
export function parsePosition(value: string): {
  position: {
    lat: number;
    lng: number;
  };
  isComplete: boolean;
} {
  let position = {
    lat: 0,
    lng: 0,
  };
  let isComplete = false;

  if (value == null) {
    return { position, isComplete };
  }

  const parts = value.split(",");

  if (parts.length !== 2) {
    return { position, isComplete };
  }

  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  return {
    position: {
      lat,
      lng,
    },
    isComplete: !isNaN(lat) && !isNaN(lng),
  };
}

export default function TableInput({
  value: initialValue,
  onChange,
  ...props
}: {
  value: string;
  onChange?: (value: string | null) => void;
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(initialValue);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (active) {
      ref.current?.focus();
    }
  }, [active]);

  const { position } = useMemo(() => parsePosition(value), [value]);

  return (
    <Popover className="w-100 relative flex flex-row">
      <Popover.Button className="grow flex flex-row justify-between items-center gap-2 px-1 text-center">
        <span>{initialValue}</span>
        <EditIcon className="flex-none inline-block h-5 w-5 text-stone-500" />
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          unmount
          className="absolute left-1/2 z-10 mt-3 -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl"
        >
          <div className="rounded-lg bg-stone-100 dark:bg-stone-700">
            <div className="p-2 flex flex-row justify-center items-center">
              <input
                ref={ref}
                autoFocus
                className="block w-42 bg-stone-50 dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-600 px-2 outline-none focus:ring-emerald-500 focus:ring-1 hover:dark:bg-stone-700 invalid:border-red-500 focus:invalid:border-red-500 invalid:text-red-500 focus:invalid:ring-red-500"
                value={value as string}
                pattern="^[\-+]?([1-8]?\d(\.\d+)?|90(.0+)?),\s*[\-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$"
                placeholder={initialValue}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setActive(false);
                    setValue(initialValue);
                    ref.current?.parentElement?.focus();
                  } else if (e.key === "Enter") {
                    setActive(false);
                    onChange?.(value);
                    ref.current?.parentElement?.focus();
                  } else {
                    e.stopPropagation();
                  }
                }}
                onBlur={() => {
                  setValue(initialValue);
                }}
                {...props}
              />
            </div>
            <div className="relative p-2">
              <Map center={position} className="w-64 h-64">
                <DraggableMarker
                  center={position}
                  updateOnChange
                  onChange={(position) => {
                    if (position.lat == null || position.lng == null) return;
                    if (isNaN(position.lat) || isNaN(position.lng)) return;
                    const value = `${position.lat.toFixed(
                      5,
                    )}, ${position.lng.toFixed(5)}`;
                    setValue(value);
                    onChange?.(value);
                  }}
                />
              </Map>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
