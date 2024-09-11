import { memo } from "react";
import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";

import Button from "@/lib/components/ui/Button";
import { AddIcon } from "@/lib/components/icons";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";

import type { ComponentProps } from "react";

const AddTagButton = memo(function AddTagButton({
  text = "add",
  variant = "secondary",
  placement = "bottom-start",
  autoFocus = true,
  onKeyDown,
  ...props
}: {
  text?: string;
  placement?: ComponentProps<typeof Float>["placement"];
  variant?: "primary" | "secondary" | "danger";
} & ComponentProps<typeof TagSearchBar>) {
  return (
    <Popover as="div" className="inline-block text-left">
      <Float
        zIndex={20}
        placement={placement}
        offset={4}
        enter="transition duration-200 ease-out"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-150 ease-in"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
        portal={true}
      >
        <Popover.Button as="div">
          <Button mode="text" variant={variant} padding="py-1">
            <AddIcon className="inline-block w-5 h-5 align-middle" />
            {text}
          </Button>
        </Popover.Button>
        <Popover.Panel className="w-72" focus>
          {({ close }) => (
            <TagSearchBar
              autoFocus={autoFocus}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  close();
                } else if (e.key === "Enter") {
                  close();
                }

                onKeyDown?.(e);
              }}
              {...props}
            />
          )}
        </Popover.Panel>
      </Float>
    </Popover>
  );
});

export default AddTagButton;
