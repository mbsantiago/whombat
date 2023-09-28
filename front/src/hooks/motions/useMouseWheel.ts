import { type RefObject, useEffect } from "react";
import { off, on } from "react-use/lib/misc/util";

export type ScrollState = {
  deltaY: number;
  deltaX: number;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  input: boolean;
};

/** Returns the current mouse wheel state.
 * Note that this only listens for the mouse wheel event when the shift key is
 * pressed.
 * @param ref - The ref of the element to attach the event listener to
 * @param preventDefault - Whether to prevent the default behavior of the event
 * @returns The current mouse wheel state
 */
export default function useMouseWheel({
  ref,
  preventDefault = true,
  onScroll,
}: {
  ref: RefObject<HTMLElement>;
  preventDefault?: boolean;
  onScroll?: (state: ScrollState) => void;
}) {
  useEffect(() => {
    const element = ref.current;
    const updateScroll = (e: WheelEvent) => {
      if (e.shiftKey || e.ctrlKey || e.altKey) {
        onScroll?.({
          deltaY: e.deltaY,
          deltaX: e.deltaX,
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
          alt: e.altKey,
          input: e.target instanceof HTMLInputElement,
        });
        if (preventDefault) {
          e.preventDefault();
        }
      }
    };
    on(element, "wheel", updateScroll, false);
    return () => off(element, "wheel", updateScroll);
  });
}
