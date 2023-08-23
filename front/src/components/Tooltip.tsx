import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import { Fragment, useState, type ReactNode } from "react";

export default function Tooltip({
  children,
  tooltip,
}: {
  children: ReactNode;
  tooltip: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover>
      <Float
        show={open}
        placement="right"
        offset={8}
        enter="transition duration-100 ease-out"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-50 ease-in"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
      >
        <Popover.Button as={Fragment}>
          <div
            onMouseEnter={() => (!open ? setOpen(true) : null)}
            onMouseLeave={() => (open ? setOpen(false) : null)}
          >
            {children}
          </div>
        </Popover.Button>
        <Popover.Panel>{tooltip}</Popover.Panel>
      </Float>
    </Popover>
  );
}
