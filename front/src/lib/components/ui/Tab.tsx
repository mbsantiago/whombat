import classnames from "classnames";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const BASE_CLASS =
  "whitespace-nowrap rounded-lg bg-stone-50 p-2 text-center text-sm font-medium dark:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 flex gap-1 items-center";

const ACTIVE_CLASS = "text-emerald-500";

const INACTIVE_CLASS =
  "text-stone-700 hover:bg-stone-200 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-300";

export default function Tab({
  children,
  active = false,
  className,
  ...props
}: {
  children: ReactNode;
  active?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classnames(
        BASE_CLASS,
        active ? ACTIVE_CLASS : INACTIVE_CLASS,
        className,
      )}
    >
      {children}
    </button>
  );
}
