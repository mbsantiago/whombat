import classnames from "classnames";
import NextLink from "next/link";

import { getButtonClassName } from "@/components/Button";

import type { Mode, Variant } from "@/components/common";
import type { ComponentProps, ReactNode } from "react";

export default function Link({
  children,
  variant = "primary",
  mode = "filled",
  padding = "p-2.5",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  mode?: Mode;
  padding?: string;
  className?: string;
} & Omit<ComponentProps<typeof NextLink>, "className">) {
  const baseClass = getButtonClassName({ variant, mode, padding });
  return (
    <NextLink {...props} className={classnames(baseClass, className)}>
      {children}
    </NextLink>
  );
}
