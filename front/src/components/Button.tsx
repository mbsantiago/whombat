import { type ReactNode, type ButtonHTMLAttributes } from "react";
import classnames from "classnames";
import type { Variant } from "@/components/common";

type Mode = "filled" | "outline" | "text";

const CLASS_NAMES = {
  filled: {
    primary:
      "border-emerald-500 bg-emerald-300 hover:bg-emerald-500 focus:ring-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800 disabled:bg-emerald-300 dark:disabled:bg-emerald-700",
    secondary:
      "border-stone-300 dark:border-stone-600 bg-stone-100 hover:bg-stone-200 focus:ring-stone-300 dark:bg-stone-700 dark:hover:bg-stone-800 dark:focus:ring-stone-800 disabled:bg-stone-300 dark:disabled:bg-stone-700 dark:text-stone-200",
    danger:
      "border-rose-500 bg-rose-700 hover:bg-rose-800 focus:ring-rose-300 dark:bg-rose-600 dark:hover:bg-rose-700 dark:focus:ring-rose-800 disabled:bg-rose-300 dark:disabled:bg-rose-700",
    success:
      "border-green-500 bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 disabled:bg-green-300 dark:disabled:bg-green-700",
    warning:
      "border-yellow-500 bg-yellow-700 hover:bg-yellow-800 focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800 disabled:bg-yellow-300 dark:disabled:bg-yellow-700",
    info: "border-blue-500 bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:bg-blue-300 dark:disabled:bg-blue-700",
    common:
      "border text-stone-900 dark:text-stone-100 disabled:text-stone-500 dark:disabled:text-stone-300",
  },
  outline: {
    primary:
      "border-emerald-500 hover:bg-emerald-300 focus:ring-emerald-300 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800",
    secondary:
      "border-stone-500 hover:bg-stone-300 focus:ring-stone-300 dark:hover:bg-stone-700 dark:focus:ring-stone-800",
    danger:
      "border-rose-500 hover:bg-rose-300 focus:ring-rose-300 dark:hover:bg-rose-700 dark:focus:ring-rose-800",
    success:
      "border-green-500 hover:bg-green-300 focus:ring-green-300 dark:hover:bg-green-700 dark:focus:ring-green-800",
    warning:
      "border-yellow-500 hover:bg-yellow-300 focus:ring-yellow-300 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800",
    info: "border-blue-500 hover:bg-blue-300 focus:ring-blue-300 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
    common: "border bg-transparent text-stone-900 dark:text-stone-100",
  },
  text: {
    primary:
      "text-emerald-500 focus:ring-emerald-300 dark:focus:ring-emerald-800 stroke-emerald-500 hover:stroke-emerald-300 dark:hover:stroke-emerald-800",
    secondary:
      "text-stone-500 focus:ring-stone-300 dark:focus:ring-stone-800 stroke-stone-500 hover:stroke-stone-800 dark:hover:stroke-stone-300 disabled:stroke-stone-500 dark:disabled:stroke-stone-500",
    danger:
      "text-rose-500 focus:ring-rose-300 dark:focus:ring-rose-800 stroke-rose-500 hover:stroke-rose-300 dark:hover:stroke-rose-800",
    success:
      "text-green-500 focus:ring-green-300 dark:focus:ring-green-800 stroke-green-500 hover:stroke-green-300 dark:hover:stroke-green-800",
    warning:
      "text-yellow-500 focus:ring-yellow-300 dark:focus:ring-yellow-800 stroke-yellow-500 hover:stroke-yellow-300 dark:hover:stroke-yellow-800",
    info: "text-blue-500 focus:ring-blue-300 dark:focus:ring-blue-800 stroke-blue-500 hover:stroke-blue-300 dark:hover:stroke-blue-800",
    common:
      "bg-transparent hover:underline hover:decoration-solid hover:decoration-2 hover:underline-offset-2 hover:font-extrabold disabled:no-underline disabled:font-medium stroke-2 hover:stroke-4 disabled:stroke-1",
  },
};

export default function Button({
  children,
  variant = "primary",
  mode = "filled",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  mode?: Mode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classnames(
        CLASS_NAMES[mode][variant],
        CLASS_NAMES[mode]["common"],
        "flex flex-row items-center rounded-lg p-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
