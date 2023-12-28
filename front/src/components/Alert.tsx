import { type ComponentProps, type ReactNode } from "react";
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
  return (
    <Dialog title={title} label={button} {...rest}>
      {children}
    </Dialog>
  );
}
