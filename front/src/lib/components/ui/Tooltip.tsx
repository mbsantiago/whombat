import { cloneElement, isValidElement, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Overlay, useOverlayPosition } from "react-aria";
import type { Placement } from "react-aria";

export default function Tooltip({
  children,
  tooltip,
  placement = "right",
  offset = 8,
}: {
  children: ReactNode;
  tooltip: ReactNode;
  /** Kept for callers; React Aria flips when the preferred placement cannot fit. */
  autoPlacement?: boolean;
  placement?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-start"
    | "top-end"
    | "right-start"
    | "right-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end";
  offset?: number;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isOpen = hovered || focused;
  const { overlayProps } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef,
    placement: placement.replace("-", " ") as Placement,
    offset,
    isOpen,
  });
  const trigger = isValidElement<{ "aria-describedby"?: string }>(children)
    ? cloneElement(children, {
        "aria-describedby":
          [children.props["aria-describedby"], isOpen ? id : null]
            .filter(Boolean)
            .join(" ") || undefined,
      })
    : children;

  return (
    <>
      <span
        ref={triggerRef}
        className="max-w-fit"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {trigger}
      </span>
      {isOpen && (
        <Overlay>
          <div
            {...overlayProps}
            ref={overlayRef}
            id={id}
            role="tooltip"
            className="z-50 rounded p-2 shadow-lg bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-400 text-sm pointer-events-none"
          >
            {tooltip}
          </div>
        </Overlay>
      )}
    </>
  );
}
