import { useEffect } from "react";
import useRafState from "react-use/lib/useRafState";
import { off, on } from "react-use/lib/misc/util";
import { type RefObject } from "react";
import { type Dimensions, type Position } from "@/utils/types";

export interface State {
  docX: number;
  docY: number;
  posX: number;
  posY: number;
  elX: number;
  elY: number;
  elH: number;
  elW: number;
}

export type ClickFn = ({
  position,
  dimensions,
}: {
  position: Position;
  dimensions: Dimensions;
}) => void;

export default function useMouse({
  ref,
  active = true,
  onClick,
  onDblClick,
}: {
  ref: RefObject<Element>;
  active?: boolean;
  onClick?: ClickFn;
  onDblClick?: ClickFn;
}) {
  const [state, setState] = useRafState<State>({
    docX: 0,
    docY: 0,
    posX: 0,
    posY: 0,
    elX: 0,
    elY: 0,
    elH: 0,
    elW: 0,
  });

  // Register on move handler
  useEffect(() => {
    if (!active) return;

    const moveHandler = (event: MouseEvent) => {
      if (ref && ref.current) {
        const {
          left,
          top,
          width: elW,
          height: elH,
        } = ref.current.getBoundingClientRect();
        const posX = left + window.scrollX;
        const posY = top + window.scrollY;
        const elX = event.pageX - posX;
        const elY = event.pageY - posY;

        setState({
          docX: event.pageX,
          docY: event.pageY,
          posX,
          posY,
          elX,
          elY,
          elH,
          elW,
        });
      }
    };

    on(document, "mousemove", moveHandler);

    return () => {
      off(document, "mousemove", moveHandler);
    };
  }, [ref, active]);

  // Register on click handler
  useEffect(() => {
    if (!active) return;
    let timer = 0;

    const clickHandler = (event: MouseEvent) => {
      if (ref && ref.current) {
        const {
          left,
          top,
          width: elW,
          height: elH,
        } = ref.current.getBoundingClientRect();
        const posX = left + window.scrollX;
        const posY = top + window.scrollY;
        const elX = event.pageX - posX;
        const elY = event.pageY - posY;

        switch (event.detail) {
          case 1:
            // @ts-ignore
            timer = setTimeout(() => {
              onClick?.({
                position: [elX, elY],
                dimensions: {
                  width: elW,
                  height: elH,
                },
              });
            }, 200);
            break;
          case 2:
            clearTimeout(timer);
            onDblClick?.({
              position: [elX, elY],
              dimensions: {
                width: elW,
                height: elH,
              },
            });
            break;
        }
      }
    };

    on(document, "click", clickHandler);

    return () => {
      off(document, "click", clickHandler);
    };
  }, [ref, active, onClick]);

  return state;
}
