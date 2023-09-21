import { useEffect } from "react";
import { off, on } from "react-use/lib/misc/util";
import { type RefObject } from "react";

import { type Dimensions, type Position } from "@/utils/types";

export type ClickFn = ({
  position,
  dimensions,
}: {
  position: Position;
  dimensions: Dimensions;
}) => void;

export default function useClick({
  ref,
  onClick,
  onDblClick,
}: {
  ref: RefObject<Element>;
  onClick?: ClickFn;
  onDblClick?: ClickFn;
}) {
  // Register on click handler
  useEffect(() => {
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
  }, [ref, onClick, onDblClick]);
}
