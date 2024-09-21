import { AddIcon } from "@/lib/components/icons";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import Button from "@/lib/components/ui/Button";
import { Float } from "@headlessui-float/react";
import { Popover } from "@headlessui/react";
import { type ComponentProps, type FC, memo } from "react";

/**
 * AddTagButton Component
 *
 * This component renders a button that, when clicked, opens a popover
 * containing a tag search bar.
 *
 * It is possible to use a custom tag search bar by passing the `TagSearchBar`
 * prop. The custom tag search bar must accept the same props
 * as the `TagSearchBarBase` component. This is useful when you want to
 * customize the tag search bar with hooks or other logic.
 *
 * Example usage:
 *
 * ```tsx
 * <AddTagButton
 *   text="Add Tag"
 *   variant="primary"
 *   placement="top-end"
 *   TagSearchBar={(props) => <CustomTagBarWithHooks {...props} />}
 * />
 * ```
 */
const AddTagButton = memo(function AddTagButton({
  text = "add",
  variant = "secondary",
  placement = "bottom-start",
  onKeyDown,
  TagSearchBar = TagSearchBarBase,
  ...props
}: {
  /** The text to display inside the button. */
  text?: string;
  /** The placement of the popover relative to the button. */
  placement?: ComponentProps<typeof Float>["placement"];
  /** The variant of the button. */
  variant?: "primary" | "secondary" | "danger";
  /** The tag search bar component to render inside the popover. */
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
