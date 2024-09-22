import { type ComponentProps, type ReactNode } from "react";

import Button from "@/lib/components/ui/Button";
import Dialog from "@/lib/components/ui/Dialog";

/**
 * An alert dialog component that provides a simple way to display a message with a title and a close button.
 */
export default function Alert({
  children,
  title,
  button = "Open",
  ...rest
}: {
  /** A function that renders the content of the alert. This function
   * receives a `close` function that can be used to programmatically close
   * the alert. */
  children: ({ close }: { close: () => void }) => ReactNode;
  /** The title of the alert dialog. */
  title: ReactNode;
  /** The text or content of the button that triggers the opening of the dialog. */
  button: ReactNode;
} & Omit<ComponentProps<typeof Button>, "onClick" | "title" | "children">) {
  return (
    <Dialog title={title} label={button} {...rest}>
      {children}
    </Dialog>
  );
}
