import { Popover } from "@headlessui/react";
import { type ComponentProps, type FC, memo } from "react";

type Anchor = Extract<
  NonNullable<ComponentProps<typeof Popover.Panel>["anchor"]>,
  string
>;

import { AddIcon } from "@/lib/components/icons";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import Button from "@/lib/components/ui/Button";

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
  placement?: TagSearchBarProps["placement"];
  /** The variant of the button. */
  variant?: "primary" | "secondary" | "danger";
  /** The tag search bar component to render inside the popover. */
  TagSearchBar?: FC<TagSearchBarProps>;
} & TagSearchBarProps) {
  return (
    <Popover as="div" className="inline-block text-left">
      <Popover.Button as="div">
        <Button mode="text" variant={variant} padding="py-1">
          <AddIcon className="inline-block w-5 h-5 align-middle" />
          {text}
        </Button>
      </Popover.Button>
      <Popover.Panel
        anchor={{ to: placement.replace("-", " ") as Anchor, gap: 4 }}
        className="z-20 w-72 transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0"
        focus
        transition
      >
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
    </Popover>
  );
});

export default AddTagButton;
