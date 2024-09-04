import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";

import LocationInput, { formatLocation } from "@/components/inputs/Location";
import { EditIcon } from "@/components/icons";

import type { Location } from "@/components/inputs/Location";

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

export default function TableMap({
  value: initialValue,
  onChange,
}: {
  value: Location;
  onChange?: (value: Location) => void;
}) {
  return (
    <Popover className="flex relative flex-row w-100">
      <Float
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
        placement="bottom"
        offset={4}
        portal={true}
      >
        <Popover.Button className="flex flex-row gap-2 justify-between items-center px-1 text-center grow">
          <span>{formatLocation(initialValue)}</span>
          <EditIcon className="inline-block flex-none w-5 h-5 text-stone-500" />
        </Popover.Button>
        <Popover.Panel
          unmount
          className="absolute left-1/2 z-40 px-4 mt-3 transform -translate-x-1/2 sm:px-0 lg:max-w-3xl"
        >
          <div className="dark:bg-stone-800 bg-stone-200 w-80 border border-stone-300 dark:border-stone-700 border-1 p-2 rounded-md">
            <LocationInput value={initialValue} onChange={onChange} />
          </div>
        </Popover.Panel>
      </Float>
    </Popover>
  );
}
