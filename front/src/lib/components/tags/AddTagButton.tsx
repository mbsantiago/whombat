import { memo, type ComponentProps, type FC } from "react";
import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";

import Button from "@/lib/components/ui/Button";
import { AddIcon } from "@/lib/components/icons";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";

const AddTagButton = memo(function AddTagButton({
  text = "add",
  variant = "secondary",
  placement = "bottom-start",
  onKeyDown,
  TagSearchBar = TagSearchBarBase,
  ...props
}: {
  text?: string;
  placement?: ComponentProps<typeof Float>["placement"];
  variant?: "primary" | "secondary" | "danger";
  TagSearchBar?: FC<TagSearchBarProps>;
} & TagSearchBarProps) {
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
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  close();
                  return;
                }
                onKeyDown?.(event);
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
