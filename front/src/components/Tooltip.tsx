import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import { Fragment, type ReactNode } from "react";
import { useHover } from "react-use";

export default function Tooltip({
  children,
  tooltip,
  placement = "right",
  offset = 8,
}: {
  children: ReactNode;
  tooltip: ReactNode;
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
  const content = <div className="max-w-fit">{children}</div>;
  const [hoverable, hovered] = useHover(content);

  return (
    <Popover>
      <Float
        show={hovered}
        placement={placement}
        offset={offset}
        enter="transition duration-100 ease-out"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-50 ease-in"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
        flip={true}
      >
        <Popover.Button as={Fragment}>{hoverable}</Popover.Button>
        <Popover.Panel className="rounded p-2 shadow-lg bg-stone-50 dark:bg-stone-700">
          {tooltip}
        </Popover.Panel>
      </Float>
    </Popover>
  );
}
