import {
  type MouseEvent,
  type RefObject,
  type TouchEvent,
  useEffect,
  useRef,
} from "react";
import { useLatest, useRafState } from "react-use";
import { off, on } from "react-use/lib/misc/util";

export interface useScratchParams {
  active?: boolean;
  ref: RefObject<HTMLElement>;
  onScratch?: (state: ScratchState) => void;
  onScratchStart?: (state: ScratchState) => void;
  onScratchEnd?: (state: ScratchState) => void;
}

export interface ScratchState {
  isScratching: boolean;
  start?: number;
  end?: number;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  docX?: number;
  docY?: number;
  posX?: number;
  posY?: number;
  elH?: number;
  elW?: number;
  elX?: number;
  elY?: number;
}

export default function useScratch({
  active = true,
  ref,
  ...params
}: useScratchParams): ScratchState {
  // Always up-to-date reference to the function params
  const paramsRef = useLatest(params);

  const [state, setState] = useRafState<ScratchState>({
    isScratching: false,
  });

  const refState = useRef<ScratchState>(state);
  const refScratching = useRef<boolean>(false);

  useEffect(() => {
    if (!active) return;
    if (ref == null || ref.current == null) return;

    const el = ref.current;

    const onMoveEvent = (docX: number, docY: number) => {
      const { left, top } = el.getBoundingClientRect();
      const elX = left + window.scrollX;
      const elY = top + window.scrollY;
      const x = docX - elX;
      const y = docY - elY;
      setState((oldState) => {
        const newState = {
          ...oldState,
          dx: x - (oldState.x || 0),
          dy: y - (oldState.y || 0),
          end: Date.now(),
          isScratching: true,
        };
        refState.current = newState;
        paramsRef.current.onScratch?.(newState);
        return newState;
      });
    };

    const onMouseMove = (event: MouseEvent) => {
      onMoveEvent(event.pageX, event.pageY);
    };

    const onTouchMove = (event: TouchEvent) => {
      onMoveEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    };

    let onMouseUp: () => void;
    let onTouchEnd: () => void;

    const stopScratching = () => {
      if (!refScratching.current) return;
      refScratching.current = false;
      refState.current = { ...refState.current, isScratching: false };
      paramsRef.current.onScratchEnd?.(refState.current);
      setState({ isScratching: false });
      off(window, "mousemove", onMouseMove);
      off(window, "touchmove", onTouchMove);
      off(window, "mouseup", onMouseUp);
      off(window, "touchend", onTouchEnd);
    };

    onMouseUp = stopScratching;
    onTouchEnd = stopScratching;

    const startScratching = (docX: number, docY: number) => {
      if (!refScratching.current) return;
      const { left, top } = el.getBoundingClientRect();
      const elX = left + window.scrollX;
      const elY = top + window.scrollY;
      const x = docX - elX;
      const y = docY - elY;
      const time = Date.now();
      const newState = {
        isScratching: true,
        start: time,
        end: time,
        docX,
        docY,
        x,
        y,
        dx: 0,
        dy: 0,
        elH: ref.current?.offsetHeight ?? 0,
        elW: ref.current?.offsetWidth ?? 0,
        elX,
        elY,
      };
      refState.current = newState;
      paramsRef.current.onScratchStart?.(newState);
      setState(newState);
      on(window, "mousemove", onMouseMove);
      on(window, "touchmove", onTouchMove);
      on(window, "mouseup", onMouseUp);
      on(window, "touchend", onTouchEnd);
    };

    const onMouseDown = (event: MouseEvent) => {
      refScratching.current = true;
      startScratching(event.pageX, event.pageY);
    };

    const onTouchStart = (event: TouchEvent) => {
      refScratching.current = true;
      startScratching(
        event.changedTouches[0].pageX,
        event.changedTouches[0].pageY,
      );
    };

    on(el, "mousedown", onMouseDown);
    on(el, "touchstart", onTouchStart);

    return () => {
      off(el, "mousedown", onMouseDown);
      off(el, "touchstart", onTouchStart);
      off(window, "mousemove", onMouseMove);
      off(window, "touchmove", onTouchMove);
      off(window, "mouseup", onMouseUp);
      off(window, "touchend", onTouchEnd);

      refScratching.current = false;
      refState.current = { isScratching: false };
      setState(refState.current);
    };
  }, [ref, active, paramsRef, setState]);

  return state;
}
