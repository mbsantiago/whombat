import { type ReactNode, type HTMLAttributes } from "react";
import classnames from "classnames";

function H1({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={classnames(
        "text-3xl font-bold text-stone-900 dark:text-stone-200",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export { H1 };
