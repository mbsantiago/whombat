import { type ReactNode, type ComponentProps } from "react";
import { useState } from "react";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";

export default function Alert({
  children,
  title,
  button = "Open",
  ...rest
}: {
  children: ({ close }: { close: () => void }) => ReactNode;
  title: ReactNode;
  button: ReactNode;
} & Omit<ComponentProps<typeof Button>, "onClick" | "title" | "children">) {
  let [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...rest}>
        {button}
      </Button>
      <Dialog
        title={<div className="max-w-md">{title}</div>}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {({ close }) => <div className="max-w-md">{children({ close })}</div>}
      </Dialog>
    </>
  );
}
