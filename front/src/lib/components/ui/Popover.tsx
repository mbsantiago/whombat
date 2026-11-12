import { Popover as HeadlessPopover } from "@headlessui/react";
import type { ComponentProps, ReactElement, ReactNode } from "react";

type Anchor = Extract<
  NonNullable<ComponentProps<typeof HeadlessPopover.Panel>["anchor"]>,
  string
>;

export default function Popover({
  button,
  children,
  placement = "bottom",
  offset = 4,
}: {
  button: ReactNode;
  children: ({ close }: { close: () => void }) => ReactElement<any>;
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
  offset?: number;
}) {
  return (
    <HeadlessPopover as="div" className="inline-block text-left">
      <HeadlessPopover.Button as="div">{button}</HeadlessPopover.Button>
      <HeadlessPopover.Panel
        anchor={{ to: placement.replace("-", " ") as Anchor, gap: offset }}
        className="z-10 w-72 transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0"
        focus
        unmount
        transition
      >
        {({ close }) => children({ close })}
      </HeadlessPopover.Panel>
    </HeadlessPopover>
  );
}
