import classnames from "classnames";

import type { HTMLAttributes, ReactNode } from "react";

export function H1({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={classnames(
        "text-2xl font-bold text-stone-900 dark:text-stone-200",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={classnames(
        "text-xl font-bold text-stone-900 dark:text-stone-200",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={classnames(
        "text-lg font-semibold leading-7 items-center text-stone-900 dark:text-stone-200",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({
  children,
  className,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={classnames(
        "text-md font-semibold leading-6 text-stone-900 dark:text-stone-200",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
}
