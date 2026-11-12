import { Popover } from "@headlessui/react";

import { EditIcon } from "@/lib/components/icons";
import LocationInput, {
  formatLocation,
} from "@/lib/components/inputs/Location";
import type { Location } from "@/lib/components/inputs/Location";

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
      <Popover.Button className="flex flex-row gap-2 justify-between items-center px-1 text-center grow">
        <span>{formatLocation(initialValue)}</span>
        <EditIcon className="inline-block flex-none w-5 h-5 text-stone-500" />
      </Popover.Button>
      <Popover.Panel
        anchor={{ to: "bottom", gap: 4 }}
        transition
        unmount
        className="z-40 px-4 transition duration-200 ease-out data-closed:opacity-0 data-closed:translate-y-1 sm:px-0 lg:max-w-3xl"
      >
        <div className="p-2 w-80 rounded-md border bg-stone-200 border-stone-300 border dark:bg-stone-800 dark:border-stone-700">
          <LocationInput value={initialValue} onChange={onChange} />
        </div>
      </Popover.Panel>
    </Popover>
  );
}
