import { type ReactNode, cloneElement, useRef } from "react";
import {
  DismissButton,
  Overlay,
  useButton,
  useOverlayTrigger,
  usePopover,
} from "react-aria";
import type { AriaPopoverProps, PositionProps } from "react-aria";
import type { OverlayTriggerProps, OverlayTriggerState } from "react-stately";
import { useOverlayTriggerState } from "react-stately";

import Button from "@/lib/components/ui/Button";

import "./Popover.css";

export function Popover({
  children,
  state,
  offset = 8,
  ...props
}: {
  children: ReactNode;
  state: OverlayTriggerState;
} & AriaPopoverProps) {
  let { popoverProps, underlayProps, arrowProps, placement } = usePopover(
    {
      ...props,
      offset,
    },
    state,
  );

  return (
    <Overlay>
      <div {...underlayProps} className="fixed inset-0" />
      <div
        {...popoverProps}
        ref={props.popoverRef as React.RefObject<HTMLDivElement>}
        className="p-2 rounded border shadow-lg bg-stone-100 border-stone-200 text-stone-800 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
      >
        <svg
          {...arrowProps}
          className="absolute w-3 h-3 bg-transparent stroke-1 arrow fill-stone-100 stroke-stone-200 dark:fill-stone-800 dark:stroke-stone-700"
          data-placement={placement}
          viewBox="0 0 12 12"
        >
          <path d="M0 0 L6 6 L12 0" />
        </svg>
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </div>
    </Overlay>
  );
}

export default function PopoverTrigger({
  label,
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  ...props
}: {
  label: string;
  children: Parameters<typeof cloneElement>[0];
} & OverlayTriggerProps &
  PositionProps) {
  let ref = useRef(null);
  let popoverRef = useRef(null);
  let state = useOverlayTriggerState({
    isOpen,
    defaultOpen,
    onOpenChange,
  });
  let { triggerProps, overlayProps } = useOverlayTrigger(
    { type: "dialog" },
    state,
    ref,
  );
  let { buttonProps } = useButton(triggerProps, ref);
  return (
    <>
      <Button {...buttonProps} ref={ref}>
        {label}
      </Button>
      {state.isOpen && (
        <Popover
          {...props}
          popoverRef={popoverRef}
          triggerRef={ref}
          state={state}
        >
          {cloneElement(children, overlayProps)}
        </Popover>
      )}
    </>
  );
}
