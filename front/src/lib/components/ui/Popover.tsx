import { Float } from "@headlessui-float/react";
import { Popover as HeadlessPopover } from "@headlessui/react";
import type { ReactElement, ReactNode } from "react";

export default function Popover({
  button,
  children,
  placement = "bottom",
  offset = 4,
  autoPlacement = false,
}: {
  button: ReactNode;
  children: ({ close }: { close: () => void }) => ReactElement;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end"
    | "right-start"
    | "right-end";
  autoPlacement?: boolean;
  offset?: number;
}) {
  return (
    <HeadlessPopover as="div" className="inline-block text-left">
      <Float
        zIndex={10}
        placement={placement}
        offset={offset}
        enter="transition duration-200 ease-out"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-150 ease-in"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
        portal={true}
        autoPlacement={autoPlacement}
      >
        <HeadlessPopover.Button as="div">{button}</HeadlessPopover.Button>
        <HeadlessPopover.Panel className="w-72" focus unmount>
          {({ close }) => children({ close })}
        </HeadlessPopover.Panel>
      </Float>
    </HeadlessPopover>
  );
}
