import { type RefObject, useEffect, useState } from "react";
import { off, on } from "react-use/lib/misc/util";

export type ScrollState = {
  deltaY: number;
  deltaX: number;
  eventNum: number;
};

/** Returns the current mouse wheel state.
 * Note that this only listens for the mouse wheel event when the shift key is
 * pressed.
 * @param ref - The ref of the element to attach the event listener to
 * @param preventDefault - Whether to prevent the default behavior of the event
 * @returns The current mouse wheel state
 */
export default function useMouseWheel(
  ref: RefObject<HTMLElement>,
  preventDefault: boolean = true,
): ScrollState {
  const [deltaY, setDeltaY] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [eventNum, setEventNum] = useState(0);

  useEffect(() => {
    const element = ref.current;
    const updateScroll = (e: WheelEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey) {
        setDeltaY(e.deltaY);
        setDeltaX(e.deltaX);
        setEventNum((prev) => (prev + 1) % 100);
        if (preventDefault) {
          e.preventDefault();
        }
      }
    };
    on(element, "wheel", updateScroll, false);
    return () => off(element, "wheel", updateScroll);
  });

  return {
    deltaY,
    deltaX,
    eventNum,
  };
}
